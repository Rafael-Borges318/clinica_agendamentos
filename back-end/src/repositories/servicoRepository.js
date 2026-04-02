import { supabase } from "../config/supabaseClient.js";

export async function findServicoById(id) {
  const { data, error } = await supabase
    .from("servicos")
    .select("id, nome, duracao_min, manutencao_dias, ativo")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function listServicosAtivos() {
  const { data, error } = await supabase
    .from("servicos")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function listServicosAdmin() {
  const { data, error } = await supabase
    .from("servicos")
    .select("id, nome, duracao_min, manutencao_dias, ativo")
    .order("nome", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateServico(id, patch) {
  const { data, error } = await supabase
    .from("servicos")
    .update(patch)
    .eq("id", id)
    .select("id, nome, duracao_min, manutencao_dias, ativo")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
