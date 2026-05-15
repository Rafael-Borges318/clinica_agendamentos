import { supabase } from "../config/supabaseClient.js";

export async function findAnamneseValida(cliente_id, tipo) {
  const { data, error } = await supabase
    .from("anamneses")
    .select("id, cliente_id, tipo, respostas, created_at")
    .eq("cliente_id", cliente_id)
    .eq("tipo", tipo)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function createAnamnese({ cliente_id, tipo, respostas }) {
  const { data, error } = await supabase
    .from("anamneses")
    .insert([{ cliente_id, tipo, respostas }])
    .select("id, cliente_id, tipo, respostas, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
