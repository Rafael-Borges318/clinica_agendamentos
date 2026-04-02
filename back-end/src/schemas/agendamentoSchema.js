import { z } from "zod";

export const uuidSchema = z.string().uuid("ID inválido");

export const diaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de dia inválido");

export const createAgendamentoSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  telefone: z
    .string()
    .min(10, "Telefone inválido")
    .max(20, "Telefone inválido"),
  servico_id: z.string().uuid("Serviço inválido"),
  inicio: z.string().datetime({ offset: true }),
});

export const updateStatusSchema = z.object({
  status: z.enum(["pendente", "confirmado", "cancelado", "concluido"]),
});

export const horariosDisponiveisQuerySchema = z.object({
  dia: diaSchema,
  servico_id: uuidSchema,
});

export const adminAgendamentosQuerySchema = z.object({
  dia: diaSchema.optional(),
});
