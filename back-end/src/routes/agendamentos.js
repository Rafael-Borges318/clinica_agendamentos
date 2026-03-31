import express from "express";
import { supabase } from "../supabaseClient.js";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  addMinutesToISO,
  ceilToStep,
  overlaps,
  getWindowsForDow,
  toISO,
  toMsLocal,
} from "../utils/timeUtils.js";

console.log("ARQUIVO agendamentos.js CARREGADO");

const router = express.Router();

// ADMIN: listar agendamentos
router.get("/admin/agendamentos", adminAuth, async (req, res) => {
  try {
    const dia = req.query.dia || req.body.dia;

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
        servicos:servico_id (
          id,
          nome,
          duracao_min,
          manutencao_dias,
          ativo
        )
      `,
      )
      .order("inicio", { ascending: true });

    if (dia) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) {
        return res.status(400).json({ error: "Formato de dia inválido" });
      }

      const start = new Date(`${dia}T00:00:00-03:00`).toISOString();
      const end = new Date(`${dia}T23:59:59-03:00`).toISOString();
      query = query.gte("inicio", start).lte("inicio", end);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) {
    console.error("Erro em /admin/agendamentos:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// ADMIN: atualizar status
router.patch("/admin/agendamentos/:id/status", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const allowed = ["pendente", "confirmado", "cancelado", "concluido"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const { data, error } = await supabase
      .from("agendamentos")
      .update({ status })
      .eq("id", id)
      .select(
        `
        id, nome, telefone, inicio, fim, status,
        servicos:servico_id ( nome )
      `,
      )
      .single();

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error("Erro PATCH /admin/agendamentos/:id/status:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// CLIENTE: listar horários disponíveis
router.get("/horarios-disponiveis", async (req, res) => {
  try {
    const { dia, servico_id } = req.query;
    const stepMin = 30;
    const tz = "-03:00";

    if (!dia || !servico_id) {
      return res.status(400).json({ error: "Informe dia e servico_id" });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) {
      return res
        .status(400)
        .json({ error: "Formato de dia inválido (YYYY-MM-DD)" });
    }

    const { data: servico, error: svcError } = await supabase
      .from("servicos")
      .select("id, duracao_min, ativo")
      .eq("id", servico_id)
      .single();

    if (svcError || !servico) {
      return res.status(400).json({ error: "Serviço inválido" });
    }

    if (!servico.ativo) {
      return res.status(400).json({ error: "Serviço inativo" });
    }

    const duracaoMin = Number(servico.duracao_min);
    if (!Number.isFinite(duracaoMin) || duracaoMin <= 0) {
      return res.status(500).json({ error: "Serviço sem duração válida" });
    }

    const dow = new Date(`${dia}T00:00:00${tz}`).getDay();
    const windows = getWindowsForDow(dow);

    if (windows.length === 0) {
      return res.status(200).json({
        dia,
        servico_id,
        duracao_min: duracaoMin,
        stepMin,
        total: 0,
        horarios: [],
        info: "Fechado neste dia",
      });
    }

    const startDayISO = toISO(dia, "00:00", tz);
    const endDayISO = toISO(dia, "23:59", tz);

    const { data: ags, error: agError } = await supabase
      .from("agendamentos")
      .select("inicio, fim, status")
      .gte("inicio", startDayISO)
      .lte("inicio", endDayISO)
      .neq("status", "cancelado")
      .order("inicio", { ascending: true });

    if (agError) throw agError;

    const ocupados = (ags || []).map((a) => ({
      inicio: new Date(a.inicio).getTime(),
      fim: new Date(a.fim).getTime(),
    }));

    const nowMs = Date.now();
    const todayStr = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    });
    const minStartMsToday = ceilToStep(nowMs, stepMin);

    const stepMs = stepMin * 60 * 1000;
    const durMs = duracaoMin * 60 * 1000;

    const disponiveis = [];

    for (const [winStart, winEnd] of windows) {
      let t = toMsLocal(dia, winStart, tz);
      const endWin = toMsLocal(dia, winEnd, tz);

      if (dia === todayStr) {
        t = Math.max(t, minStartMsToday);
        t = ceilToStep(t, stepMin);
      }

      for (; t + durMs <= endWin; t += stepMs) {
        const slotStart = t;
        const slotEnd = t + durMs;

        const conflita = ocupados.some((o) =>
          overlaps(slotStart, slotEnd, o.inicio, o.fim),
        );

        if (!conflita) {
          const dt = new Date(slotStart);
          const hh = String(dt.getHours()).padStart(2, "0");
          const mm = String(dt.getMinutes()).padStart(2, "0");

          disponiveis.push({
            label: `${hh}:${mm}`,
            inicioISO: new Date(slotStart).toISOString(),
          });
        }
      }
    }

    return res.status(200).json({
      dia,
      servico_id,
      duracao_min: duracaoMin,
      stepMin,
      total: disponiveis.length,
      horarios: disponiveis,
      windows,
    });
  } catch (err) {
    console.error("Erro GET /horarios-disponiveis:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// CLIENTE: criar agendamento
router.post("/agendamentos", async (req, res) => {
  try {
    console.log("BODY RECEBIDO:", req.body);

    const { nome, telefone, servico_id, inicio } = req.body;
    const tz = "-03:00";
    const stepMin = 30;

    if (!nome || !telefone || !servico_id || !inicio) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    if (isNaN(Date.parse(inicio))) {
      return res.status(400).json({
        error:
          "Campo 'inicio' inválido. Use ISO (ex: 2026-02-26T15:00:00-03:00).",
      });
    }

    const inicioDate = new Date(inicio);
    if (Number.isNaN(inicioDate.getTime())) {
      return res.status(400).json({ error: "Campo 'inicio' inválido (ISO)." });
    }

    const m = inicioDate.getMinutes();
    if (!(m === 0 || m === 30)) {
      return res.status(400).json({
        error:
          "Horário inválido: use apenas slots de 30 em 30 (ex: 16:00 ou 16:30).",
      });
    }

    const { data: servico, error: svcError } = await supabase
      .from("servicos")
      .select("id, duracao_min, manutencao_dias, ativo")
      .eq("id", servico_id)
      .single();

    if (svcError || !servico) {
      return res.status(400).json({ error: "Serviço inválido" });
    }

    if (servico.ativo === false) {
      return res.status(400).json({ error: "Serviço inativo" });
    }

    const duracaoMin = Number(servico.duracao_min);
    if (!Number.isFinite(duracaoMin) || duracaoMin <= 0) {
      return res.status(500).json({ error: "Serviço sem duração válida" });
    }

    const diaStr = inicioDate.toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    });

    const dow = new Date(`${diaStr}T00:00:00${tz}`).getDay();
    const windows = getWindowsForDow(dow);

    if (windows.length === 0) {
      return res.status(400).json({
        error: "Clínica fechada neste dia.",
        windows,
      });
    }

    const hh = String(inicioDate.getHours()).padStart(2, "0");
    const mm = String(inicioDate.getMinutes()).padStart(2, "0");
    const inicioMs = new Date(`${diaStr}T${hh}:${mm}:00${tz}`).getTime();
    const durMs = duracaoMin * 60 * 1000;
    const fimMs = inicioMs + durMs;

    const dentroDeAlgumaJanela = windows.some(([wStart, wEnd]) => {
      const wStartMs = toMsLocal(diaStr, wStart, tz);
      const wEndMs = toMsLocal(diaStr, wEnd, tz);
      return inicioMs >= wStartMs && fimMs <= wEndMs;
    });

    if (!dentroDeAlgumaJanela) {
      return res.status(400).json({
        error: "Fora do horário de funcionamento.",
        windows,
      });
    }

    const hojeStr = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    });

    if (diaStr === hojeStr) {
      const nowMs = Date.now();
      const minStartMs = ceilToStep(nowMs, stepMin);
      if (inicioMs < minStartMs) {
        return res.status(400).json({
          error: "Não é possível agendar em horário passado (para hoje).",
        });
      }
    }

    const startDayISO = toISO(diaStr, "00:00", tz);
    const endDayISO = toISO(diaStr, "23:59", tz);

    const { data: ags, error: agError } = await supabase
      .from("agendamentos")
      .select("inicio, fim, status")
      .gte("inicio", startDayISO)
      .lte("inicio", endDayISO)
      .neq("status", "cancelado")
      .order("inicio", { ascending: true });

    if (agError) throw agError;

    const conflita = (ags || []).some((a) => {
      const aIni = new Date(a.inicio).getTime();
      const aFim = new Date(a.fim).getTime();
      return overlaps(inicioMs, fimMs, aIni, aFim);
    });

    if (conflita) {
      return res.status(409).json({
        error: "Horário indisponível — conflito com outro agendamento",
      });
    }

    const inicioISO = new Date(inicioMs).toISOString();
    const fimISO = new Date(fimMs).toISOString();

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

      const manMin = manutencaoInicio.getMinutes();
      if (!(manMin === 0 || manMin === 30)) {
        manutencaoInicio.setTime(
          ceilToStep(manutencaoInicio.getTime(), stepMin),
        );
      }

      const manutencaoInicioISO = manutencaoInicio.toISOString();
      const manutencaoFimISO = addMinutesToISO(manutencaoInicioISO, duracaoMin);

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
