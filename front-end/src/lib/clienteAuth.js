const TOKEN_KEY = "ja_clinica_cliente_token";

export function saveClienteToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getClienteToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeClienteToken() {
  localStorage.removeItem(TOKEN_KEY);
}
