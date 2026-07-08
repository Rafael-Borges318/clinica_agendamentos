import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../../src/repositories/agendamentoRepository.js");
vi.mock("../../src/repositories/servicoRepository.js");
vi.mock("../../src/repositories/clienteRepository.js");
vi.mock("../../src/repositories/anamneseRepository.js");

import app from "../../src/app.js";
import * as agendamentoRepository from "../../src/repositories/agendamentoRepository.js";
import * as servicoRepository from "../../src/repositories/servicoRepository.js";
import * as clienteRepository from "../../src/repositories/clienteRepository.js";
import { diaUtilFuturo } from "../helpers/dates.js";

const SERVICO_ID = "11111111-1111-1111-1111-111111111111";

const servicoMock = {
  id: SERVICO_ID,
  nome: "Limpeza de Pele",
  duracao_min: 60,
  manutencao_dias: null,
  ativo: true,
  exige_anamnese: false,
  tipo_anamnese: null,
};

function corpoValido() {
  return {
    nome: "João Teste",
    telefone: "11999999999",
    servico_id: SERVICO_ID,
    inicio: `${diaUtilFuturo()}T09:00:00-03:00`,
  };
}

describe("POST /api/agendamentos - criação", () => {
  beforeEach(() => {
    servicoRepository.findServicoById.mockResolvedValue(servicoMock);
    clienteRepository.findClienteByTelefone.mockResolvedValue(null);
    clienteRepository.createCliente.mockResolvedValue({
      id: "cliente-1",
      nome: "João Teste",
      telefone: "11999999999",
    });
    agendamentoRepository.findAgendamentosByDia.mockResolvedValue([]);
    agendamentoRepository.insertAgendamento.mockResolvedValue({
      id: "agendamento-1",
      cliente_id: "cliente-1",
      servico_id: SERVICO_ID,
      status: "pendente",
    });
  });

  it("cria um agendamento e retorna 201", async () => {
    const response = await request(app)
      .post("/api/agendamentos")
      .send(corpoValido());

    expect(response.status).toBe(201);
    expect(response.body.inserted.status).toBe("pendente");
    expect(clienteRepository.createCliente).toHaveBeenCalledTimes(1);
    expect(agendamentoRepository.insertAgendamento).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/agendamentos - conflito de horário", () => {
  beforeEach(() => {
    servicoRepository.findServicoById.mockResolvedValue(servicoMock);
    clienteRepository.findClienteByTelefone.mockResolvedValue({
      id: "cliente-1",
      nome: "João Teste",
      telefone: "11999999999",
    });
  });

  it("retorna 409 quando já existe agendamento no mesmo horário", async () => {
    const corpo = corpoValido();
    const inicioMs = new Date(corpo.inicio).getTime();
    const fimMs = inicioMs + servicoMock.duracao_min * 60 * 1000;

    agendamentoRepository.findAgendamentosByDia.mockResolvedValue([
      {
        inicio: new Date(inicioMs).toISOString(),
        fim: new Date(fimMs).toISOString(),
        status: "pendente",
      },
    ]);

    const response = await request(app).post("/api/agendamentos").send(corpo);

    expect(response.status).toBe(409);
    expect(agendamentoRepository.insertAgendamento).not.toHaveBeenCalled();
  });
});

describe("POST /api/agendamentos - validação (Zod)", () => {
  it("retorna 400 quando o nome está ausente", async () => {
    const corpo = corpoValido();
    delete corpo.nome;

    const response = await request(app).post("/api/agendamentos").send(corpo);

    expect(response.status).toBe(400);
  });

  it("retorna 400 quando servico_id não é um UUID válido", async () => {
    const corpo = corpoValido();
    corpo.servico_id = "nao-e-um-uuid";

    const response = await request(app).post("/api/agendamentos").send(corpo);

    expect(response.status).toBe(400);
  });
});
