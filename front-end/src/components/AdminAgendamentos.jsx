import { useEffect, useMemo, useState } from "react";
import { authHeaders, removeToken } from "../lib/auth";
import { useNavigate } from "react-router-dom";

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

function statusLabel(status, anamnese) {
  if (anamnese && anamnese.existe === false) {
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

function statusClass(status, anamnese) {
  if (anamnese && anamnese.existe === false) {
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

          <button className="admin-close-btn" onClick={onClose}>
            ✕
          </button>
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
              <div className="anamnese-respostas">
                {Object.entries(anamnese.respostas).map(([chave, valor]) => (
                  <div key={chave} className="anamnese-item">
                    <strong>{chave}:</strong>{" "}
                    <span>{String(valor || "-")}</span>
                  </div>
                ))}
              </div>
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
        item.anamnese && item.anamnese.existe === false
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
        (a) => a.anamnese && a.anamnese.existe === false,
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
