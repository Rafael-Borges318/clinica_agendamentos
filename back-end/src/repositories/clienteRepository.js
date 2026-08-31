import { supabase } from "../config/supabaseClient.js";

export async function findClienteByTelefone(telefone) {
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome, telefone, created_at")
    .eq("telefone", telefone)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function createCliente({ nome, telefone }) {
  const { data, error } = await supabase
    .from("clientes")
    .insert([{ nome, telefone }])
    .select("id, nome, telefone, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Uso restrito à autenticação por senha — nunca expor senha_hash fora
// da camada de auth.
export async function findClienteComSenhaByTelefone(telefone) {
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome, telefone, email, senha_hash")
    .eq("telefone", telefone)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function findClienteComSenhaByEmail(email) {
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome, telefone, email, senha_hash")
    .eq("email", email)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function setEmailSenhaCliente(clienteId, email, senhaHash) {
  const { error } = await supabase
    .from("clientes")
    .update({ email, senha_hash: senhaHash })
    .eq("id", clienteId);

  if (error) throw new Error(error.message);
}
