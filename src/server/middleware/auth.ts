import { Request, Response, NextFunction } from "express";

/**
 * Validates the demo or future JWT auth token
 */
export function verifyAuthToken(token: string): boolean {
  const demoToken = process.env.DEMO_AUTH_TOKEN || "dev-token-change-me";
  
  if (process.env.NODE_ENV === "production" && (demoToken === "dev-token-change-me" || !process.env.DEMO_AUTH_TOKEN)) {
    console.warn("⚠️ [Segurança] Atenção: autenticação real não configurada. Não publique em produção assim.");
  }
  
  return token === demoToken;
}

/**
 * Express middleware to enforce authentication rules for sensitive routes
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: "Não autorizado. Faça login para continuar."
    });
  }
  
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      error: "Não autorizado. Faça login para continuar."
    });
  }
  
  const token = parts[1];
  const isValid = verifyAuthToken(token);
  
  if (!isValid) {
    return res.status(403).json({
      error: "Sessão inválida ou expirada."
    });
  }
  
  next();
}
