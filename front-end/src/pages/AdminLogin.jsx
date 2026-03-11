import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  function entrar(e) {
    e.preventDefault();
    setErro("");

    if (!senha.trim()) {
      setErro("Digite a senha do admin.");
      return;
    }

    localStorage.setItem("admin_password", senha.trim());
    navigate("/admin");
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login Admin</h1>
        <p style={styles.subtitle}>
          Acesse o painel administrativo da Clínica JA
        </p>

        <form onSubmit={entrar}>
          {erro && <p style={styles.erro}>{erro}</p>}

          <input
            type="password"
            placeholder="Digite a senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #f8f6f8 0%, #fdf1fb 50%, #f8f6f8 100%)",
    padding: "20px",
    fontFamily: "Poppins, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "18px",
    padding: "32px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: {
    margin: 0,
    color: "#2b1d26",
    fontSize: "2rem",
  },
  subtitle: {
    color: "#6b5b65",
    margin: "8px 0 24px",
    lineHeight: 1.5,
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginBottom: "14px",
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
  },
  button: {
    width: "100%",
    background: "#ff57e3",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    fontWeight: "700",
    fontSize: "1rem",
    cursor: "pointer",
  },
  erro: {
    color: "#b42318",
    marginBottom: "10px",
    fontSize: "0.95rem",
  },
};
