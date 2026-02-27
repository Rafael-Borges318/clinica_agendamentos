import express from "express";
import { supabase } from "../supabaseClient.js";
import { adminAuth } from "../middleware/adminAuth.js";

console.log("ARQUIVO agendamentos.js CARREGADO ✅");

const router = express.Router();

function addMinutesToISO(isoString, minutes) {
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

// ✅ ADMIN: listar agendamentos (rota protegida)
router.post("/admin/agendamentos", adminAuth, async (req, res) => {
  const { dia } = req.body;

  let query = supabase
    .from("agendamentos")
    .select(
      `
      id,
      nome,
      telefone,
      inicio,
      fim,
      status,
      parent_id,
      servico_id,
      servicos ( nome )
    `,
    )
    .order("inicio", { ascending: true });

  if (dia) {
    const start = `${dia}T00:00:00-03:00`;
    const end = `${dia}T23:59:59-03:00`;
    query = query.gte("inicio", start).lte("inicio", end);
  }

  const { data, error } = await query;

  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json(data);
});
// ✅ CLIENTE: criar agendamento
router.post("/agendamentos", async (req, res) => {
  try {
    console.log("BODY RECEBIDO:", req.body);

    const { nome, telefone, servico_id, inicio } = req.body;

    if (!nome || !telefone || !servico_id || !inicio) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    if (isNaN(Date.parse(inicio))) {
      return res.status(400).json({
        error:
          "Campo 'inicio' inválido. Use ISO (ex: 2026-02-26T15:00:00-03:00).",
      });
    }

    const { data: servico, error: svcError } = await supabase
      .from("servicos")
      .select("id, duracao_min, manutencao_dias")
      .eq("id", servico_id)
      .single();

    if (svcError || !servico) {
      return res.status(400).json({ error: "Serviço inválido" });
    }

    const inicioISO = new Date(inicio).toISOString();
    const fimISO = addMinutesToISO(inicioISO, servico.duracao_min);

    const { data: inserted, error: insertError } = await supabase
      .from("agendamentos")
      .insert([
        {
          servico_id,
          inicio: inicioISO,
          fim: fimISO,
          nome,
          telefone,
          status: "pendente",
        },
      ])
      .select()
      .single();

    if (insertError) {
      const msg = insertError.message || "";
      if (
        msg.toLowerCase().includes("overlap") ||
        msg.toLowerCase().includes("exclusion") ||
        msg.toLowerCase().includes("constraint")
      ) {
        return res.status(409).json({
          error: "Horário indisponível — conflito com outro agendamento",
        });
      }
      return res.status(400).json({ error: insertError.message });
    }

    if (servico.manutencao_dias) {
      const manutencaoInicio = new Date(inicioISO);
      manutencaoInicio.setDate(
        manutencaoInicio.getDate() + Number(servico.manutencao_dias),
      );
      const manutencaoInicioISO = manutencaoInicio.toISOString();
      const manutencaoFimISO = addMinutesToISO(
        manutencaoInicioISO,
        servico.duracao_min,
      );

      const { data: manData, error: manErr } = await supabase
        .from("agendamentos")
        .insert([
          {
            servico_id,
            inicio: manutencaoInicioISO,
            fim: manutencaoFimISO,
            nome,
            telefone,
            status: "pendente",
            parent_id: inserted.id,
          },
        ])
        .select()
        .single();

      if (manErr) {
        return res.status(201).json({
          inserted,
          warning:
            "Agendamento principal criado. Falha ao criar manutenção automática (conflito). Marque manualmente.",
        });
      }

      return res.status(201).json({ inserted, manutencao: manData });
    }

    return res.status(201).json(inserted);
  } catch (err) {
    console.error("Erro no POST /agendamentos:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
