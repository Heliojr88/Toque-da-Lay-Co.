import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { validateImageBase64 } from "../utils/validateImage";

// --- Request Validation Zod Schemas ---

export const analyzeImageSchema = z.object({
  imageBase64: z.string().min(1, { message: "O conteúdo da imagem é obrigatório." }),
  fileName: z.string().optional(),
  mimeType: z.string().optional()
});

export const evaluatePurchaseSchema = z.object({
  candidateItem: z.object({
    name: z.string().min(1, { message: "O nome da peça é obrigatório." }),
    category: z.string().min(1, { message: "A categoria é obrigatória." }),
    subcategory: z.string().optional(),
    mainColor: z.string().min(1, { message: "A cor principal é obrigatória." }),
    occasions: z.array(z.string()).default([]),
    styleTags: z.array(z.string()).default([])
  }).passthrough(),
  closetItems: z.array(z.any()).default([]),
  userProfile: z.object({}).catchall(z.any()).optional(),
  price: z.number().optional().nullable(),
  store: z.string().optional().nullable()
});

export const generateTravelPackSchema = z.object({
  destination: z.string().min(1, { message: "O destino da viagem é obrigatório." }),
  days: z.number().optional().default(5),
  climate: z.string().optional().default("frio moderado"),
  closetItems: z.array(z.any()).default([])
});

/**
 * Higher-order middleware function to validate the request body against a Zod schema.
 * Automatically validates base64 content if it's present.
 */
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);

      // Perform deep image payload validation if imageBase64 is passed in the request body
      if (req.body.imageBase64) {
        const imageValidation = validateImageBase64(req.body.imageBase64);
        if (!imageValidation.isValid) {
          return res.status(400).json({ error: imageValidation.error });
        }
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: "Dados inválidos. Confira as informações enviadas.",
          details: err.issues
        });
      }
      return res.status(400).json({
        error: "Dados inválidos. Confira as informações enviadas."
      });
    }
  };
}
