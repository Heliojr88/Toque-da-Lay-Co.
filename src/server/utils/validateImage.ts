export function validateImageBase64(imageBase64: any): { isValid: boolean; error?: string } {
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return { isValid: false, error: "Nenhuma imagem foi recebida ou formato inválido." };
  }

  // Remove any space or padding issues
  const cleanBase64 = imageBase64.trim();
  if (cleanBase64.length === 0) {
    return { isValid: false, error: "O conteúdo da imagem está vazio." };
  }

  // Guess mime type from standard formats
  let mimeType = "";
  const match = cleanBase64.match(/^data:(image\/[a-zA-Z+.-]+);base64,/);
  if (match) {
    mimeType = match[1];
  } else {
    // Basic signature checking for raw base64 if prefix is stripped
    if (cleanBase64.startsWith("/9j/")) {
      mimeType = "image/jpeg";
    } else if (cleanBase64.startsWith("iVBORw")) {
      mimeType = "image/png";
    } else if (cleanBase64.startsWith("UklGR")) {
      mimeType = "image/webp";
    }
  }

  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  
  if (mimeType && !allowedMimeTypes.includes(mimeType)) {
    return { isValid: false, error: "Formato não suportado. Envie uma imagem em JPG, PNG ou WebP." };
  }

  // Calculate approximate file size in bytes from Base64
  const rawBase64 = cleanBase64.replace(/^data:image\/\w+;base64,/, "");
  const sizeInBytes = Math.round((rawBase64.length * 3) / 4);
  const maxBytes = 15 * 1024 * 1024; // 15 MB

  if (sizeInBytes > maxBytes) {
    return { isValid: false, error: "Essa imagem está muito pesada. Tente enviar uma foto menor ou tire outra foto com qualidade normal." };
  }

  if (sizeInBytes < 50) {
    return { isValid: false, error: "Essa imagem está pequena demais para análise. Tente uma foto mais nítida da peça inteira." };
  }

  return { isValid: true };
}
