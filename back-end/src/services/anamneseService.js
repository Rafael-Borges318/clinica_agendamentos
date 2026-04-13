import { normalizarTelefone } from "../utils/telefone.js";
import { findClienteByTelefone } from "../repositories/clienteRepository.js";
import { createAnamnese } from "../repositories/anamneseRepository.js";

export async function createAnamneseService({ telefone, tipo, respostas }) {
  const telefoneNormalizado = normalizarTelefone(telefone);

  const cliente = await findClienteByTelefone(telefoneNormalizado);

  if (!cliente) {
    throw new Error("Cliente não encontrado");
  }

  const anamnese = await createAnamnese({
    cliente_id: cliente.id,
    tipo,
    respostas,
  });

  return anamnese;
}