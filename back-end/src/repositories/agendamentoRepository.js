import { supabase } from "../config/supabaseClient.js";

export async function listAdminAgendamentos(
  diaStartISO = null,
  diaEndISO = null,
) {
  let query = supabase
    .from("agendamentos")
    .select(
      `
      id,
      nome,
      telefone,
      inicio,
      fim,
      status,
      parent_id,
      servico_id,
      servicos:servico_id (
        id,
        nome,
        duracao_min,
        manutencao_dias,
        ativo
      )
    `,
    )
    .order("inicio", { ascending: true });

  if (diaStartISO && diaEndISO) {
    query = query.gte("inicio", diaStartISO).lte("inicio", diaEndISO);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data || [];
}

export async function findAgendamentosByDia(startDayISO, endDayISO) {
  const { data, error } = await supabase
    .from("agendamentos")
    .select("inicio, fim, status")
    .gte("inicio", startDayISO)
    .lte("inicio", endDayISO)
    .neq("status", "cancelado")
    .order("inicio", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function insertAgendamento(payload) {
  const { data, error } = await supabase
    .from("agendamentos")
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateAgendamentoStatus(id, status) {
  const { data, error } = await supabase
    .from("agendamentos")
    .update({ status })
    .eq("id", id)
    .select(
      `
      id, nome, telefone, inicio, fim, status,
      servicos:servico_id ( nome )
    `,
    )
    .single();

  if (error) throw new Error(error.message);
  return data;
}
