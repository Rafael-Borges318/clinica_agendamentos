import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import agendamentosRoutes from "./routes/agendamentos.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API OK ✅"));

app.use("/api", agendamentosRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
