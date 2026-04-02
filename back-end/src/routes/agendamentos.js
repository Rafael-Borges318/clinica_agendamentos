import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getAdminAgendamentos,
  patchAgendamentoStatus,
  getHorariosDisponiveis,
  postAgendamento,
} from "../controllers/agendamentoController.js";

const router = express.Router();

router.get("/admin/agendamentos", authMiddleware, getAdminAgendamentos);
router.patch(
  "/admin/agendamentos/:id/status",
  authMiddleware,
  patchAgendamentoStatus,
);

router.get("/horarios-disponiveis", getHorariosDisponiveis);
router.post("/agendamentos", postAgendamento);

export default router;
