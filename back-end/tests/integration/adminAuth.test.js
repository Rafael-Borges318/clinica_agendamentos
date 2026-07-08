import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("../../src/repositories/agendamentoRepository.js");

import app from "../../src/app.js";
import * as agendamentoRepository from "../../src/repositories/agendamentoRepository.js";

function gerarToken(payload, options = {}) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
    ...options,
  });
}

describe("Rotas protegidas por JWT (authMiddleware)", () => {
  it("retorna 401 quando não há header Authorization", async () => {
    const response = await request(app).get("/api/admin/agendamentos");
    expect(response.status).toBe(401);
  });

  it("retorna 401 quando o header não começa com 'Bearer '", async () => {
    const response = await request(app)
      .get("/api/admin/agendamentos")
      .set("Authorization", "Token abc123");

    expect(response.status).toBe(401);
  });

  it("retorna 401 quando o token é inválido", async () => {
    const response = await request(app)
      .get("/api/admin/agendamentos")
      .set("Authorization", "Bearer token-invalido");

    expect(response.status).toBe(401);
  });

  it("retorna 403 quando o token é válido mas o role não é admin", async () => {
    const token = gerarToken({
      sub: "user-1",
      role: "user",
      email: "user@teste.com",
    });

    const response = await request(app)
      .get("/api/admin/agendamentos")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it("retorna 200 quando o token é válido e o role é admin", async () => {
    agendamentoRepository.listAdminAgendamentos.mockResolvedValue([]);

    const token = gerarToken({
      sub: "admin",
      role: "admin",
      email: "admin@teste.com",
    });

    const response = await request(app)
      .get("/api/admin/agendamentos")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
