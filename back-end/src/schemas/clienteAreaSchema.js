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

export const cadastroSenhaSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  telefone: z
    .string()
    .min(10, "Telefone inválido")
    .max(20, "Telefone inválido"),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
});

export const loginSenhaSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  senha: z.string().min(1, "Informe a senha"),
});
