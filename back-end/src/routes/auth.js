import express from "express";
import rateLimit from "express-rate-limit";
import { adminLogin } from "../controllers/authController.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente mais tarde." },
});

router.post("/admin/login", loginLimiter, adminLogin);

export default router;
