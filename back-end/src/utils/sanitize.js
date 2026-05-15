export function sanitizeText(value) {
  return String(value)
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[<>"'&]/g, "");
}
