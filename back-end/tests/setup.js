import { afterEach, vi } from "vitest";
import bcrypt from "bcryptjs";

// Valores fictícios: nenhuma chamada real ao Supabase acontece nos testes,
// pois a camada de repository é mockada em cada teste de integração.
// Esse arquivo roda antes de qualquer arquivo de teste ser carregado (setupFiles no vitest.config.js).
export const ADMIN_TEST_PASSWORD = "senha-teste-123";

process.env.SUPABASE_URL = "http://localhost:54321";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.ADMIN_EMAIL = "admin@teste.com";
process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_TEST_PASSWORD, 10);
process.env.JWT_SECRET = "test-jwt-secret";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.ADMIN_URL = "http://localhost:5174";

afterEach(() => {
  vi.resetAllMocks();
});
