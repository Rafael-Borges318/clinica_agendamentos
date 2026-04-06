import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável obrigatória ausente: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 3000),

  SUPABASE_URL: required("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: required("SUPABASE_SERVICE_ROLE_KEY"),

  ADMIN_EMAIL: required("ADMIN_EMAIL"),
  ADMIN_PASSWORD_HASH: required("ADMIN_PASSWORD_HASH"),
  JWT_SECRET: required("JWT_SECRET"),

  FRONTEND_URL: required("FRONTEND_URL"),
  ADMIN_URL: required("ADMIN_URL"),
};
