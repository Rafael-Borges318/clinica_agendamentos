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
