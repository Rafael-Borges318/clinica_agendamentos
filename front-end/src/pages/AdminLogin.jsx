import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, saveToken } from "../lib/auth";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Erro ao fazer login");
      }

      saveToken(data.token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setErro(err.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login Admin</h1>
        <p style={styles.subtitle}>
          Entre com seu email e senha para acessar o painel da clínica.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Seu email"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            name="password"
            type="password"
            placeholder="Sua senha"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          {erro ? <p style={styles.erro}>{erro}</p> : null}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
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
