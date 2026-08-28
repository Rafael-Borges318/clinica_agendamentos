import express from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getAdminAgendamentos,
  patchAgendamentoStatus,
  getHorariosDisponiveis,
  postAgendamento,
} from "../controllers/agendamentoController.js";

const router = express.Router();

const agendamentoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente mais tarde." },
});

router.get("/admin/agendamentos", authMiddleware, getAdminAgendamentos);
router.patch(
  "/admin/agendamentos/:id/status",
  authMiddleware,
  patchAgendamentoStatus,
);

router.get("/horarios-disponiveis", getHorariosDisponiveis);
router.post("/agendamentos", agendamentoLimiter, postAgendamento);

export default router;
