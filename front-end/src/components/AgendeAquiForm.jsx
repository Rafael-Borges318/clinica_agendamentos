import { useEffect, useState } from "react";
import AnamneseForm from "./AnamneseForm";

const API_URL = import.meta.env.VITE_API_URL;

export default function AgendeAquiForm() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [horarios, setHorarios] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [selectedInicioISO, setSelectedInicioISO] = useState("");

  const [mostrarAnamnese, setMostrarAnamnese] = useState(false);
  const [dadosAnamnese, setDadosAnamnese] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    servico_id: "",
    data: "",
  });

  function getTodayLocalDate() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().split("T")[0];
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/servicos`);
        const data = await res.json().catch(() => null);

        console.log("SERVICOS STATUS:", res.status);
        console.log("SERVICOS DATA:", data);

        if (!res.ok) {
          setMsg(data?.error || "Não consegui carregar os serviços.");
          return;
        }

        setServicos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.log("ERRO FETCH SERVICOS:", e);
        setMsg("Não foi possível carregar os serviços.");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
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

    setForm((prev) => ({ ...prev, [name]: value }));

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
      if (!form.nome.trim()) {
        setMsg("Informe seu nome para continuar.");
        return;
      }

      if (!form.telefone.trim()) {
        setMsg("Informe seu WhatsApp para continuar.");
        return;
      }

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

      const dataBR = (form.data || "").split("-").reverse().join("/");
      const horarioLabel =
        horarios.find((h) => h.inicioISO === selectedInicioISO)?.label || "";
      const servicoSelecionado =
        servicos.find((s) => s.id === form.servico_id) || null;
      const servicoNome = servicoSelecionado?.nome || "Serviço";
      const nomeCliente = form.nome.trim();
      const telefoneCliente = form.telefone.trim();

      if (data?.precisa_anamnese) {
        setDadosAnamnese({
          telefone: telefoneCliente,
          tipo:
            data?.tipo_anamnese || servicoSelecionado?.tipo_anamnese || "geral",
          nomeCliente,
          servicoNome,
          dataBR,
          horarioLabel,
        });

        setMostrarAnamnese(true);

        setMsg(`Agendamento realizado com sucesso!

Antes de finalizar, precisamos que você preencha sua ficha de anamnese.`);
        return;
      }

      setMsg(`Agendamento realizado com sucesso!

Nome: ${nomeCliente}
Serviço: ${servicoNome}
Data: ${dataBR}
Horário: ${horarioLabel}

Seu horário foi registrado com sucesso. Em breve entraremos em contato para confirmação.`);

      setForm({ nome: "", telefone: "", servico_id: "", data: "" });
      setHorarios([]);
      setSelectedInicioISO("");
    } catch (e) {
      console.log("ERRO SUBMIT:", e);
      setMsg(`Erro ao enviar: ${e?.message || "desconhecido"}`);
    } finally {
      setLoading(false);
    }
  };

  if (mostrarAnamnese && dadosAnamnese) {
    return (
      <div className="agende-form">
        <AnamneseForm
          telefone={dadosAnamnese.telefone}
          tipo={dadosAnamnese.tipo}
          onSuccess={() => {
            setMostrarAnamnese(false);

            setMsg(`Agendamento realizado com sucesso!

Nome: ${dadosAnamnese.nomeCliente}
Serviço: ${dadosAnamnese.servicoNome}
Data: ${dadosAnamnese.dataBR}
Horário: ${dadosAnamnese.horarioLabel}

Ficha de anamnese enviada com sucesso.
Seu horário foi registrado e em breve entraremos em contato para confirmação.`);

            setForm({ nome: "", telefone: "", servico_id: "", data: "" });
            setHorarios([]);
            setSelectedInicioISO("");
            setDadosAnamnese(null);
          }}
        />

        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            setMostrarAnamnese(false);
            setDadosAnamnese(null);
            setMsg("Preenchimento da anamnese cancelado.");
          }}
          style={{ marginTop: "12px" }}
        >
          Voltar
        </button>

        {msg && <p className="agende-msg">{msg}</p>}
      </div>
    );
  }

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
          min={getTodayLocalDate()}
          onChange={onChange}
          required
        />
      </div>

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