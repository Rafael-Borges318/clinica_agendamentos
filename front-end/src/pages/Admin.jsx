import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authHeaders, removeToken } from "../lib/auth";

const API_URL = import.meta.env.VITE_API_URL;

export default function Admin() {
  const navigate = useNavigate();

  const [servicos, setServicos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");
  const [dataSelecionada, setDataSelecionada] = useState("");

  function logout() {
    removeToken();
    navigate("/admin-login", { replace: true });
  }

  async function fetchComAuth(url) {
    const res = await fetch(url, {
      headers: authHeaders(),
    });

    if (res.status === 401) {
      removeToken();
      navigate("/admin-login", { replace: true });
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Erro na requisição");
    }

    return data;
  }

  function isSameDay(dateA, dateB) {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getEndOfWeek(date) {
    const d = getStartOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  const agendamentosFiltrados = agendamentos.filter((ag) => {
    const dataAg = new Date(ag.inicio);
    const hoje = new Date();

    if (dataSelecionada) {
      const [ano, mes, dia] = dataSelecionada.split("-").map(Number);
      const dataFiltro = new Date(ano, mes - 1, dia);
      return isSameDay(dataAg, dataFiltro);
    }

    if (filtroPeriodo === "todos") return true;

    if (filtroPeriodo === "dia") {
      return isSameDay(dataAg, hoje);
    }

    if (filtroPeriodo === "semana") {
      const inicioSemana = getStartOfWeek(hoje);
      const fimSemana = getEndOfWeek(hoje);
      return dataAg >= inicioSemana && dataAg <= fimSemana;
    }

    if (filtroPeriodo === "mes") {
      return (
        dataAg.getFullYear() === hoje.getFullYear() &&
        dataAg.getMonth() === hoje.getMonth()
      );
    }

    return true;
  });

  async function carregarDados() {
    try {
      setErro("");
      setSucesso("");
      setLoading(true);

      const [servicosData, agendamentosData] = await Promise.all([
        fetchComAuth(`${API_URL}/api/admin/servicos`),
        fetchComAuth(`${API_URL}/api/admin/agendamentos`),
      ]);

      setServicos(servicosData);
      setAgendamentos(agendamentosData);
    } catch (err) {
      setErro(err.message || "Erro ao carregar painel");
    } finally {
      setLoading(false);
    }
  }

  async function atualizarStatus(id, status) {
    try {
      setErro("");
      setSucesso("");

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Erro ao atualizar status");
      }

      setAgendamentos((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item)),
      );

      setSucesso("Status atualizado com sucesso.");
    } catch (err) {
      setErro(err.message || "Erro ao atualizar status");
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Painel Admin</h1>
            <p style={styles.subtitle}>
              Gerencie serviços e acompanhe os agendamentos da clínica.
            </p>
          </div>

          <div style={styles.actions}>
            <button style={styles.refreshButton} onClick={carregarDados}>
              Atualizar
            </button>
            <button style={styles.logoutButton} onClick={logout}>
              Sair
            </button>
          </div>
        </header>

        {sucesso ? <div style={styles.success}>{sucesso}</div> : null}
        {erro ? <div style={styles.error}>{erro}</div> : null}

        {loading ? (
          <div style={styles.infoBox}>Carregando painel...</div>
        ) : (
          <>
            <section style={styles.filtersCard}>
              <div style={styles.filterGroup}>
                <span style={styles.label}>Total de serviços</span>
                <strong>{servicos.length}</strong>
              </div>

              <div style={styles.filterGroup}>
                <span style={styles.label}>Total de agendamentos</span>
                <strong>{agendamentos.length}</strong>
              </div>
            </section>

            <section style={{ marginBottom: "24px" }}>
              <h2 style={{ marginBottom: "12px" }}>Serviços</h2>

              {servicos.length === 0 ? (
                <div style={styles.infoBox}>Nenhum serviço encontrado.</div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Nome</th>
                        <th style={styles.th}>Duração</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicos.map((servico) => (
                        <tr key={servico.id}>
                          <td style={styles.td}>{servico.nome}</td>
                          <td style={styles.td}>{servico.duracao_min} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section style={styles.filtersCard}>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Filtrar por período</label>
                <select
                  style={styles.input}
                  value={filtroPeriodo}
                  onChange={(e) => {
                    setFiltroPeriodo(e.target.value);
                    setDataSelecionada("");
                  }}
                >
                  <option value="todos">Todos os agendamentos</option>
                  <option value="mes">Agendamentos do mês</option>
                  <option value="semana">Agendamentos da semana</option>
                  <option value="dia">Agendamentos do dia</option>
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>Ou escolher uma data</label>
                <input
                  type="date"
                  style={styles.input}
                  value={dataSelecionada}
                  onChange={(e) => {
                    setDataSelecionada(e.target.value);
                    if (e.target.value) {
                      setFiltroPeriodo("todos");
                    }
                  }}
                />
              </div>
            </section>

            <section>
              <h2 style={{ marginBottom: "12px" }}>Agendamentos</h2>

              {agendamentosFiltrados.length === 0 ? (
                <div style={styles.infoBox}>Nenhum agendamento encontrado.</div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Nome</th>
                        <th style={styles.th}>Telefone</th>
                        <th style={styles.th}>Início</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agendamentosFiltrados.map((ag) => (
                        <tr key={ag.id}>
                          <td style={styles.td}>{ag.nome}</td>
                          <td style={styles.td}>{ag.telefone}</td>
                          <td style={styles.td}>
                            {new Date(ag.inicio).toLocaleString("pt-BR")}
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.badge,
                                ...(ag.status === "pendente"
                                  ? styles.badgePending
                                  : ag.status === "confirmado"
                                    ? styles.badgeConfirmed
                                    : ag.status === "concluido"
                                      ? styles.badgeDone
                                      : styles.badgeCanceled),
                              }}
                            >
                              {ag.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <select
                              style={styles.input}
                              value={ag.status}
                              onChange={(e) =>
                                atualizarStatus(ag.id, e.target.value)
                              }
                            >
                              <option value="pendente">pendente</option>
                              <option value="confirmado">confirmado</option>
                              <option value="cancelado">cancelado</option>
                              <option value="concluido">concluido</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
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
    background: "#fff",
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
};
