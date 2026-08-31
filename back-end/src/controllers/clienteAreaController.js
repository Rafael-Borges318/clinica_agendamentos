import {
  clienteLoginSchema,
  remarcarAgendamentoSchema,
  cadastroSenhaSchema,
  loginSenhaSchema,
} from "../schemas/clienteAreaSchema.js";
import { createAnamneseSchema } from "../schemas/anamneseSchema.js";
import { uuidSchema } from "../schemas/agendamentoSchema.js";
import {
  loginCliente,
  cadastrarSenhaCliente,
  loginClienteSenha,
  listarMeusAgendamentos,
  remarcarMeuAgendamento,
  buscarMinhaAnamnese,
  editarMinhaAnamnese,
} from "../services/clienteAreaService.js";

export async function postLoginCliente(req, res, next) {
  try {
    const parsed = clienteLoginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const result = await loginCliente(parsed.data);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

export async function postCadastroSenhaCliente(req, res, next) {
  try {
    const parsed = cadastroSenhaSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const result = await cadastrarSenhaCliente(parsed.data);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

export async function postLoginSenhaCliente(req, res, next) {
  try {
    const parsed = loginSenhaSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const result = await loginClienteSenha(parsed.data);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

export async function getMeusAgendamentos(req, res, next) {
  try {
    const data = await listarMeusAgendamentos(req.clienteId);
    return res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
}

export async function patchMeuAgendamento(req, res, next) {
  try {
    const parsedId = uuidSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const parsedBody = remarcarAgendamentoSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.issues[0].message });
    }

    const data = await remarcarMeuAgendamento(
      req.clienteId,
      parsedId.data,
      parsedBody.data.inicio,
    );

    return res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
}

export async function getMinhaAnamnese(req, res, next) {
  try {
    const parsedId = uuidSchema.safeParse(req.params.servico_id);
    if (!parsedId.success) {
      return res.status(400).json({ error: "Serviço inválido" });
    }

    const data = await buscarMinhaAnamnese(req.clienteId, parsedId.data);
    return res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
}

export async function postMinhaAnamnese(req, res, next) {
  try {
    const parsed = createAnamneseSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const data = await editarMinhaAnamnese(req.clienteId, parsed.data);
    return res.status(201).json(data);
  } catch (err) {
    return next(err);
  }
}
