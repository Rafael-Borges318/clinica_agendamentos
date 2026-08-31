import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { buildError } from "../utils/errors.js";
import { normalizarTelefone } from "../utils/telefone.js";
import { sanitizeText } from "../utils/sanitize.js";
import {
  findAgendamentoPorTelefoneECodigo,
  findAgendamentoById,
  findMeusAgendamentos,
  updateAgendamentoHorario,
} from "../repositories/agendamentoRepository.js";
import {
  createCliente,
  findClienteComSenhaByTelefone,
  findClienteComSenhaByEmail,
  setEmailSenhaCliente,
} from "../repositories/clienteRepository.js";
import { resolverHorarioValido } from "./agendamentoService.js";
import { createAnamneseService } from "./anamneseService.js";
import { findAnamneseMaisRecente } from "../repositories/anamneseRepository.js";
import { findServicoById } from "../repositories/servicoRepository.js";

const SALT_ROUNDS = 10;

function gerarTokenCliente(clienteId) {
  const clienteToken = jwt.sign(
    { sub: clienteId, scope: "cliente" },
    env.JWT_SECRET,
    { expiresIn: "7d", algorithm: "HS256" },
  );

  return { cliente_token: clienteToken };
}

export async function loginCliente({ telefone, codigo_confirmacao }) {
  const telefoneNormalizado = normalizarTelefone(telefone);

  const agendamento = await findAgendamentoPorTelefoneECodigo(
    telefoneNormalizado,
    codigo_confirmacao,
  );

  if (!agendamento) {
    throw buildError("Telefone ou código de confirmação inválidos.", 401);
  }

  return gerarTokenCliente(agendamento.cliente_id);
}

// Cadastro aberto: qualquer telefone pode criar uma senha, sem confirmar
// posse do número via código. Decisão consciente do projeto — ver
// discussão na área do cliente sobre o trade-off de segurança. Telefone
// continua obrigatório aqui porque é ele que liga a conta aos agendamentos
// já feitos; o login em si passa a ser por email.
export async function cadastrarSenhaCliente({ nome, telefone, email, senha }) {
  const telefoneNormalizado = normalizarTelefone(telefone);
  const emailNormalizado = email.trim().toLowerCase();

  const emailJaUsado = await findClienteComSenhaByEmail(emailNormalizado);
  if (emailJaUsado) {
    throw buildError("Já existe uma conta com esse email. Faça login.", 409);
  }

  let cliente = await findClienteComSenhaByTelefone(telefoneNormalizado);

  if (cliente?.senha_hash) {
    throw buildError(
      "Já existe uma conta com esse telefone. Faça login.",
      409,
    );
  }

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

  if (!cliente) {
    const nomeSanitizado = sanitizeText(nome);

    if (!nomeSanitizado) {
      throw buildError("Nome inválido.", 400);
    }

    cliente = await createCliente({
      nome: nomeSanitizado,
      telefone: telefoneNormalizado,
    });
  }

  await setEmailSenhaCliente(cliente.id, emailNormalizado, senhaHash);

  return gerarTokenCliente(cliente.id);
}

export async function loginClienteSenha({ email, senha }) {
  const emailNormalizado = email.trim().toLowerCase();
  const cliente = await findClienteComSenhaByEmail(emailNormalizado);

  if (!cliente || !cliente.senha_hash) {
    throw buildError("Email ou senha inválidos.", 401);
  }

  const senhaOk = await bcrypt.compare(senha, cliente.senha_hash);

  if (!senhaOk) {
    throw buildError("Email ou senha inválidos.", 401);
  }

  return gerarTokenCliente(cliente.id);
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

  if (!servico.exige_anamnese) {
    throw buildError("Este serviço não possui ficha de anamnese.", 400);
  }

  const anamnese = await findAnamneseMaisRecente(clienteId);
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
