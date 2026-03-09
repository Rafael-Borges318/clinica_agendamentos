import express from "express";
import { supabase } from "../supabaseClient.js";
import { adminAuth } from "../middleware/adminAuth.js";

console.log("ARQUIVO agendamentos.js CARREGADO");

const router = express.Router();

function addMinutesToISO(isoString, minutes) {
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() + Number(minutes));
  return d.toISOString();
}

// ADMIN: listar agendamentos (rota protegida)
router.get("/admin/agendamentos", adminAuth, async (req, res) => {
  try {
    // o dia pode vir em query ou, em último caso, no body
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
      // converte para UTC antes de comparar
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

// ADMIN: listar serviços completo (rota protegida)
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

// ADMIN: editar serviço (ativo/nome/duração/manutenção)
router.patch("/admin/servicos/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const patch = req.body || {};

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
// CLIENTE: listar horários disponíveis por dia + serviço
// GET /horarios-disponiveis?dia=2026-03-05&servico_id=UUID
router.get("/horarios-disponiveis", async (req, res) => {
  try {
    const { dia, servico_id } = req.query;

    // Sempre meia em meia hora
    const stepMin = 30;

    if (!dia || !servico_id) {
      return res.status(400).json({ error: "Informe dia e servico_id" });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) {
      return res
        .status(400)
        .json({ error: "Formato de dia inválido (YYYY-MM-DD)" });
    }

    // 1) buscar duração do serviço
    const { data: servico, error: svcError } = await supabase
      .from("servicos")
      .select("id, duracao_min, ativo")
      .eq("id", servico_id)
      .single();

    if (svcError || !servico)
      return res.status(400).json({ error: "Serviço inválido" });
    if (!servico.ativo)
      return res.status(400).json({ error: "Serviço inativo" });

    const duracaoMin = Number(servico.duracao_min);
    if (!Number.isFinite(duracaoMin) || duracaoMin <= 0) {
      return res.status(500).json({ error: "Serviço sem duração válida" });
    }

    // TZ fixo da tua clínica
    const tz = "-03:00";

    // 2) definir janelas de atendimento por dia da semana
    // 0=Dom, 1=Seg, ..., 6=Sab
    const dow = new Date(`${dia}T00:00:00${tz}`).getDay();

    /** Retorna array de janelas [ ["08:00","12:00"], ["13:00","17:00"] ] */
    function getWindowsForDow(dow) {
      // Domingo fechado
      if (dow === 0) return [];
      // Sábado 08:00-12:00
      if (dow === 6) return [["08:00", "12:00"]];
      // Seg-Sex 08-12 e 13-17 (pausa 12-13)
      return [
        ["08:00", "12:00"],
        ["13:00", "17:00"],
      ];
    }

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

    // helper para criar DateTime local (-03:00) e usar no cálculo
    const toMsLocal = (d, hhmm) => new Date(`${d}T${hhmm}:00${tz}`).getTime();
    const toISO = (d, hhmm) => new Date(`${d}T${hhmm}:00${tz}`).toISOString();

    // 3) buscar agendamentos do dia (bloqueia tudo exceto cancelado)
    const startDayISO = toISO(dia, "00:00");
    const endDayISO = toISO(dia, "23:59");

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

    const overlaps = (aStart, aEnd, bStart, bEnd) =>
      aStart < bEnd && aEnd > bStart;

    // 4) ignorar horários no passado (se dia == hoje)
    const nowMs = Date.now();
    const todayStr = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    });
    // en-CA dá YYYY-MM-DD

    // arredonda "agora" para o próximo slot de 30min
    function ceilToStep(ms, stepMinutes) {
      const stepMs = stepMinutes * 60 * 1000;
      return Math.ceil(ms / stepMs) * stepMs;
    }
    const minStartMsToday = ceilToStep(nowMs, stepMin);

    // 5) gerar slots dentro das janelas
    const stepMs = stepMin * 60 * 1000;
    const durMs = duracaoMin * 60 * 1000;

    const disponiveis = [];

    for (const [winStart, winEnd] of windows) {
      let t = toMsLocal(dia, winStart);
      const endWin = toMsLocal(dia, winEnd);

      // se for hoje, não deixar começar antes do "agora arredondado"
      if (dia === todayStr) {
        t = Math.max(t, minStartMsToday);
        // garantir que t cai em "meia hora certinha"
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
            label: `${hh}:${mm}`, // "16:00", "16:30"...
            inicioISO: new Date(slotStart).toISOString(), // pronto pro POST
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

// CLIENTE: criar agendamento
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

    // ===== helpers (timezone da clínica) =====
    const tz = "-03:00";
    const stepMin = 30;

    function getWindowsForDow(dow) {
      if (dow === 0) return []; // domingo fechado
      if (dow === 6) return [["08:00", "12:00"]]; // sábado
      return [
        ["08:00", "12:00"],
        ["13:00", "17:00"],
      ]; // seg-sex
    }

    const ceilToStep = (ms, stepMinutes) => {
      const stepMs = stepMinutes * 60 * 1000;
      return Math.ceil(ms / stepMs) * stepMs;
    };

    const toISO = (d, hhmm) => new Date(`${d}T${hhmm}:00${tz}`).toISOString();
    const toMsLocal = (d, hhmm) => new Date(`${d}T${hhmm}:00${tz}`).getTime();

    const overlaps = (aStart, aEnd, bStart, bEnd) =>
      aStart < bEnd && aEnd > bStart;

    const inicioDate = new Date(inicio);
    if (Number.isNaN(inicioDate.getTime())) {
      return res.status(400).json({ error: "Campo 'inicio' inválido (ISO)." });
    }

    // 1) Só slots 30/30 (minutos 00 ou 30)
    const m = inicioDate.getMinutes();
    if (!(m === 0 || m === 30)) {
      return res.status(400).json({
        error:
          "Horário inválido: use apenas slots de 30 em 30 (ex: 16:00 ou 16:30).",
      });
    }

    // 2) buscar duração do serviço
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

    // 3) Descobrir o dia local (SP) do agendamento
    const diaStr = inicioDate.toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    }); // YYYY-MM-DD
    const dow = new Date(`${diaStr}T00:00:00${tz}`).getDay();
    const windows = getWindowsForDow(dow);

    // domingo fechado
    if (windows.length === 0) {
      return res.status(400).json({
        error: "Clínica fechada neste dia.",
        windows,
      });
    }

    // 4) Validar se está dentro do horário de funcionamento (considerando duração)
    // (reconstrói ms em horário local -03 para evitar confusão)
    const hh = String(inicioDate.getHours()).padStart(2, "0");
    const mm = String(inicioDate.getMinutes()).padStart(2, "0");
    const inicioMs = new Date(`${diaStr}T${hh}:${mm}:00${tz}`).getTime();
    const durMs = duracaoMin * 60 * 1000;
    const fimMs = inicioMs + durMs;

    const dentroDeAlgumaJanela = windows.some(([wStart, wEnd]) => {
      const wStartMs = toMsLocal(diaStr, wStart);
      const wEndMs = toMsLocal(diaStr, wEnd);
      return inicioMs >= wStartMs && fimMs <= wEndMs;
    });

    if (!dentroDeAlgumaJanela) {
      return res.status(400).json({
        error: "Fora do horário de funcionamento.",
        windows,
      });
    }

    // 5) Se for hoje, ignorar horários no passado (arredondando pro próximo slot)
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

    // 6) Conflito com agendamentos do dia (exceto cancelado)
    const startDayISO = toISO(diaStr, "00:00");
    const endDayISO = toISO(diaStr, "23:59");

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

    // ✅ agora sim: gravar em ISO UTC certinho
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
      // fallback: se você tiver constraint no banco, cai aqui também
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

    // 7) manutenção automática (mantém tua lógica, mas também evita conflito)
    if (servico.manutencao_dias) {
      const manutencaoInicio = new Date(inicioISO);
      manutencaoInicio.setDate(
        manutencaoInicio.getDate() + Number(servico.manutencao_dias),
      );

      // garante que manutenção também respeita step 30/30
      const manMin = manutencaoInicio.getMinutes();
      if (!(manMin === 0 || manMin === 30)) {
        // arredonda pro próximo slot
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
