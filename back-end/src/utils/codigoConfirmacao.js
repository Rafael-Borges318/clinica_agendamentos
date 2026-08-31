import crypto from "crypto";

// Sem 0/O/1/I/L para evitar confusão visual ao ler/digitar o código.
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const TAMANHO = 6;

export function gerarCodigoConfirmacao() {
  const bytes = crypto.randomBytes(TAMANHO);
  let codigo = "";

  for (let i = 0; i < TAMANHO; i++) {
    codigo += ALFABETO[bytes[i] % ALFABETO.length];
  }

  return codigo;
}
