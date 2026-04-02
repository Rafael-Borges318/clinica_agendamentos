import { uuidSchema } from "../schemas/agendamentoSchema.js";
import { updateServicoSchema } from "../schemas/servicoSchema.js";
import {
  getServicosAdmin,
  getServicosAtivos,
  patchServico,
} from "../services/servicoService.js";

export async function getServicos(req, res, next) {
  try {
    const data = await getServicosAtivos();
    return res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
}

export async function getServicosAdminController(req, res, next) {
  try {
    const data = await getServicosAdmin();
    return res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
}

export async function patchServicoController(req, res, next) {
  try {
    const parsedId = uuidSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const parsedBody = updateServicoSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res
        .status(400)
        .json({ error: parsedBody.error.issues[0].message });
    }

    const data = await patchServico(parsedId.data, parsedBody.data);
    return res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
}
