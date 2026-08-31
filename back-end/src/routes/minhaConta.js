import express from "express";
import rateLimit from "express-rate-limit";
import { clienteAuthMiddleware } from "../middleware/clienteAuthMiddleware.js";
import {
  postLoginCliente,
  postCadastroSenhaCliente,
  postLoginSenhaCliente,
  getMeusAgendamentos,
  patchMeuAgendamento,
  getMinhaAnamnese,
  postMinhaAnamnese,
} from "../controllers/clienteAreaController.js";

const router = express.Router();


const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente mais tarde." },
});

router.post("/login", loginLimiter, postLoginCliente);
router.post("/cadastro", loginLimiter, postCadastroSenhaCliente);
router.post("/login-senha", loginLimiter, postLoginSenhaCliente);

router.get("/agendamentos", clienteAuthMiddleware, getMeusAgendamentos);
router.patch("/agendamentos/:id", clienteAuthMiddleware, patchMeuAgendamento);

router.get("/anamnese/:servico_id", clienteAuthMiddleware, getMinhaAnamnese);
router.post("/anamnese", clienteAuthMiddleware, postMinhaAnamnese);

export default router;
