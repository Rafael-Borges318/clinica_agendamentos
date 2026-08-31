import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { buildError } from "../utils/errors.js";
import { normalizarTelefone } from "../utils/telefone.js";
import {
  findAgendamentoPorTelefoneECodigo,
  findAgendamentoById,
  findMeusAgendamentos,
  updateAgendamentoHorario,
} from "../repositories/agendamentoRepository.js";
import { resolverHorarioValido } from "./agendamentoService.js";
import { createAnamneseService } from "./anamneseService.js";
import { findAnamneseValida } from "../repositories/anamneseRepository.js";
import { findServicoById } from "../repositories/servicoRepository.js";

export async function loginCliente({ telefone, codigo_confirmacao }) {
  const telefoneNormalizado = normalizarTelefone(telefone);

  const agendamento = await findAgendamentoPorTelefoneECodigo(
    telefoneNormalizado,
    codigo_confirmacao,
  );

  if (!agendamento) {
    throw buildError("Telefone ou código de confirmação inválidos.", 401);
  }

  const clienteToken = jwt.sign(
    { sub: agendamento.cliente_id, scope: "cliente" },
    env.JWT_SECRET,
    { expiresIn: "2h", algorithm: "HS256" },
  );

  return { cliente_token: clienteToken };
}

export async function listarMeusAgendamentos(clienteId) {
  return findMeusAgendamentos(clienteId);
}

export async function remarcarMeuAgendamento(clienteId, agendamentoId, novoInicio) {
  const agendamento = await findAgendamentoById(agendamentoId);

  if (!agendamento || agendamento.cliente_id !== clienteId) {
    throw buildError("Agendamento não encontrado.", 404);
  }

  if (agendamento.status === "cancelado" || agendamento.status === "concluido") {
    throw buildError(
      "Este agendamento não pode mais ser remarcado.",
      409,
    );
  }

  const { inicioISO, fimISO } = await resolverHorarioValido({
    servico: agendamento.servicos,
    inicio: novoInicio,
    excludeAgendamentoId: agendamentoId,
  });

  return updateAgendamentoHorario(agendamentoId, inicioISO, fimISO);
}

export async function buscarMinhaAnamnese(clienteId, servico_id) {
  const servico = await findServicoById(servico_id);

  if (!servico) {
    throw buildError("Serviço não encontrado", 404);
  }

  if (!servico.tipo_anamnese) {
    throw buildError("Este serviço não possui ficha de anamnese.", 400);
  }

  const anamnese = await findAnamneseValida(clienteId, servico.tipo_anamnese);
  return anamnese || null;
}

// Editar = registrar uma nova versão da anamnese (mantém histórico e o
// novo termo de consentimento com data/hora atualizadas). A consulta por
// "anamnese válida" sempre traz a mais recente.
export async function editarMinhaAnamnese(clienteId, { servico_id, respostas }) {
  return createAnamneseService({
    cliente_id: clienteId,
    servico_id,
    respostas,
  });
}
