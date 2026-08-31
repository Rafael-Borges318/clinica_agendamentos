import { supabase } from "../config/supabaseClient.js";

// A ficha é genérica (saúde, pele, histórico) — não é específica por
// procedimento. Por isso a busca ignora o tipo/serviço que originou a
// anamnese: a mais recente do cliente vale para liberar qualquer outro
// serviço que também exija anamnese.
export async function findAnamneseMaisRecente(cliente_id) {
  const { data, error } = await supabase
    .from("anamneses")
    .select("id, cliente_id, tipo, respostas, created_at")
    .eq("cliente_id", cliente_id)
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
