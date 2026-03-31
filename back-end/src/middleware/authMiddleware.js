export function adminAuth(req, res, next) {
  const password =
    req.headers["x-admin-password"] || req.query.password || req.body?.password;

  if (!password) {
    return res.status(401).json({ error: "Senha obrigatória" });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Senha incorreta" });
  }

  next();
}
