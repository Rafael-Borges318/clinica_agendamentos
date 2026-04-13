export function normalizarTelefone(telefone) {
  const numeros = String(telefone).replace(/\D/g, "").trim();

  if (numeros.length === 10 || numeros.length === 11) {
    return numeros;
  }

  throw new Error("Número de telefone inválido");
}
