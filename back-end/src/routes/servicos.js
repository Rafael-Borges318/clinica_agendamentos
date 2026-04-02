import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getServicos,
  getServicosAdminController,
  patchServicoController,
} from "../controllers/servicoController.js";

const router = express.Router();

router.get("/servicos", getServicos);

router.get("/admin/servicos", authMiddleware, getServicosAdminController);
router.patch("/admin/servicos/:id", authMiddleware, patchServicoController);

export default router;
