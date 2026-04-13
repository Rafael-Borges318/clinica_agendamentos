import express from "express";
import { createAnamneseController } from "../controllers/anamneseController.js";

const router = express.Router();

router.post("/", createAnamneseController);

export default router;
