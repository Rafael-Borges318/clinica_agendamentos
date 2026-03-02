import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AgendeAquiForm() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    servico_id: "",
    data: "",
    hora: "",
  });

  // ✅ Buscar serviços e mostrar erro se falhar (pra você enxergar o problema)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/servicos`);

        if (!res.ok) {
          setMsg("Não consegui carregar os serviços. Verifique o backend.");
          return;
        }

        const data = await res.json();
        setServicos(Array.isArray(data) ? data : []);
      } catch {
        setMsg("Falha ao conectar no backend para buscar serviços.");
      }
    })();
  }, [API_URL]);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  function buildInicioISO(data, hora) {
    return `${data}T${hora}:00-03:00`;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const inicio = buildInicioISO(form.data, form.hora);
      const servicoIdNum = Number(form.servico_id);

      const payload = {
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        servico_id: servicoIdNum,
        inicio,
      };

      // Debug no console do navegador
      console.log("ENVIANDO:", payload);

      if (
        !payload.nome ||
        !payload.telefone ||
        !payload.inicio ||
        !Number.isFinite(servicoIdNum) ||
        servicoIdNum <= 0
      ) {
        setMsg("Preencha todos os campos (incluindo o serviço).");
        return;
      }

      const res = await fetch(`${API_URL}/api/agendamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error || "Não foi possível enviar. Verifique os dados.");
        return;
      }

      setMsg(
        "✅ Pedido enviado! Em breve confirmamos seu horário no WhatsApp.",
      );
      setForm({ nome: "", telefone: "", servico_id: "", data: "", hora: "" });
    } catch (err) {
      setMsg("❌ Falha de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="agende-form">
      <input
        name="nome"
        value={form.nome}
        onChange={onChange}
        placeholder="Seu nome"
        required
      />

      <input
        name="telefone"
        value={form.telefone}
        onChange={onChange}
        placeholder="WhatsApp"
        required
      />

      <select
        name="servico_id"
        value={form.servico_id}
        onChange={onChange}
        required
        disabled={!servicos.length}
      >
        <option value="">
          {servicos.length ? "Selecione o serviço" : "Carregando serviços..."}
        </option>

        {servicos.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nome}
          </option>
        ))}
      </select>

      <div className="agende-row">
        <input
          type="date"
          name="data"
          value={form.data}
          onChange={onChange}
          required
        />
        <input
          type="time"
          name="hora"
          value={form.hora}
          onChange={onChange}
          required
        />
      </div>

      <button className="btn-outline" disabled={loading}>
        {loading ? "Enviando..." : "Solicitar agendamento"}
      </button>

      {msg && <p className="agende-msg">{msg}</p>}

      <a
        href="https://wa.me/5551995262780"
        target="_blank"
        rel="noreferrer"
        className="agende-whats"
      >
        Prefere agendar pelo WhatsApp?
      </a>
    </form>
  );
}
