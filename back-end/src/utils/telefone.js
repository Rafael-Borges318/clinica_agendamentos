export function normalizarTelefone(telefone) {
  // Remove todos os caracteres não numéricos
  const numeros = telefone.replace(/\D/g, "").trim();
  // Verifica se o número tem 10 ou 11 dígitos (com DDD)
  if (numeros.length === 10) {
    return numeros; // Retorna o número normalizado
  }
  if (numeros.length === 11 && numeros.startsWith("1")) {
    return numeros.substring(1); // Remove o dígito '1' do início
  }
  throw new Error("Número de telefone inválido");
}
