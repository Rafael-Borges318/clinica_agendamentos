import express from "express";
import { supabase } from "../config/supabaseClient.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// CLIENTE: listar apenas serviços ativos
router.get("/servicos", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("servicos")
      .select("id, nome")
      .eq("ativo", true)
      .order("nome", { ascending: true });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error("Erro em /servicos:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// ADMIN: listar serviços completos
router.get("/admin/servicos", adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("servicos")
      .select("id, nome, duracao_min, manutencao_dias, ativo")
      .order("nome", { ascending: true });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error("Erro em /admin/servicos:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// ADMIN: editar serviço
router.patch("/admin/servicos/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const patch = { ...(req.body || {}) };

    const allowedKeys = ["nome", "duracao_min", "manutencao_dias", "ativo"];
    for (const k of Object.keys(patch)) {
      if (!allowedKeys.includes(k)) delete patch[k];
    }

    const { data, error } = await supabase
      .from("servicos")
      .update(patch)
      .eq("id", id)
      .select("id, nome, duracao_min, manutencao_dias, ativo")
      .single();

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error("Erro PATCH /admin/servicos/:id:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
