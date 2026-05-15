import { createAnamneseSchema } from "../schemas/anamneseSchema.js";
import { createAnamneseService } from "../services/anamneseService.js";

export async function createAnamneseController(req, res, next) {
  try {
    const parsed = createAnamneseSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const result = await createAnamneseService(parsed.data);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}
