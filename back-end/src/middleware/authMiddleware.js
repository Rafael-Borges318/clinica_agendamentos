import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token não informado" });
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (payload.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    req.admin = {
      sub: payload.sub,
      role: payload.role,
      email: payload.email,
    };

    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
