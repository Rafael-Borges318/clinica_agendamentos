import express from "express";
import rateLimit from "express-rate-limit";
import { anamneseAuthMiddleware } from "../middleware/anamneseAuthMiddleware.js";
import { createAnamneseController } from "../controllers/anamneseController.js";

const router = express.Router();

const anamneseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente mais tarde." },
});

router.post("/", anamneseLimiter, anamneseAuthMiddleware, createAnamneseController);

export default router;
