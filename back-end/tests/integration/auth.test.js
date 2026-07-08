import { describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import { ADMIN_TEST_PASSWORD } from "../setup.js";

describe("POST /api/admin/login", () => {
  it("retorna 200 e um token válido com credenciais corretas", async () => {
    const response = await request(app).post("/api/admin/login").send({
      email: process.env.ADMIN_EMAIL,
      password: ADMIN_TEST_PASSWORD,
    });

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe("string");

    const payload = jwt.verify(response.body.token, process.env.JWT_SECRET);
    expect(payload.role).toBe("admin");
  });

  it("retorna 401 com senha incorreta", async () => {
    const response = await request(app).post("/api/admin/login").send({
      email: process.env.ADMIN_EMAIL,
      password: "senha-errada-123",
    });

    expect(response.status).toBe(401);
  });

  it("retorna 400 quando o email é inválido", async () => {
    const response = await request(app).post("/api/admin/login").send({
      email: "nao-e-email",
      password: ADMIN_TEST_PASSWORD,
    });

    expect(response.status).toBe(400);
  });

  it("retorna 400 quando a senha é muito curta", async () => {
    const response = await request(app).post("/api/admin/login").send({
      email: process.env.ADMIN_EMAIL,
      password: "123",
    });

    expect(response.status).toBe(400);
  });
});
