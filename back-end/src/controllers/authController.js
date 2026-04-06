import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { adminLoginSchema } from "../schemas/authSchema.js";
import { env } from "../config/env.js";

export async function adminLogin(req, res, next) {
  try {
    const parsed = adminLoginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { email, password } = parsed.data;

    if (email !== env.ADMIN_EMAIL) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const ok = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);

    if (!ok) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      {
        sub: "admin",
        role: "admin",
        email,
      },
      env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    return res.status(200).json({ token });
  } catch (err) {
    return next(err);
  }
}
