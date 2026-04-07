import app from "./src/app.js";
import { env } from "./src/config/env.js";
import authRoutes from "./routes/auth.js";

app.use("/api", authRoutes);
app.listen(env.PORT, () => {
  console.log(`Servidor rodando na porta ${env.PORT}`);
});
