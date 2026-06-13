export type ImageProcessingOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputType?: "image/webp" | "image/jpeg" | "image/png";
  generateThumbnail?: boolean;
  thumbnailMaxWidth?: number;
  thumbnailMaxHeight?: number;
};

export type ProcessedImage = {
  dataUrl: string;
  blob: Blob;
  file: File;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  mimeType: string;
  thumbnailDataUrl?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
};

/**
 * Checks if the browser supports WebP format
 */
export function supportsWebP(): boolean {
  try {
    const elem = document.createElement("canvas");
    if (elem.getContext && elem.getContext("2d")) {
      return elem.toDataURL("image/webp").indexOf("data:image/webp") === 0;
    }
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Formats file size in bytes to a human-readable string (e.g. 4.2 MB, 320 KB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Validates file exists, size doesn't exceed limit, and it is a supported image type
 */
export function validateImageFile(file: File | null | undefined): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: "Nenhum arquivo foi recebido." };
  }

  // Check if it's an image
  if (!file.type.startsWith("image/")) {
    return {
      isValid: false,
      error: "Esse arquivo não parece ser uma imagem. Tente enviar uma foto da peça."
    };
  }

  // Supported mime-types
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Formato não suportado. Envie uma imagem em JPG, PNG ou WebP."
    };
  }

  // Maximum file size of 15MB
  const maxBytes = 15 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      isValid: false,
      error: "Essa imagem está muito pesada. Tente enviar uma foto menor ou tire outra foto com qualidade normal."
    };
  }

  return { isValid: true };
}

/**
 * Converts a File element to DataUrl string
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a base64 Data URL to Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(";base64,");
  const contentType = parts[0].split(":")[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Get internal dimension of an image
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Resize and compress any image using the canvas.
 * It corrects orientation automatically when using modern createImageBitmap,
 * and falls back elegantly to standard canvas manipulation with aspect ratio preservation.
 *
 * It is fully asynchronous and does not block the UI thread.
 */
export async function resizeAndCompressImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const originalSize = file.size;
  const originalWidthHeight = await getImageDimensions(file);
  const originalWidth = originalWidthHeight.width;
  const originalHeight = originalWidthHeight.height;

  // Set defaults
  const webpSupported = supportsWebP();
  const defaultMimeType = webpSupported ? "image/webp" : "image/jpeg";
  const outputMime = options.outputType || defaultMimeType;
  const quality = options.quality !== undefined ? options.quality : 0.78;
  const maxWidth = options.maxWidth || 1200;
  const maxHeight = options.maxHeight || 1200;

  // Check if image is too tiny
  if (originalWidth < 80 && originalHeight < 80) {
    throw new Error("Essa imagem está pequena demais para análise. Tente uma foto mais nítida da peça inteira.");
  }

  // Load image source (correct orientation if possible)
  let imgSource: HTMLImageElement | ImageBitmap;
  let sourceWidth = originalWidth;
  let sourceHeight = originalHeight;

  try {
    imgSource = await createImageBitmap(file, { imageOrientation: "from-image" });
    sourceWidth = imgSource.width;
    sourceHeight = imgSource.height;
  } catch (bitmapError) {
    console.warn("createImageBitmap with orientation orientation fallback to standard Image due to compatibility:", bitmapError);
    // Fallback loading via normal Image
    imgSource = await new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(new Error("Não consegui preparar essa imagem. Tente outra foto com boa luz e fundo mais limpo."));
      };
      img.src = url;
    });
    sourceWidth = (imgSource as HTMLImageElement).naturalWidth;
    sourceHeight = (imgSource as HTMLImageElement).naturalHeight;
  }

  // Calculate new constrained dimensions preserving ratio
  let targetWidth = sourceWidth;
  let targetHeight = sourceHeight;

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  // Draw main image on hidden canvas
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Não foi possível inicializar ambiente gráfico no navegador.");
  }

  // Adjust transparency context for PNG/JPEG conversions
  if (outputMime === "image/jpeg") {
    ctx.fillStyle = "#FAF8F5"; // Warm white background that blends beautifully with Lay's branding
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Draw the image
  ctx.drawImage(imgSource, 0, 0, targetWidth, targetHeight);

  // Generate Data URL & Blob
  let dataUrl = "";
  let compressedBlob: Blob | null = null;

  if (canvas.toBlob) {
    compressedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), outputMime, quality);
    });
  }

  if (compressedBlob) {
    dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(compressedBlob!);
    });
  } else {
    // Elegant fallback if toBlob not supported
    dataUrl = canvas.toDataURL(outputMime, quality);
    compressedBlob = dataUrlToBlob(dataUrl);
  }

  const finalSize = compressedBlob.size;
  const compressionRatio = parseFloat(((originalSize - finalSize) / originalSize).toFixed(4));

  // Build compressed File object
  const cleanFileName = file.name.replace(/\.[^/.]+$/, "") + (outputMime === "image/webp" ? ".webp" : ".jpg");
  const compressedFile = new File([compressedBlob], cleanFileName, { type: outputMime });

  // Optional: Generate thumbnail
  let thumbnailDataUrl: string | undefined;
  let thumbnailWidth: number | undefined;
  let thumbnailHeight: number | undefined;

  if (options.generateThumbnail) {
    const thumbMaxW = options.thumbnailMaxWidth || 400;
    const thumbMaxH = options.thumbnailMaxHeight || 400;
    
    let thumbW = sourceWidth;
    let thumbH = sourceHeight;

    if (thumbW > thumbMaxW || thumbH > thumbMaxH) {
      const ratio = Math.min(thumbMaxW / thumbW, thumbMaxH / thumbH);
      thumbW = Math.round(thumbW * ratio);
      thumbH = Math.round(thumbH * ratio);
    }

    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = thumbW;
    thumbCanvas.height = thumbH;
    const thumbCtx = thumbCanvas.getContext("2d");

    if (thumbCtx) {
      if (outputMime === "image/jpeg") {
        thumbCtx.fillStyle = "#FAF8F5";
        thumbCtx.fillRect(0, 0, thumbW, thumbH);
      }
      thumbCtx.drawImage(imgSource, 0, 0, thumbW, thumbH);
      
      thumbnailWidth = thumbW;
      thumbnailHeight = thumbH;
      thumbnailDataUrl = thumbCanvas.toDataURL("image/webp", 0.7); // Highly efficient WebP thumbnail
    }
  }

  // Clean memory allocated for bitmap
  if (imgSource instanceof ImageBitmap) {
    imgSource.close();
  }

  return {
    dataUrl,
    blob: compressedBlob,
    file: compressedFile,
    width: targetWidth,
    height: targetHeight,
    originalSize,
    compressedSize: finalSize,
    compressionRatio: compressionRatio > 0 ? compressionRatio : 0,
    mimeType: outputMime,
    thumbnailDataUrl,
    thumbnailWidth,
    thumbnailHeight
  };
}

