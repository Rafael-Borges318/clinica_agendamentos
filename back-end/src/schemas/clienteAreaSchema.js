import { z } from "zod";

export const clienteLoginSchema = z.object({
  telefone: z
    .string()
    .min(10, "Telefone inválido")
    .max(20, "Telefone inválido"),
  codigo_confirmacao: z
    .string()
    .trim()
    .toUpperCase()
    .length(6, "Código inválido"),
});

export const remarcarAgendamentoSchema = z.object({
  inicio: z.string().datetime({ offset: true }),
});
