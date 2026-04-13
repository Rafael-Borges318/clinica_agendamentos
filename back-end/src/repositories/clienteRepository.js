import { supabase } from "../config/supabaseClient.js";

export async function findClienteByTelefone(telefone) {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("telefone", telefone)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data; // se não achar, vem null
}

export async function createCliente({ nome, telefone }) {
  const { data, error } = await supabase
    .from("clientes")
    .insert([{ nome, telefone }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}