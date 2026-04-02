import {
  findAgendamentosByDia,
  insertAgendamento,
  listAdminAgendamentos,
  updateAgendamentoStatus,
} from "../repositories/agendamentoRepository.js";
import { getServicoValidoById } from "./servicoService.js";
import { sanitizeText, normalizePhone } from "../utils/sanitize.js";
import {
  addMinutesToISO,
  ceilToStep,
  overlaps,
  getWindowsForDow,
  toISO,
  toMsLocal,
} from "../utils/timeUtils.js";

function buildError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function listarAgendamentosAdmin(dia) {
  if (!dia) {
    return listAdminAgendamentos();
  }

  const start = new Date(`${dia}T00:00:00-03:00`).toISOString();
  const end = new Date(`${dia}T23:59:59-03:00`).toISOString();

  return listAdminAgendamentos(start, end);
}

export async function alterarStatusAgendamento(id, status) {
  return updateAgendamentoStatus(id, status);
}

export async function listarHorariosDisponiveis({ dia, servico_id }) {
  const stepMin = 30;
  const tz = "-03:00";

  const servico = await getServicoValidoById(servico_id);
  const duracaoMin = Number(servico.duracao_min);

  const dow = new Date(`${dia}T00:00:00${tz}`).getDay();
  const windows = getWindowsForDow(dow);

  if (windows.length === 0) {
    return {
      dia,
      servico_id,
      duracao_min: duracaoMin,
      stepMin,
      total: 0,
      horarios: [],
      info: "Fechado neste dia",
    };
  }

  const startDayISO = toISO(dia, "00:00", tz);
  const endDayISO = toISO(dia, "23:59", tz);

  const ags = await findAgendamentosByDia(startDayISO, endDayISO);

  const ocupados = ags.map((a) => ({
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

  return {
    dia,
    servico_id,
    duracao_min: duracaoMin,
    stepMin,
    total: disponiveis.length,
    horarios: disponiveis,
    windows,
  };
}

export async function criarAgendamento(input) {
  const tz = "-03:00";
  const stepMin = 30;

  const nome = sanitizeText(input.nome);
  const telefone = normalizePhone(input.telefone);
  const { servico_id, inicio } = input;

  if (telefone.length < 10 || telefone.length > 11) {
    throw buildError("Telefone inválido", 400);
  }

  const inicioDate = new Date(inicio);

  if (Number.isNaN(inicioDate.getTime())) {
    throw buildError("Campo 'inicio' inválido (ISO).", 400);
  }

  const m = inicioDate.getMinutes();
  if (!(m === 0 || m === 30)) {
    throw buildError(
      "Horário inválido: use apenas slots de 30 em 30 (ex: 16:00 ou 16:30).",
      400,
    );
  }

  const servico = await getServicoValidoById(servico_id);
  const duracaoMin = Number(servico.duracao_min);

  const diaStr = inicioDate.toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });

  const dow = new Date(`${diaStr}T00:00:00${tz}`).getDay();
  const windows = getWindowsForDow(dow);

  if (windows.length === 0) {
    throw buildError("Clínica fechada neste dia.", 400);
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
    throw buildError("Fora do horário de funcionamento.", 400);
  }

  const hojeStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });

  if (diaStr === hojeStr) {
    const nowMs = Date.now();
    const minStartMs = ceilToStep(nowMs, stepMin);

    if (inicioMs < minStartMs) {
      throw buildError(
        "Não é possível agendar em horário passado (para hoje).",
        400,
      );
    }
  }

  const startDayISO = toISO(diaStr, "00:00", tz);
  const endDayISO = toISO(diaStr, "23:59", tz);

  const ags = await findAgendamentosByDia(startDayISO, endDayISO);

  const conflita = ags.some((a) => {
    const aIni = new Date(a.inicio).getTime();
    const aFim = new Date(a.fim).getTime();
    return overlaps(inicioMs, fimMs, aIni, aFim);
  });

  if (conflita) {
    throw buildError(
      "Horário indisponível — conflito com outro agendamento",
      409,
    );
  }

  const inicioISO = new Date(inicioMs).toISOString();
  const fimISO = new Date(fimMs).toISOString();

  let inserted;
  try {
    inserted = await insertAgendamento({
      servico_id,
      inicio: inicioISO,
      fim: fimISO,
      nome,
      telefone,
      status: "pendente",
    });
  } catch (err) {
    const msg = err.message || "";
    if (
      msg.toLowerCase().includes("overlap") ||
      msg.toLowerCase().includes("exclusion") ||
      msg.toLowerCase().includes("constraint")
    ) {
      throw buildError(
        "Horário indisponível — conflito com outro agendamento",
        409,
      );
    }
    throw err;
  }

  if (servico.manutencao_dias) {
    const manutencaoInicio = new Date(inicioISO);
    manutencaoInicio.setDate(
      manutencaoInicio.getDate() + Number(servico.manutencao_dias),
    );

    const manMin = manutencaoInicio.getMinutes();
    if (!(manMin === 0 || manMin === 30)) {
      manutencaoInicio.setTime(ceilToStep(manutencaoInicio.getTime(), stepMin));
    }

    const manutencaoInicioISO = manutencaoInicio.toISOString();
    const manutencaoFimISO = addMinutesToISO(manutencaoInicioISO, duracaoMin);

    try {
      const manutencao = await insertAgendamento({
        servico_id,
        inicio: manutencaoInicioISO,
        fim: manutencaoFimISO,
        nome,
        telefone,
        status: "pendente",
        parent_id: inserted.id,
      });

      return { inserted, manutencao };
    } catch {
      return {
        inserted,
        warning:
          "Agendamento principal criado. Falha ao criar manutenção automática (conflito). Marque manualmente.",
      };
    }
  }

  return inserted;
}
