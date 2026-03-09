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
    <div style={{ padding: 40 }}>
      <h1>Login Admin</h1>
      <form onSubmit={entrar}>
        <input
          type="password"
          placeholder="Senha do admin"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f6f8",
    padding: "20px",
    fontFamily: "Poppins, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "18px",
    padding: "28px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: {
    margin: 0,
    color: "#2b1d26",
  },
  subtitle: {
    color: "#6b5b65",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginBottom: "14px",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    background: "#ff57e3",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
  erro: {
    color: "#b42318",
    marginBottom: "10px",
  },
};
