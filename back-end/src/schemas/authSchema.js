import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha inválida").max(128, "Senha inválida"),
});
