import { supabase } from "../config/supabaseClient.js";

export async function findClienteByTelefone(telefone) {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("telefone", telefone)
    .single();
  if (error) {
    throw new Error("Cliente não encontrado");
  }
  return data;
}

export async function createCliente(nome, telefone) {
  const { data, error } = await supabase
    .from("clientes")
    .insert({ nome, telefone })
    .select()
    .single();

  if (error) {
    throw new Error("Erro ao criar cliente");
  }
  return data;
}

export async function findClienteById(id) {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    throw new Error("Cliente não encontrado");
  }
  return data;
}
