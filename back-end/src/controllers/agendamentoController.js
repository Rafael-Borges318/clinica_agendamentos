import {
  adminAgendamentosQuerySchema,
  createAgendamentoSchema,
  horariosDisponiveisQuerySchema,
  updateStatusSchema,
  uuidSchema,
} from "../schemas/agendamentoSchema.js";
import {
  alterarStatusAgendamento,
  criarAgendamento,
  listarAgendamentosAdmin,
  listarHorariosDisponiveis,
} from "../services/agendamentoService.js";

export async function getAdminAgendamentos(req, res, next) {
  try {
    const parsed = adminAgendamentosQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const data = await listarAgendamentosAdmin(parsed.data.dia);
    return res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
}

export async function patchAgendamentoStatus(req, res, next) {
  try {
    const parsedId = uuidSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const parsedBody = updateStatusSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.issues[0].message });
    }

    const data = await alterarStatusAgendamento(
      parsedId.data,
      parsedBody.data.status,
    );

    return res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
}

export async function getHorariosDisponiveis(req, res, next) {
  try {
    const parsed = horariosDisponiveisQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const data = await listarHorariosDisponiveis(parsed.data);
    return res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
}

export async function postAgendamento(req, res, next) {
  try {
    const parsed = createAgendamentoSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const data = await criarAgendamento(parsed.data);
    return res.status(201).json(data);
  } catch (err) {
    return next(err);
  }
}