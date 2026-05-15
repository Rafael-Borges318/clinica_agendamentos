import app from "./src/app.js";
import { env } from "./src/config/env.js";

process.on("uncaughtException", (err) => {
  console.error("uncaughtException — encerrando processo:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection — encerrando processo:", reason);
  process.exit(1);
});

app.listen(env.PORT, () => {
  console.log(`Servidor rodando na porta ${env.PORT}`);
});
