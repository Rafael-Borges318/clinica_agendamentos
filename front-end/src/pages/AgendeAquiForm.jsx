import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AgendeAquiForm() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // horários disponíveis
  const [horarios, setHorarios] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [selectedInicioISO, setSelectedInicioISO] = useState("");

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    servico_id: "",
    data: "", // YYYY-MM-DD
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/servicos`);
        const data = await res.json().catch(() => null);

        console.log("SERVICOS STATUS:", res.status);
        console.log("SERVICOS DATA:", data);

        if (!res.ok) {
          setMsg(data?.error || "Não consegui carregar os serviços (API).");
          return;
        }

        setServicos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.log("ERRO FETCH SERVICOS:", e);
        if (!res.ok) {
          setMsg(data?.error || "Não foi possível enviar. Verifique os dados.");
          return;
        }

        // ✅ formata YYYY-MM-DD -> DD/MM/YYYY
        const dataBR = (form.data || "").split("-").reverse().join("/");

        // ✅ pega o label do horário escolhido
        const horarioLabel =
          horarios.find((h) => h.inicioISO === selectedInicioISO)?.label || "";

        setMsg(`✅ Agendamento solicitado!

Data: ${dataBR}
Horário: ${horarioLabel}`);

        // limpa após um tempinho (pra pessoa ver a msg)
        setTimeout(() => {
          setForm({ nome: "", telefone: "", servico_id: "", data: "" });
          setHorarios([]);
          setSelectedInicioISO("");
        }, 300);
      }
    })();
  }, []);

  // ✅ Buscar horários quando escolher serviço + data
  useEffect(() => {
    (async () => {
      try {
        setMsg("");
        setHorarios([]);
        setSelectedInicioISO("");

        if (!form.data || !form.servico_id) return;

        setLoadingHorarios(true);

        const url = `${API_URL}/api/horarios-disponiveis?dia=${encodeURIComponent(
          form.data,
        )}&servico_id=${encodeURIComponent(form.servico_id)}`;

        const res = await fetch(url);
        const data = await res.json().catch(() => ({}));

        console.log("HORARIOS STATUS:", res.status);
        console.log("HORARIOS DATA:", data);

        if (!res.ok) {
          setMsg(data?.error || "Não consegui carregar os horários.");
          return;
        }

        setHorarios(Array.isArray(data?.horarios) ? data.horarios : []);
      } catch (e) {
        console.log("ERRO FETCH HORARIOS:", e);
        setMsg("Falha ao buscar horários disponíveis.");
      } finally {
        setLoadingHorarios(false);
      }
    })();
  }, [form.data, form.servico_id]);

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((p) => ({ ...p, [name]: value }));

    // se trocar serviço ou data, limpa seleção de horário
    if (name === "servico_id" || name === "data") {
      setSelectedInicioISO("");
      setHorarios([]);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      if (!form.servico_id) {
        setMsg("Escolha um serviço para continuar.");
        return;
      }
      if (!form.data) {
        setMsg("Escolha uma data para continuar.");
        return;
      }
      if (!selectedInicioISO) {
        setMsg("Escolha um horário disponível para continuar.");
        return;
      }

      const payload = {
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        servico_id: String(form.servico_id).trim(),
        inicio: selectedInicioISO,
      };

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

      setMsg("Pedido enviado! Em breve confirmamos seu horário no WhatsApp.");
      setForm({ nome: "", telefone: "", servico_id: "", data: "" });
      setHorarios([]);
      setSelectedInicioISO("");
    } catch (e) {
      console.log("ERRO SUBMIT:", e);
      setMsg(`❌ Erro ao enviar: ${e?.message || "desconhecido"}`);
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
      </div>

      {/* ✅ Horários disponíveis */}
      <div className="agende-horarios">
        <div className="agende-horarios-title">Selecione um horário</div>

        {!form.data || !form.servico_id ? (
          <p className="agende-hint">
            Escolha o serviço e a data para ver os horários.
          </p>
        ) : loadingHorarios ? (
          <p className="agende-hint">Carregando horários...</p>
        ) : horarios.length === 0 ? (
          <p className="agende-hint">
            Nenhum horário disponível para essa data.
          </p>
        ) : (
          <div className="agende-horarios-grid">
            {horarios.map((h) => {
              const active = selectedInicioISO === h.inicioISO;
              return (
                <button
                  key={h.inicioISO}
                  type="button"
                  className={`agende-horario-btn ${active ? "active" : ""}`}
                  onClick={() => setSelectedInicioISO(h.inicioISO)}
                  aria-pressed={active}
                >
                  {h.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        className="btn-outline"
        disabled={
          loading || !form.servico_id || !form.data || !selectedInicioISO
        }
      >
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
