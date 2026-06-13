import rateLimit from "express-rate-limit";

// Resilient parsing helper to guarantee a valid integer
function parseEnvInt(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value.trim(), 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Rate limiting configurations dynamically loaded from env settings or defaults
const windowMs = parseEnvInt(process.env.API_RATE_LIMIT_WINDOW_MS, 900000); // Default: 15 minutes
const maxApiRequests = parseEnvInt(process.env.API_RATE_LIMIT_MAX, 100);   // Default: 100 requests per 15 minutes
const maxAiRequests = parseEnvInt(process.env.AI_RATE_LIMIT_MAX, 30);     // Default: 30 sensitive requests per 15 mins for MVP

/**
 * Limit for resource/cost intensive AI requests
 */
export const aiRateLimiter = rateLimit({
  windowMs,
  max: maxAiRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente."
  },
  handler: (req, res, next, options) => {
    res.status(429).json({
      error: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente."
    });
  }
});

/**
 * General rate limit for standard/health routes
 */
export const generalRateLimiter = rateLimit({
  windowMs,
  max: maxApiRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente."
  },
  handler: (req, res, next, options) => {
    res.status(429).json({
      error: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente."
    });
  }
});
