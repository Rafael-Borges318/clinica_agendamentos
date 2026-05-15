import { z } from "zod";

export const createAnamneseSchema = z.object({
  telefone: z.string().min(10, "Telefone inválido").max(20, "Telefone inválido"),
  servico_id: z.string().uuid("Serviço inválido"),
  respostas: z.record(z.unknown()),
});
