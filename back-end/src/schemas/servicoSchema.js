import { z } from "zod";

export const updateServicoSchema = z
  .object({
    nome: z.string().min(2).max(100).optional(),
    duracao_min: z.number().int().positive().max(600).optional(),
    manutencao_dias: z.number().int().min(0).max(365).nullable().optional(),
    ativo: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo informado para atualização",
  });