/**
 * Creates a thumbnail from a File or Data URL string
 */
export async function createThumbnail(
  fileOrDataUrl: File | string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    outputType?: "image/webp" | "image/jpeg" | "image/png";
  } = {}
): Promise<string> {
  const maxWidth = options.maxWidth || 400;
  const maxHeight = options.maxHeight || 400;
  const quality = options.quality !== undefined ? options.quality : 0.7;
  const outputMime = options.outputType || (supportsWebP() ? "image/webp" : "image/jpeg");

  let imgSource: HTMLImageElement | ImageBitmap;
  let sourceWidth = 0;
  let sourceHeight = 0;

  if (fileOrDataUrl instanceof File) {
    try {
      imgSource = await createImageBitmap(fileOrDataUrl, { imageOrientation: "from-image" });
      sourceWidth = imgSource.width;
      sourceHeight = imgSource.height;
    } catch {
      // Fallback to normal Image
      const url = URL.createObjectURL(fileOrDataUrl);
      imgSource = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Erro ao carregar imagem para thumbnail."));
        };
        img.src = url;
      });
      sourceWidth = (imgSource as HTMLImageElement).naturalWidth;
      sourceHeight = (imgSource as HTMLImageElement).naturalHeight;
    }
  } else {
    // It's a base64 or url string
    imgSource = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Erro ao carregar string de imagem para thumbnail."));
      img.src = fileOrDataUrl;
    });
    sourceWidth = (imgSource as HTMLImageElement).naturalWidth;
    sourceHeight = (imgSource as HTMLImageElement).naturalHeight;
  }

  let targetWidth = sourceWidth;
  let targetHeight = sourceHeight;

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Erro ao obter contexto do canvas.");
  }

  if (outputMime === "image/jpeg") {
    ctx.fillStyle = "#FAF8F5";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(imgSource, 0, 0, targetWidth, targetHeight);

  const thumbUrl = canvas.toDataURL(outputMime, quality);

  if (imgSource instanceof ImageBitmap) {
    imgSource.close();
  }

  return thumbUrl;
}

