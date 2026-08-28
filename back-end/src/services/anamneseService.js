import { buildError } from "../utils/errors.js";
import { createAnamnese } from "../repositories/anamneseRepository.js";
import { findServicoById } from "../repositories/servicoRepository.js";

export async function createAnamneseService({ cliente_id, servico_id, respostas }) {
  const servico = await findServicoById(servico_id);

  if (!servico) {
    throw buildError("Serviço não encontrado", 404);
  }

  const anamnese = await createAnamnese({
    cliente_id,
    tipo: servico.tipo_anamnese,
    respostas,
  });

  return anamnese;
}
