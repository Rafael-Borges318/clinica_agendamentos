import {
  findAgendamentosByDia,
  insertAgendamento,
  listAdminAgendamentos,
  updateAgendamentoStatus,
  countVisitasClienteNoMes,
  countVisitasClienteTotal,
  findUltimaVisitaCliente,
} from "../repositories/agendamentoRepository.js";
import { getServicoValidoById } from "./servicoService.js";
import { sanitizeText } from "../utils/sanitize.js";
import { normalizarTelefone } from "../utils/telefone.js";
import { buildError } from "../utils/errors.js";
import {
  addMinutesToISO,
  ceilToStep,
  overlaps,
  getWindowsForDow,
  toISO,
  toMsLocal,
} from "../utils/timeUtils.js";
import {
  findClienteByTelefone,
  createCliente,
} from "../repositories/clienteRepository.js";
import { findAnamneseValida } from "../repositories/anamneseRepository.js";

const TZ = "-03:00";
const STEP_MIN = 30;

export async function listarAgendamentosAdmin(dia) {
  let start = null;
  let end = null;

  if (dia) {
    start = new Date(`${dia}T00:00:00${TZ}`).toISOString();
    end = new Date(`${dia}T23:59:59${TZ}`).toISOString();
  }

  const agendamentos = await listAdminAgendamentos(start, end);

  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const resultado = await Promise.all(
    agendamentos.map(async (ag) => {
      if (!ag.cliente_id) {
        return ag;
      }

      const [totalVisitas, visitasMes, ultimaVisita, anamnese] =
        await Promise.all([
          countVisitasClienteTotal(ag.cliente_id),
          countVisitasClienteNoMes(ag.cliente_id, inicioMes, fimMes),
          findUltimaVisitaCliente(ag.cliente_id),
          ag.servicos?.tipo_anamnese
            ? findAnamneseValida(ag.cliente_id, ag.servicos.tipo_anamnese)
            : null,
        ]);

      return {
        ...ag,
        cliente: {
          id: ag.cliente_id,
          total_visitas: totalVisitas,
          visitas_mes: visitasMes,
          ultima_visita: ultimaVisita?.inicio || null,
          tipo: totalVisitas <= 1 ? "nova" : "recorrente",
        },
        anamnese: {
          existe: !!anamnese,
          tipo: anamnese?.tipo || ag.servicos?.tipo_anamnese || null,
          respostas: anamnese?.respostas || null,
          created_at: anamnese?.created_at || null,
        },
        historico: [],
      };
    }),
  );

  return resultado;
}

export async function alterarStatusAgendamento(id, status) {
  return updateAgendamentoStatus(id, status);
}

