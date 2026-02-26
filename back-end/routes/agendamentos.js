import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Criar agendamento
router.post("/agendamentos", async (req, res) => {
  const { nome, telefone, servico, data, horario } = req.body;

  if (!nome || !telefone || !servico || !data || !horario) {
    return res.status(400).json({ error: "Campos obrigatórios faltando" });
  }

  const { data: inserted, error } = await supabase
    .from("agendamentos")
    .insert([{ nome, telefone, servico, data, horario }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  return res.status(201).json(inserted);
});

export default router;
