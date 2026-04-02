import {
  findServicoById,
  listServicosAdmin,
  listServicosAtivos,
  updateServico,
} from "../repositories/servicoRepository.js";
import { sanitizeText } from "../utils/sanitize.js";

function buildError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function getServicosAtivos() {
  return listServicosAtivos();
}

export async function getServicosAdmin() {
  return listServicosAdmin();
}

export async function getServicoValidoById(servicoId) {
  const servico = await findServicoById(servicoId);

  if (!servico) {
    throw buildError("Serviço inválido", 400);
  }

  if (!servico.ativo) {
    throw buildError("Serviço inativo", 400);
  }

  const duracaoMin = Number(servico.duracao_min);
  if (!Number.isFinite(duracaoMin) || duracaoMin <= 0) {
    throw buildError("Serviço sem duração válida", 500);
  }

  return servico;
}

export async function patchServico(id, patch) {
  const sanitizedPatch = { ...patch };

  if (typeof sanitizedPatch.nome === "string") {
    sanitizedPatch.nome = sanitizeText(sanitizedPatch.nome);
  }

  return updateServico(id, sanitizedPatch);
}
