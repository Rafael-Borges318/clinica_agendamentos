import { normalizarTelefone } from "../utils/telefone.js";
import { findClienteByTelefone } from "../repositories/clienteRepository.js";
import { createAnamnese } from "../repositories/anamneseRepository.js";
import { findServicoById } from "../repositories/servicoRepository.js"; // 👈 IMPORTANTE

export async function createAnamneseService({
  telefone,
  servico_id,
  respostas,
}) {
  const telefoneNormalizado = normalizarTelefone(telefone);

  const cliente = await findClienteByTelefone(telefoneNormalizado);

  if (!cliente) {
    throw new Error("Cliente não encontrado");
  }

  const servico = await findServicoById(servico_id);

  if (!servico) {
    throw new Error("Serviço não encontrado");
  }

  const tipo = servico.tipo_anamnese;

  const anamnese = await createAnamnese({
    cliente_id: cliente.id,
    tipo, 
    respostas,
  });

  return anamnese;
}