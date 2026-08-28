import { z } from "zod";

export const createAnamneseSchema = z.object({
  servico_id: z.string().uuid("Serviço inválido"),
  respostas: z.record(z.unknown()),
});
