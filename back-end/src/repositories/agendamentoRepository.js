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
      cliente_id,
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
        ativo,
        exige_anamnese,
        tipo_anamnese
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

export async function createAgendamento(data) {
  const { error } = await supabase.from("agendamentos").insert([data]);
  if (error) throw new Error(error.message);
  return true;
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
      id,
      cliente_id,
      nome,
      telefone,
      inicio,
      fim,
      status,
      servicos:servico_id (
        id,
        nome,
        exige_anamnese,
        tipo_anamnese
      )
    `,
    )
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function findHistoricoCliente(clienteId) {
  const { data, error } = await supabase
    .from("agendamentos")
    .select(
      `
      id,
      cliente_id,
      inicio,
      fim,
      status,
      servicos:servico_id (
        id,
        nome
      )
    `,
    )
    .eq("cliente_id", clienteId)
    .order("inicio", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function countVisitasClienteNoMes(clienteId, startISO, endISO) {
  const { count, error } = await supabase
    .from("agendamentos")
    .select("*", { count: "exact", head: true })
    .eq("cliente_id", clienteId)
    .gte("inicio", startISO)
    .lte("inicio", endISO)
    .neq("status", "cancelado");

  if (error) throw new Error(error.message);
  return count || 0;
}

export async function countVisitasClienteTotal(clienteId) {
  const { count, error } = await supabase
    .from("agendamentos")
    .select("*", { count: "exact", head: true })
    .eq("cliente_id", clienteId)
    .neq("status", "cancelado");

  if (error) throw new Error(error.message);
  return count || 0;
}

export async function findUltimaVisitaCliente(clienteId) {
  const { data, error } = await supabase
    .from("agendamentos")
    .select("id, inicio, status")
    .eq("cliente_id", clienteId)
    .neq("status", "cancelado")
    .order("inicio", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
