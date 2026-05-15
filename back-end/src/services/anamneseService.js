import { normalizarTelefone } from "../utils/telefone.js";
import { buildError } from "../utils/errors.js";
import { findClienteByTelefone } from "../repositories/clienteRepository.js";
import { createAnamnese } from "../repositories/anamneseRepository.js";
import { findServicoById } from "../repositories/servicoRepository.js";

export async function createAnamneseService({ telefone, servico_id, respostas }) {
  const telefoneNormalizado = normalizarTelefone(telefone);

  const cliente = await findClienteByTelefone(telefoneNormalizado);

  if (!cliente) {
    throw buildError("Cliente não encontrado", 404);
  }

  const servico = await findServicoById(servico_id);

  if (!servico) {
    throw buildError("Serviço não encontrado", 404);
  }

  const anamnese = await createAnamnese({
    cliente_id: cliente.id,
    tipo: servico.tipo_anamnese,
    respostas,
  });

  return anamnese;
}
