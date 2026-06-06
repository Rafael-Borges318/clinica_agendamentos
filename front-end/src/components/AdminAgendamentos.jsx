import { useEffect, useMemo, useState } from "react";
import { authHeaders, removeToken } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const API_URL = import.meta.env.VITE_API_URL;

function formatarDataHora(iso) {
  if (!iso) return "-";

  const dt = new Date(iso);

  return dt.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatarHora(iso) {
  if (!iso) return "-";

  const dt = new Date(iso);

  return dt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status, anamnese, servico) {
  if (servico?.exige_anamnese && anamnese && anamnese.existe === false) {
    return "Aguardando anamnese";
  }

  switch (status) {
    case "pendente":
      return "Pendente";
    case "confirmado":
      return "Confirmado";
    case "concluido":
      return "Concluído";
    case "cancelado":
      return "Cancelado";
    default:
      return status || "Sem status";
  }
}

function statusClass(status, anamnese, servico) {
  if (servico?.exige_anamnese && anamnese && anamnese.existe === false) {
    return "badge badge-anamnese";
  }

  switch (status) {
    case "pendente":
      return "badge badge-pendente";
    case "confirmado":
      return "badge badge-confirmado";
    case "concluido":
      return "badge badge-concluido";
    case "cancelado":
      return "badge badge-cancelado";
    default:
      return "badge";
  }
}

function clienteTipoClass(tipo) {
  if (tipo === "nova") return "badge badge-nova";
  if (tipo === "recorrente") return "badge badge-recorrente";
  return "badge";
}

const labelMap = {
  idade: "Idade",
  profissao: "Profissão / onde trabalha",
  como_nos_conheceu: "Como nos conheceu",
  doencas_diagnosticadas: "Doenças diagnosticadas",
  outras_condicoes_saude: "Outras condições de saúde",
  gestante_amamentando: "Gestante ou amamentando",
  usa_medicacao_continua: "Usa medicação contínua",
  qual_medicacao_continua: "Qual medicação",
  reacao_alergica_produto: "Reação alérgica a produto",
  descricao_alergia: "Descrição da alergia",
  tipo_pele: "Tipo de pele",
  doencas_pele: "Doenças de pele",
  sensibilidade_problema_ocular: "Sensibilidade ou problema ocular",
  descricao_problema_ocular: "Descrição do problema ocular",
  exposicao_solar_frequente: "Exposição solar frequente",
  usa_protetor_solar: "Usa protetor solar",
  realizou_procedimento_antes: "Realizou este procedimento antes",
  onde_quando_procedimento_anterior: "Onde e quando (procedimento anterior)",
  procedimento_ultimos_30_dias: "Procedimento nos últimos 30 dias",
  qual_procedimento_recente: "Qual procedimento recente",
  reacao_adversa_estetica: "Reação adversa a procedimento estético",
  descricao_reacao_adversa: "Descrição da reação adversa",
  uso_cigarro_alcool: "Uso de cigarro ou álcool",
  expectativa_procedimento: "Expectativa do procedimento",
  observacoes_adicionais: "Observações adicionais",
  consentimento: "Consentimento assinado",
};

function formatarValorAnamnese(valor) {
  if (valor === true) return "Sim";
  if (valor === false) return "Não";
  if (Array.isArray(valor)) return valor.length ? valor.join(", ") : "Nenhuma";
  return String(valor || "-");
}

function gerarPDFAdmin(respostas, telefone, dataHora) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ML = 15;
  const MR = 15;
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const TW = W - ML - MR;
  const BOTTOM = 22;
  let y = 20;

  function novaPagina() {
    doc.addPage();
    y = 20;
  }

  function checarPagina(espaco = 12) {
    if (y + espaco > H - BOTTOM) novaPagina();
  }

  function titulo(texto) {
    checarPagina(16);
    doc.setFillColor(243, 244, 246);
    doc.rect(ML - 2, y - 5, TW + 4, 8, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.text(texto, ML, y);
    y += 7;
  }

  function campo(label, valor) {
    const val = valor || "—";
    checarPagina(10);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(107, 114, 128);
    doc.text(label, ML, y);
    y += 4.5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 41, 55);
    const linhas = doc.splitTextToSize(val, TW - 4);
    checarPagina(linhas.length * 4.5 + 3);
    doc.text(linhas, ML + 2, y);
    y += linhas.length * 4.5 + 3;
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Ficha de Anamnese — JA Clínica", ML, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(`Preenchida em: ${dataHora}`, ML, y);
  y += 5;
  doc.text(`Telefone: ${telefone}`, ML, y);
  y += 7;
  doc.setDrawColor(209, 213, 219);
  doc.line(ML, y, W - MR, y);
  y += 8;

  titulo("1. Dados Pessoais");
  campo("Idade:", respostas.idade ? `${respostas.idade} anos` : "");
  campo("Profissão / onde trabalha:", respostas.profissao);
  campo("Como nos conheceu:", respostas.como_nos_conheceu);
  y += 2;

  titulo("2. Saúde Geral");
  const doencas = respostas.doencas_diagnosticadas?.length
    ? respostas.doencas_diagnosticadas.join(", ")
    : "Nenhuma informada";
  campo("Doenças diagnosticadas:", doencas);
  if (respostas.outras_condicoes_saude) {
    campo("Outras condições de saúde:", respostas.outras_condicoes_saude);
  }
  campo("Gestante ou amamentando:", respostas.gestante_amamentando);
  campo("Usa medicação contínua:", respostas.usa_medicacao_continua);
  if (respostas.usa_medicacao_continua === "sim") {
    campo("Qual medicação:", respostas.qual_medicacao_continua || "Não especificado");
  }
  campo("Reação alérgica a produto:", respostas.reacao_alergica_produto);
  if (respostas.reacao_alergica_produto === "sim") {
    campo("Descrição da alergia:", respostas.descricao_alergia || "Não especificado");
  }
  y += 2;

  titulo("3. Condições da Pele e Região");
  campo("Tipo de pele:", respostas.tipo_pele);
  const dpele = respostas.doencas_pele?.length
    ? respostas.doencas_pele.join(", ")
    : "Nenhuma informada";
  campo("Doenças de pele diagnosticadas:", dpele);
  campo("Sensibilidade ou problema ocular:", respostas.sensibilidade_problema_ocular);
  if (respostas.sensibilidade_problema_ocular === "sim") {
    campo("Descrição:", respostas.descricao_problema_ocular || "Não especificado");
  }
  campo("Exposição solar frequente:", respostas.exposicao_solar_frequente);
  campo("Usa protetor solar:", respostas.usa_protetor_solar);
  y += 2;

  titulo("4. Histórico Estético");
  campo("Realizou este procedimento antes:", respostas.realizou_procedimento_antes);
  if (respostas.realizou_procedimento_antes === "sim") {
    campo("Onde e quando:", respostas.onde_quando_procedimento_anterior || "Não especificado");
  }
  campo("Procedimento nos últimos 30 dias na região:", respostas.procedimento_ultimos_30_dias);
  if (respostas.procedimento_ultimos_30_dias === "sim") {
    campo("Qual procedimento:", respostas.qual_procedimento_recente || "Não especificado");
  }
  campo("Reação adversa a procedimento estético:", respostas.reacao_adversa_estetica);
  if (respostas.reacao_adversa_estetica === "sim") {
    campo("Descrição da reação:", respostas.descricao_reacao_adversa || "Não especificado");
  }
  campo("Uso de cigarro ou álcool:", respostas.uso_cigarro_alcool);
  y += 2;

  titulo("5. Expectativas");
  campo("O que espera do procedimento:", respostas.expectativa_procedimento || "Não informado");
  if (respostas.observacoes_adicionais) {
    campo("Observações adicionais:", respostas.observacoes_adicionais);
  }
  y += 2;

  checarPagina(55);
  doc.setDrawColor(209, 213, 219);
  doc.line(ML, y, W - MR, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(55, 65, 81);
  doc.text("Termo de Consentimento", ML, y);
  y += 6;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  const termoTexto =
    `Declaro que as informações fornecidas acima são verdadeiras e completas. ` +
    `Autorizo a realização do procedimento e estou ciente de que informações incorretas ` +
    `podem comprometer o resultado e minha segurança. Este registro foi realizado ` +
    `digitalmente em ${dataHora} e tem validade legal conforme o Marco Civil da ` +
    `Internet (Lei 12.965/2014).`;
  const termoLinhas = doc.splitTextToSize(termoTexto, TW);
  checarPagina(termoLinhas.length * 4 + 18);
  doc.text(termoLinhas, ML, y);
  y += termoLinhas.length * 4 + 12;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(31, 41, 55);
  doc.text("Assinatura da cliente: ___________________________", ML, y);

  const dataArquivo = new Date()
    .toLocaleDateString("pt-BR")
    .replace(/\//g, "-");
  doc.save(`anamnese_${telefone}_${dataArquivo}.pdf`);
}

function gerarLinkWhatsApp(telefone, nome, servico, inicio) {
  const numero = "55" + telefone.replace(/\D/g, "");
  const data = inicio
    ? new Date(inicio).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "";
  const hora = inicio
    ? new Date(inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";
  const mensagem =
    `Olá ${nome}! Tudo bem? 😊\n` +
    `Passando para confirmar seu agendamento de *${servico}* ` +
    `para o dia *${data}* às *${hora}*.\n` +
    `Qualquer dúvida estamos à disposição!`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

function DetalheClienteModal({ agendamento, onClose }) {
  if (!agendamento) return null;

  const cliente = agendamento.cliente || {};
  const servico = agendamento.servicos || {};
  const anamnese = agendamento.anamnese || {};
  const historico = agendamento.historico || [];

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h2 className="admin-modal-title">{agendamento.nome}</h2>
            <p className="admin-modal-subtitle">{agendamento.telefone}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <a
              href={gerarLinkWhatsApp(
                agendamento.telefone,
                agendamento.nome,
                servico.nome || "procedimento",
                agendamento.inicio,
              )}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "#25D366",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.45rem 0.9rem",
                fontWeight: "600",
                fontSize: "0.85rem",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              💬 WhatsApp
            </a>
            <button className="admin-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="admin-modal-grid">
          <div className="admin-card">
            <h3>Resumo</h3>
            <p>
              <strong>Serviço:</strong> {servico.nome || "-"}
            </p>
            <p>
              <strong>Horário:</strong> {formatarDataHora(agendamento.inicio)}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={statusClass(agendamento.status, anamnese)}>
                {statusLabel(agendamento.status, anamnese)}
              </span>
            </p>
          </div>

          <div className="admin-card">
            <h3>Cliente</h3>
            <p>
              <strong>Perfil:</strong>{" "}
              <span className={clienteTipoClass(cliente.tipo)}>
                {cliente.tipo === "nova" ? "Nova cliente" : "Recorrente"}
              </span>
            </p>
            <p>
              <strong>Visitas no mês:</strong> {cliente.visitas_mes ?? 0}
            </p>
            <p>
              <strong>Total de visitas:</strong> {cliente.total_visitas ?? 0}
            </p>
            <p>
              <strong>Última visita:</strong>{" "}
              {cliente.ultima_visita
                ? formatarDataHora(cliente.ultima_visita)
                : "-"}
            </p>
          </div>

          <div className="admin-card">
            <h3>Anamnese</h3>
            <p>
              <strong>Status:</strong>{" "}
              {anamnese.existe ? "Preenchida" : "Não encontrada"}
            </p>
            <p>
              <strong>Tipo:</strong> {anamnese.tipo || "-"}
            </p>

            {anamnese.respostas ? (
              <>
                <div className="anamnese-respostas">
                  {Object.entries(anamnese.respostas).map(([chave, valor]) => (
                    <div key={chave} className="anamnese-item">
                      <strong>{labelMap[chave] || chave}:</strong>{" "}
                      <span>{formatarValorAnamnese(valor)}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="btn-outline"
                  style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}
                  onClick={() =>
                    gerarPDFAdmin(
                      anamnese.respostas,
                      agendamento.telefone,
                      formatarDataHora(anamnese.created_at),
                    )
                  }
                >
                  Baixar PDF da anamnese
                </button>
              </>
            ) : (
              <p className="admin-muted">Sem respostas carregadas.</p>
            )}
          </div>

          <div className="admin-card">
            <h3>Histórico</h3>

            {historico.length === 0 ? (
              <p className="admin-muted">Sem histórico disponível.</p>
            ) : (
              <div className="admin-history-list">
                {historico.map((item) => (
                  <div key={item.id} className="admin-history-item">
                    <div>
                      <strong>{item.servicos?.nome || "Serviço"}</strong>
                      <p>{formatarDataHora(item.inicio)}</p>
                    </div>

                    <span className={statusClass(item.status)}>
                      {statusLabel(item.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [dia, setDia] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [selecionado, setSelecionado] = useState(null);
  const navigate = useNavigate();

useEffect(() => {
  carregarAgendamentos();

  const interval = setInterval(() => {
    carregarAgendamentos();
  }, 60000); // 1 minuto

  return () => clearInterval(interval);
}, [dia]);
  async function carregarAgendamentos() {
    try {
      setLoading(true);
      setMsg("");

      const query = dia ? `?dia=${encodeURIComponent(dia)}` : "";

      const res = await fetch(`${API_URL}/api/admin/agendamentos${query}`, {
        headers: authHeaders(),
      });

      if (res.status === 401) {
        removeToken();
        navigate("/admin-login", { replace: true });
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error || "Erro ao carregar agendamentos.");
        setAgendamentos([]);
        return;
      }

      setAgendamentos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("ERRO ADMIN AGENDAMENTOS:", error);
      setMsg("Não foi possível carregar os agendamentos.");
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  }

  async function atualizarStatus(id, status) {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/agendamentos/${id}/status`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ status }),
        },
      );

      if (res.status === 401) {
        removeToken();
        navigate("/admin-login", { replace: true });
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error || "Erro ao atualizar status.");
        return;
      }

      setAgendamentos((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: data.status } : item,
        ),
      );

      if (selecionado?.id === id) {
        setSelecionado((prev) => ({
          ...prev,
          status: data.status,
        }));
      }
    } catch (error) {
      console.log("ERRO PATCH STATUS:", error);
      alert("Não foi possível atualizar o status.");
    }
  }

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter((item) => {
      const matchBusca =
        !busca ||
        item.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        item.telefone?.includes(busca);

      const statusVisual =
  item.servicos?.exige_anamnese && item.anamnese && item.anamnese.existe === false
    ? "aguardando_anamnese"
    : item.status;

      const matchStatus = !filtroStatus || statusVisual === filtroStatus;

      return matchBusca && matchStatus;
    });
  }, [agendamentos, busca, filtroStatus]);

  const resumo = useMemo(() => {
    return {
      total: agendamentosFiltrados.length,
      pendentes: agendamentosFiltrados.filter((a) => a.status === "pendente")
        .length,
      confirmados: agendamentosFiltrados.filter(
        (a) => a.status === "confirmado",
      ).length,
      concluidos: agendamentosFiltrados.filter((a) => a.status === "concluido")
        .length,
      aguardandoAnamnese: agendamentosFiltrados.filter(
        (a) =>
    a.servicos?.exige_anamnese &&
    a.anamnese &&
    a.anamnese.existe === false,
      ).length,
    };
  }, [agendamentosFiltrados]);

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <h1 className="admin-title">Painel de Agendamentos</h1>

        <div className="admin-filters">
          <input
            type="date"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
            className="admin-input"
          />

          <input
            type="text"
            placeholder="Buscar por nome ou telefone"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="admin-input"
          />

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="admin-input"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendentes</option>
            <option value="confirmado">Confirmados</option>
            <option value="concluido">Concluídos</option>
            <option value="cancelado">Cancelados</option>
            <option value="aguardando_anamnese">Aguardando anamnese</option>
          </select>
        </div>
      </div>

      <div className="admin-summary-grid">
        <div className="summary-card">
          <span>Total</span>
          <strong>{resumo.total}</strong>
        </div>
        <div className="summary-card">
          <span>Pendentes</span>
          <strong>{resumo.pendentes}</strong>
        </div>
        <div className="summary-card">
          <span>Confirmados</span>
          <strong>{resumo.confirmados}</strong>
        </div>
        <div className="summary-card">
          <span>Concluídos</span>
          <strong>{resumo.concluidos}</strong>
        </div>
        <div className="summary-card">
          <span>Aguardando anamnese</span>
          <strong>{resumo.aguardandoAnamnese}</strong>
        </div>
      </div>

      {msg && <p className="admin-msg">{msg}</p>}

      {loading ? (
        <p className="admin-msg">Carregando agendamentos...</p>
      ) : agendamentosFiltrados.length === 0 ? (
        <p className="admin-msg">Nenhum agendamento encontrado.</p>
      ) : (
        <div className="admin-list">
          {agendamentosFiltrados.map((ag) => (
            <div key={ag.id} className="admin-item">
              <div className="admin-item-main">
                <div className="admin-item-time">{formatarHora(ag.inicio)}</div>

                <div className="admin-item-info">
                  <h3>{ag.nome}</h3>
                  <p>{ag.servicos?.nome || "Serviço"}</p>
                  <p>{ag.telefone}</p>

                  <div className="admin-badges">
                    <span className={statusClass(ag.status, ag.anamnese)}>
                      {statusLabel(ag.status, ag.anamnese)}
                    </span>

                    {ag.cliente?.tipo && (
                      <span className={clienteTipoClass(ag.cliente.tipo)}>
                        {ag.cliente.tipo === "nova"
                          ? "Nova cliente"
                          : "Recorrente"}
                      </span>
                    )}

                    {typeof ag.cliente?.visitas_mes === "number" && (
                      <span className="badge badge-info">
                        {ag.cliente.visitas_mes}x no mês
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-item-actions">
                <button
                  className="btn-outline"
                  onClick={() => setSelecionado(ag)}
                >
                  Ver detalhes
                </button>

                <select
                  value={ag.status}
                  onChange={(e) => atualizarStatus(ag.id, e.target.value)}
                  className="admin-status-select"
                >
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <DetalheClienteModal
        agendamento={selecionado}
        onClose={() => setSelecionado(null)}
      />
    </div>
  );
}
