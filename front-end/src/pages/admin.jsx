import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function formatDateBR(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

function formatTimeBR(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function formatDateInputToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Admin() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [dia, setDia] = useState(formatDateInputToday());
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");

  const navigate = useNavigate();
  const adminPassword = localStorage.getItem("admin_password");

  async function carregarAgendamentos() {
    setLoading(true);
    setErro("");
    setMsg("");

    try {
      const url = `${API_URL}/api/admin/agendamentos?dia=${dia}`;
      console.log("Buscando em:", url);

      const res = await fetch(url, {
        headers: {
          "x-admin-password": adminPassword,
        },
      });

      const data = await res.json().catch(() => ({}));

      console.log("Status:", res.status);
      console.log("Resposta API:", data);

      if (res.status === 401) {
        localStorage.removeItem("admin_password");
        navigate("/admin-login");
        return;
      }

      if (!res.ok) {
        setErro(data?.error || "Erro ao carregar agendamentos.");
        setAgendamentos([]);
        return;
      }

      if (Array.isArray(data)) {
        setAgendamentos(data);
      } else if (Array.isArray(data.agendamentos)) {
        setAgendamentos(data.agendamentos);
      } else {
        setAgendamentos([]);
      }
    } catch (error) {
      console.error(error);
      setErro("Não foi possível conectar ao servidor.");
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  }

  async function atualizarStatusAgendamento(id, status) {
    let textoConfirmacao = "";
    let textoSucesso = "";

    if (status === "cancelado") {
      textoConfirmacao = "Tem certeza que deseja cancelar este agendamento?";
      textoSucesso = "Agendamento cancelado com sucesso.";
    }

    if (status === "concluido") {
      textoConfirmacao = "Tem certeza que deseja concluir este procedimento?";
      textoSucesso = "Procedimento concluído com sucesso.";
    }

    const confirmar = window.confirm(textoConfirmacao);
    if (!confirmar) return;

    setMsg("");
    setErro("");

    try {
      const res = await fetch(
        `${API_URL}/api/admin/agendamentos/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": adminPassword,
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        localStorage.removeItem("admin_password");
        navigate("/admin-login");
        return;
      }

      if (!res.ok) {
        setErro(data?.error || "Erro ao atualizar agendamento.");
        return;
      }

      setMsg(textoSucesso);
      carregarAgendamentos();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível atualizar o agendamento.");
    }
  }

  function cancelarAgendamento(id) {
    atualizarStatusAgendamento(id, "cancelado");
  }

  function concluirAgendamento(id) {
    atualizarStatusAgendamento(id, "concluido");
  }

  function sair() {
    localStorage.removeItem("admin_password");
    navigate("/admin-login");
  }

  useEffect(() => {
    if (!adminPassword) {
      navigate("/admin-login");
      return;
    }

    carregarAgendamentos();
  }, [dia]);

  const agendamentosFiltrados = useMemo(() => {
    if (statusFiltro === "todos") return agendamentos;
    return agendamentos.filter((item) => item.status === statusFiltro);
  }, [agendamentos, statusFiltro]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Painel Admin</h1>
            <p style={styles.subtitle}>
              Gerencie os agendamentos da Clínica JA
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button style={styles.refreshButton} onClick={carregarAgendamentos}>
              Atualizar
            </button>
            <button style={styles.logoutButton} onClick={sair}>
              Sair
            </button>
          </div>
        </div>

        <div style={styles.filtersCard}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Selecionar dia</label>
            <input
              type="date"
              value={dia}
              onChange={(e) => setDia(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Filtrar por status</label>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              style={styles.input}
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="confirmado">Confirmado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {msg && <div style={styles.success}>{msg}</div>}
        {erro && <div style={styles.error}>{erro}</div>}

        {loading ? (
          <div style={styles.infoBox}>Carregando agendamentos...</div>
        ) : agendamentosFiltrados.length === 0 ? (
          <div style={styles.infoBox}>
            Nenhum agendamento encontrado para este dia.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Cliente</th>
                  <th style={styles.th}>Telefone</th>
                  <th style={styles.th}>Serviço</th>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Início</th>
                  <th style={styles.th}>Fim</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {agendamentosFiltrados.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.nome || "-"}</td>
                    <td style={styles.td}>{item.telefone || "-"}</td>
                    <td style={styles.td}>
                      {item.servicos?.nome ||
                        item.servico?.nome ||
                        "Serviço não identificado"}
                    </td>
                    <td style={styles.td}>{formatDateBR(item.inicio)}</td>
                    <td style={styles.td}>{formatTimeBR(item.inicio)}</td>
                    <td style={styles.td}>{formatTimeBR(item.fim)}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          ...(item.status === "pendente"
                            ? styles.badgePending
                            : item.status === "confirmado"
                              ? styles.badgeConfirmed
                              : item.status === "concluido"
                                ? styles.badgeDone
                                : styles.badgeCanceled),
                        }}
                      >
                        {item.status || "-"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {item.status === "cancelado" ? (
                        <span style={styles.cancelledText}>Cancelado</span>
                      ) : item.status === "concluido" ? (
                        <span style={styles.doneText}>Concluído</span>
                      ) : (
                        <div style={styles.actions}>
                          <button
                            style={styles.doneButton}
                            onClick={() => concluirAgendamento(item.id)}
                          >
                            Concluir
                          </button>
                          <button
                            style={styles.cancelButton}
                            onClick={() => cancelarAgendamento(item.id)}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8f6f8",
    padding: "32px 16px",
    fontFamily: "Poppins, sans-serif",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    color: "#2b1d26",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b5b65",
  },
  refreshButton: {
    background: "#ff57e3",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: "600",
  },
  logoutButton: {
    background: "#2b1d26",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: "600",
  },
  filtersCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    marginBottom: "20px",
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "220px",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#2b1d26",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    outline: "none",
  },
  success: {
    background: "#e8fff0",
    color: "#146c2e",
    border: "1px solid #b6ebc5",
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  error: {
    background: "#fff0f0",
    color: "#b42318",
    border: "1px solid #f2b8b5",
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  infoBox: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    textAlign: "center",
    color: "#5e4d57",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  },
  tableWrapper: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "950px",
  },
  th: {
    textAlign: "left",
    padding: "16px",
    background: "#faf2f9",
    color: "#402d39",
    fontSize: "0.95rem",
    borderBottom: "1px solid #eee",
  },
  td: {
    padding: "16px",
    borderBottom: "1px solid #f1f1f1",
    color: "#3b2e36",
    verticalAlign: "middle",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "0.85rem",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  badgePending: {
    background: "#fff4e5",
    color: "#9a6700",
  },
  badgeConfirmed: {
    background: "#e8f0fe",
    color: "#1a73e8",
  },
  badgeDone: {
    background: "#eafbf0",
    color: "#137333",
  },
  badgeCanceled: {
    background: "#fdecec",
    color: "#b42318",
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  doneButton: {
    background: "#137333",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: "600",
  },
  cancelButton: {
    background: "#b42318",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: "600",
  },
  cancelledText: {
    color: "#8a8a8a",
    fontWeight: "600",
  },
  doneText: {
    color: "#137333",
    fontWeight: "600",
  },
};
