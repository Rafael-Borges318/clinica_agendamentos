import { useNavigate } from "react-router-dom";
import { removeToken } from "../lib/auth";
import AdminAgendamentos from "../components/AdminAgendamentos";

export default function Admin() {
  const navigate = useNavigate();

  function logout() {
    removeToken();
    navigate("/admin-login", { replace: true });
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Painel Admin</h1>
            <p style={styles.subtitle}>
              Gerencie os agendamentos, clientes e anamneses da clínica.
            </p>
          </div>

          <div style={styles.actions}>
            <button style={styles.logoutButton} onClick={logout}>
              Sair
            </button>
          </div>
        </header>

        <AdminAgendamentos />
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
  logoutButton: {
    background: "#2b1d26",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: "600",
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
};
