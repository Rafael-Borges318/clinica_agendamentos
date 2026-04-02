import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import agendamentosRoutes from "./routes/agendamentos.js";
import servicosRoutes from "./routes/servicos.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: [env.FRONTEND_URL, env.ADMIN_URL],
    methods: ["GET", "POST", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  }),
);

app.use(hpp());
app.use(express.json({ limit: "10kb" }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições. Tente novamente mais tarde." },
});

app.use(globalLimiter);

app.get("/", (req, res) => {
  return res.status(200).json({ ok: true });
});

app.use("/api", authRoutes);
app.use("/api", agendamentosRoutes);
app.use("/api", servicosRoutes);

app.use((req, res) => {
  return res.status(404).json({ error: "Rota não encontrada" });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error("[APP_ERROR]", {
    path: req.path,
    method: req.method,
    message: err?.message,
  });

  return res.status(statusCode).json({
    error: statusCode >= 500 ? "Erro interno" : err.message,
  });
});

export default app;