export async function listarHorariosDisponiveis({ dia, servico_id }) {
  const servico = await getServicoValidoById(servico_id);
  const duracaoMin = Number(servico.duracao_min);

  const dow = new Date(`${dia}T00:00:00${TZ}`).getDay();
  const windows = getWindowsForDow(dow);

  if (windows.length === 0) {
    return {
      dia,
      servico_id,
      duracao_min: duracaoMin,
      stepMin: STEP_MIN,
      total: 0,
      horarios: [],
      info: "Fechado neste dia",
    };
  }

  const startDayISO = toISO(dia, "00:00", TZ);
  const endDayISO = toISO(dia, "23:59", TZ);

  const ags = await findAgendamentosByDia(startDayISO, endDayISO);

  const ocupados = ags.map((a) => ({
    inicio: new Date(a.inicio).getTime(),
    fim: new Date(a.fim).getTime(),
  }));

  const nowMs = Date.now();
  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
  const minStartMsToday = ceilToStep(nowMs, STEP_MIN);

  const stepMs = STEP_MIN * 60 * 1000;
  const durMs = duracaoMin * 60 * 1000;

  const disponiveis = [];

  for (const [winStart, winEnd] of windows) {
    let t = toMsLocal(dia, winStart, TZ);
    const endWin = toMsLocal(dia, winEnd, TZ);

    if (dia === todayStr) {
      t = Math.max(t, minStartMsToday);
      t = ceilToStep(t, STEP_MIN);
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
    stepMin: STEP_MIN,
    total: disponiveis.length,
    horarios: disponiveis,
    windows,
  };
}

export async function criarAgendamento(input) {
  const nome = sanitizeText(input.nome);
  const telefone = normalizarTelefone(input.telefone);
  const { servico_id, inicio } = input;

  if (!nome) {
    throw buildError("Nome inválido.", 400);
  }

  if (telefone.length < 10 || telefone.length > 11) {
    throw buildError("Telefone inválido.", 400);
  }

  const inicioDate = new Date(inicio);

  if (Number.isNaN(inicioDate.getTime())) {
    throw buildError("Campo 'inicio' inválido (ISO).", 400);
  }

  const minuto = inicioDate.getMinutes();
  if (!(minuto === 0 || minuto === 30)) {
    throw buildError(
      "Horário inválido: use apenas slots de 30 em 30 (ex: 16:00 ou 16:30).",
      400,
    );
  }

  const servico = await getServicoValidoById(servico_id);
  const duracaoMin = Number(servico.duracao_min);

  let cliente = await findClienteByTelefone(telefone);

  if (!cliente) {
    cliente = await createCliente({ nome, telefone });
  }

  let precisaAnamnese = false;

  if (servico.exige_anamnese) {
    const anamnese = await findAnamneseValida(cliente.id, servico.tipo_anamnese);
    if (!anamnese) {
      precisaAnamnese = true;
    }
  }

  const diaStr = inicioDate.toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });

  const hojeStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });

  if (diaStr < hojeStr) {
    throw buildError("Não é possível agendar em datas passadas.", 400);
  }

  const dow = new Date(`${diaStr}T00:00:00${TZ}`).getDay();
  const windows = getWindowsForDow(dow);

  if (windows.length === 0) {
    throw buildError("Clínica fechada neste dia.", 400);
  }

  const hh = String(inicioDate.getHours()).padStart(2, "0");
  const mm = String(inicioDate.getMinutes()).padStart(2, "0");
  const inicioMs = new Date(`${diaStr}T${hh}:${mm}:00${TZ}`).getTime();
  const durMs = duracaoMin * 60 * 1000;
  const fimMs = inicioMs + durMs;

  const dentroDeAlgumaJanela = windows.some(([wStart, wEnd]) => {
    const wStartMs = toMsLocal(diaStr, wStart, TZ);
    const wEndMs = toMsLocal(diaStr, wEnd, TZ);
    return inicioMs >= wStartMs && fimMs <= wEndMs;
  });

  if (!dentroDeAlgumaJanela) {
    throw buildError("Fora do horário de funcionamento.", 400);
  }

  if (diaStr === hojeStr) {
    const nowMs = Date.now();
    const minStartMs = ceilToStep(nowMs, STEP_MIN);

    if (inicioMs < minStartMs) {
      throw buildError(
        "Não é possível agendar em horário passado (para hoje).",
        400,
      );
    }
  }

  const startDayISO = toISO(diaStr, "00:00", TZ);
  const endDayISO = toISO(diaStr, "23:59", TZ);

  const ags = await findAgendamentosByDia(startDayISO, endDayISO);

  const conflita = ags.some((a) => {
    const aIni = new Date(a.inicio).getTime();
    const aFim = new Date(a.fim).getTime();
    return overlaps(inicioMs, fimMs, aIni, aFim);
  });

  if (conflita) {
    throw buildError("Horário indisponível — conflito com outro agendamento.", 409);
  }

  const inicioISO = new Date(inicioMs).toISOString();
  const fimISO = new Date(fimMs).toISOString();

  let inserted;
  try {
    inserted = await insertAgendamento({
      cliente_id: cliente.id,
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
      throw buildError("Horário indisponível — conflito com outro agendamento.", 409);
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
      manutencaoInicio.setTime(ceilToStep(manutencaoInicio.getTime(), STEP_MIN));
    }

    const manutencaoInicioISO = manutencaoInicio.toISOString();
    const manutencaoFimISO = addMinutesToISO(manutencaoInicioISO, duracaoMin);

    try {
      const manutencao = await insertAgendamento({
        cliente_id: cliente.id,
        servico_id,
        inicio: manutencaoInicioISO,
        fim: manutencaoFimISO,
        nome,
        telefone,
        status: "pendente",
        parent_id: inserted.id,
      });

      return { inserted, manutencao, precisa_anamnese: precisaAnamnese };
    } catch {
      return {
        inserted,
        precisa_anamnese: precisaAnamnese,
        warning:
          "Agendamento principal criado. Falha ao criar manutenção automática (conflito). Marque manualmente.",
      };
    }
  }

  return { inserted, precisa_anamnese: precisaAnamnese };
}
