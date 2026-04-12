import { createAnamneseService } from "../services/anamneseService.js";

export async function createAnamneseController(req, res) {
  try {
    const result = await createAnamneseService(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
