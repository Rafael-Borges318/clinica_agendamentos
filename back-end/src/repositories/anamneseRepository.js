import { supabase } from "../config/supabaseClient.js";

export async function findAnamneseValida(cliente_id, tipo) {
  const { data, error } = await supabase
    .from("anamneses")
    .select("*")
    .eq("cliente_id", cliente_id)
    .eq("tipo", tipo)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Anamnese não encontrada");
  }

  return data;
}

export async function createAnamnese(cliente_id, tipo, respostas) {
  const { data, error } = await supabase
    .from("anamneses")
    .insert({ cliente_id, tipo, respostas })
    .select()
    .single();

  if (error) {
    throw new Error("Erro ao criar anamnese");
  }
  return data;
}
