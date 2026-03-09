import { useEffect, useMemo, useState } from "react";

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

  const token = localStorage.getItem("admin_token");

  async function carregarAgendamentos() {
    setLoading(true);
    setErro("");
    setMsg("");

    try {
      const url = `${API_URL}/admin/agendamentos?dia=${dia}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data?.error || "Erro ao carregar agendamentos.");
        setAgendamentos([]);
        return;
      }

      setAgendamentos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível conectar ao servidor.");
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  }

  async function cancelarAgendamento(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja cancelar este agendamento?",
    );
    if (!confirmar) return;

    setMsg("");
    setErro("");

    try {
      const res = await fetch(`${API_URL}/admin/agendamentos/${id}/cancelar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data?.error || "Erro ao cancelar agendamento.");
        return;
      }

      setMsg("Agendamento cancelado com sucesso.");
      carregarAgendamentos();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível cancelar o agendamento.");
    }
  }

  useEffect(() => {
    if (!token) {
      setErro("Token admin não encontrado. Faça login novamente.");
      return;
    }
    carregarAgendamentos();
    async function carregarAgendamentos() {
      setLoading(true);
      setErro("");
      setMsg("");

      try {
        const url = `${API_URL}/admin/agendamentos?dia=${dia}`;
        console.log("Buscando em:", url);
        console.log("Token:", token);

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        console.log("Status da resposta:", res.status);
        console.log("Resposta da API:", data);

        if (!res.ok) {
          setErro(data?.error || "Erro ao carregar agendamentos.");
          setAgendamentos([]);
          return;
        }

        // caso o backend retorne direto um array
        if (Array.isArray(data)) {
          setAgendamentos(data);
          return;
        }

        // caso o backend retorne { agendamentos: [...] }
        if (Array.isArray(data.agendamentos)) {
          setAgendamentos(data.agendamentos);
          return;
        }

        // fallback
        setAgendamentos([]);
      } catch (error) {
        console.error("Erro no fetch:", error);
        setErro("Não foi possível conectar ao servidor.");
        setAgendamentos([]);
      } finally {
        setLoading(false);
      }
    }
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

          <button style={styles.refreshButton} onClick={carregarAgendamentos}>
            Atualizar
          </button>
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
                              : styles.badgeCanceled),
                        }}
                      >
                        {item.status || "-"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {item.status !== "cancelado" ? (
                        <button
                          style={styles.cancelButton}
                          onClick={() => cancelarAgendamento(item.id)}
                        >
                          Cancelar
                        </button>
                      ) : (
                        <span style={styles.cancelledText}>Cancelado</span>
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
    background: "#eafbf0",
    color: "#137333",
  },
  badgeCanceled: {
    background: "#fdecec",
    color: "#b42318",
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
};
