export function sanitizeText(value) {
  return String(value).trim().replace(/\s+/g, " ").replace(/[<>]/g, "");
}

export function normalizePhone(value) {
  return String(value).replace(/\D/g, "");
}
