import { Request, Response, NextFunction } from "express";

/**
 * Centered error handling middleware for consistent and secure JSON error payloads
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // If headers have already been sent to client, delegate to the default express handler
  if (res.headersSent) {
    return next(err);
  }

  // Determine response status code
  let status = err.status || err.statusCode || 500;
  let errorMessage = "Ocorreu um erro interno no servidor do Toque da Lay.";
  let errorCode = "INTERNAL_SERVER_ERROR";

  // Check specifically for Express JSON body payload size limits
  if (err.type === "entity.too.large") {
    status = 413;
    errorMessage = "Essa imagem está pesada demais. Tente enviar uma foto menor.";
    errorCode = "PAYLOAD_TOO_LARGE";
  } else if (err.message && status < 500) {
    // Forward safe non-500 client side errors or custom errors
    errorMessage = err.message;
    errorCode = err.code || "BAD_REQUEST";
  }

  const isProd = process.env.NODE_ENV === "production";

  // Log sanitization: do not output images or raw base64 contents
  console.error(`[Error Handler] [${errorCode}] [Status ${status}]:`, {
    message: err.message || err,
    path: req.path,
    method: req.method,
    stack: isProd ? undefined : err.stack
  });

  return res.status(status).json({
    error: errorMessage,
    code: errorCode,
    ...(isProd ? {} : { stack: err.stack })
  });
}
