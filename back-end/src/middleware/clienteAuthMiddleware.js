import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function clienteAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token não informado" });
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });

    if (payload.scope !== "cliente") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    req.clienteId = payload.sub;

    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
