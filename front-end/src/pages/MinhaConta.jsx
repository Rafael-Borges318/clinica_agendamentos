import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnamneseForm from "../components/AnamneseForm";
import {
  saveClienteToken,
  getClienteToken,
  removeClienteToken,
} from "../lib/clienteAuth";

const API_URL = import.meta.env.VITE_API_URL;

function formatarDataHora(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function statusLabel(status) {
  switch (status) {
    case "pendente":
      return "Pendente";
    case "confirmado":
      return "Confirmado";
    case "concluido":
      return "Concluído";
    case "cancelado":
      return "Cancelado";
    default:
      return status || "-";
  }
}

function statusClass(status) {
  switch (status) {
    case "pendente":
      return "badge badge-pendente";
    case "confirmado":
      return "badge badge-confirmado";
    case "concluido":
      return "badge badge-concluido";
    case "cancelado":
      return "badge badge-cancelado";
    default:
      return "badge badge-info";
  }
}

function getTodayLocalDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().split("T")[0];
}

export default function MinhaConta() {
  const [token, setToken] = useState(() => getClienteToken());

  return (
    <main className="conta-page">
      <div className="container conta-container">
        <Link to="/" className="conta-voltar">
          ← Voltar para o site
        </Link>

        {token ? (
          <Painel
            token={token}
            onLogout={() => {
              removeClienteToken();
              setToken(null);
            }}
          />
        ) : (
          <Login
            onLogin={(t) => {
              saveClienteToken(t);
              setToken(t);
            }}
          />
        )}
      </div>
    </main>
  );
}

const ABAS_LOGIN = [
  { id: "senha", label: "Entrar" },
  { id: "cadastro", label: "Criar senha" },
  { id: "codigo", label: "Tenho um código" },
];

function Login({ onLogin }) {
  const [aba, setAba] = useState("senha");

  return (
    <div className="conta-card">
      <h1>Área do Cliente</h1>
      <p className="conta-subtitle">
        Consulte seus horários, remarque e edite sua ficha de anamnese.
      </p>

      <div className="conta-tabs">
        {ABAS_LOGIN.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`conta-tab ${aba === a.id ? "active" : ""}`}
            onClick={() => setAba(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>

      {aba === "senha" && <LoginSenhaForm onLogin={onLogin} />}
      {aba === "cadastro" && (
        <CadastroSenhaForm onLogin={onLogin} onCriado={() => setAba("senha")} />
      )}
      {aba === "codigo" && <LoginCodigoForm onLogin={onLogin} />}
    </div>
  );
}

function LoginSenhaForm({ onLogin }) {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/minha-conta/login-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data?.error || "Não foi possível entrar.");
        return;
      }

      onLogin(data.cliente_token);
    } catch {
      setErro("Falha ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="agende-form">
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={onChange}
        placeholder="Seu email"
        required
      />
      <input
        name="senha"
        type="password"
        value={form.senha}
        onChange={onChange}
        placeholder="Sua senha"
        required
      />

      {erro && <p className="conta-erro">{erro}</p>}

      <button className="btn-outline" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

function CadastroSenhaForm({ onLogin, onCriado }) {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/minha-conta/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data?.error || "Não foi possível criar sua senha.");
        if (res.status === 409) onCriado();
        return;
      }

      onLogin(data.cliente_token);
    } catch {
      setErro("Falha ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
        placeholder="WhatsApp usado no agendamento (Ex: (51) 99999-9999)"
        required
      />
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={onChange}
        placeholder="Seu email"
        required
      />
      <input
        name="senha"
        type="password"
        value={form.senha}
        onChange={onChange}
        placeholder="Crie uma senha (mín. 6 caracteres)"
        minLength={6}
        required
      />

      {erro && <p className="conta-erro">{erro}</p>}

      <button className="btn-outline" disabled={loading}>
        {loading ? "Criando..." : "Criar senha e entrar"}
      </button>
    </form>
  );
}

function LoginCodigoForm({ onLogin }) {
  const [form, setForm] = useState({ telefone: "", codigo_confirmacao: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/minha-conta/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data?.error || "Não foi possível entrar.");
        return;
      }

      onLogin(data.cliente_token);
    } catch {
      setErro("Falha ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="agende-form">
        <input
          name="telefone"
          value={form.telefone}
          onChange={onChange}
          placeholder="WhatsApp (Ex: (51) 99999-9999)"
          required
        />
        <input
          name="codigo_confirmacao"
          value={form.codigo_confirmacao}
          onChange={onChange}
          placeholder="Código de confirmação (Ex: A1B2C3)"
          maxLength={6}
          style={{ textTransform: "uppercase" }}
          required
        />

        {erro && <p className="conta-erro">{erro}</p>}

        <button className="btn-outline" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="agende-hint">
        O código aparece na tela de confirmação logo depois de agendar. Se
        perdeu, fale conosco pelo WhatsApp.
      </p>
    </>
  );
}

function Painel({ token, onLogout }) {
  const [agendamentos, setAgendamentos] = useState(null);
  const [erro, setErro] = useState("");
  const [expandido, setExpandido] = useState(null);

  async function carregar() {
    setErro("");

    try {
      const res = await fetch(`${API_URL}/api/minha-conta/agendamentos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        onLogout();
        return;
      }

      const data = await res.json().catch(() => []);

      if (!res.ok) {
        setErro(data?.error || "Não foi possível carregar seus agendamentos.");
        return;
      }

      setAgendamentos(Array.isArray(data) ? data : []);
    } catch {
      setErro("Falha ao conectar. Tente novamente.");
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const agora = Date.now();

  const proximos = (agendamentos || [])
    .filter(
      (a) => a.status !== "cancelado" && new Date(a.inicio).getTime() >= agora,
    )
    .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));

  const historico = (agendamentos || [])
    .filter(
      (a) => a.status === "cancelado" || new Date(a.inicio).getTime() < agora,
    )
    .sort((a, b) => new Date(b.inicio) - new Date(a.inicio));

  return (
    <div className="conta-card">
      <div className="conta-header-row">
        <h1>Seus agendamentos</h1>
        <button type="button" className="conta-sair" onClick={onLogout}>
          Sair
        </button>
      </div>

      {erro && <p className="conta-erro">{erro}</p>}

      {agendamentos === null && !erro && (
        <p className="agende-hint">Carregando...</p>
      )}

      {agendamentos !== null && (
        <>
          <h2 className="conta-secao-titulo">Próximos</h2>
          {proximos.length === 0 ? (
            <p className="agende-hint">Nenhum agendamento futuro.</p>
          ) : (
            proximos.map((ag) => (
              <AgendamentoItem
                key={ag.id}
                agendamento={ag}
                token={token}
                expandido={expandido?.id === ag.id ? expandido.modo : null}
                onExpandir={(modo) => setExpandido({ id: ag.id, modo })}
                onFechar={() => setExpandido(null)}
                onAtualizado={carregar}
              />
            ))
          )}

          {historico.length > 0 && (
            <>
              <h2 className="conta-secao-titulo">Histórico</h2>
              {historico.map((ag) => (
                <AgendamentoItem
                  key={ag.id}
                  agendamento={ag}
                  somenteLeitura
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

function AgendamentoItem({
  agendamento,
  token,
  expandido,
  onExpandir,
  onFechar,
  onAtualizado,
  somenteLeitura = false,
}) {
  const podeRemarcar =
    !somenteLeitura &&
    (agendamento.status === "pendente" || agendamento.status === "confirmado");
  const exigeAnamnese = !somenteLeitura && !!agendamento.servicos?.exige_anamnese;

  return (
    <div className="conta-item">
      <div className="conta-item-info">
        <strong>{agendamento.servicos?.nome || "Serviço"}</strong>
        <span>{formatarDataHora(agendamento.inicio)}</span>
        <span className={statusClass(agendamento.status)}>
          {statusLabel(agendamento.status)}
        </span>
      </div>

      {!somenteLeitura && (
        <div className="conta-item-actions">
          {podeRemarcar && (
            <button
              type="button"
              className="btn-outline"
              onClick={() =>
                onExpandir(expandido === "remarcar" ? null : "remarcar")
              }
            >
              {expandido === "remarcar" ? "Cancelar" : "Remarcar"}
            </button>
          )}

          {exigeAnamnese && (
            <button
              type="button"
              className="btn-outline"
              onClick={() =>
                onExpandir(expandido === "anamnese" ? null : "anamnese")
              }
            >
              {expandido === "anamnese" ? "Fechar" : "Editar anamnese"}
            </button>
          )}
        </div>
      )}

      {expandido === "remarcar" && (
        <RemarcarPanel
          agendamento={agendamento}
          token={token}
          onCancel={onFechar}
          onDone={() => {
            onFechar();
            onAtualizado();
          }}
        />
      )}

      {expandido === "anamnese" && (
        <AnamnesePanel
          agendamento={agendamento}
          token={token}
          onCancel={onFechar}
          onDone={() => {
            onFechar();
            onAtualizado();
          }}
        />
      )}
    </div>
  );
}

function RemarcarPanel({ agendamento, token, onCancel, onDone }) {
  const [dia, setDia] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [selecionado, setSelecionado] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      setSelecionado("");
      setHorarios([]);

      if (!dia) return;

      setLoadingHorarios(true);

      try {
        const url = `${API_URL}/api/horarios-disponiveis?dia=${encodeURIComponent(
          dia,
        )}&servico_id=${encodeURIComponent(agendamento.servico_id)}`;

        const res = await fetch(url);
        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          setHorarios(Array.isArray(data?.horarios) ? data.horarios : []);
        }
      } finally {
        setLoadingHorarios(false);
      }
    })();
  }, [dia, agendamento.servico_id]);

  async function confirmar() {
    if (!selecionado) return;

    setErro("");
    setSalvando(true);

    try {
      const res = await fetch(
        `${API_URL}/api/minha-conta/agendamentos/${agendamento.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ inicio: selecionado }),
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data?.error || "Não foi possível remarcar.");
        return;
      }

      onDone();
    } catch {
      setErro("Falha ao conectar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="conta-painel">
      <div className="agende-row">
        <input
          type="date"
          value={dia}
          min={getTodayLocalDate()}
          onChange={(e) => setDia(e.target.value)}
        />
      </div>

      <div className="agende-horarios">
        {!dia ? (
          <p className="agende-hint">Escolha uma data para ver os horários.</p>
        ) : loadingHorarios ? (
          <p className="agende-hint">Carregando horários...</p>
        ) : horarios.length === 0 ? (
          <p className="agende-hint">
            Nenhum horário disponível para essa data.
          </p>
        ) : (
          <div className="agende-horarios-grid">
            {horarios.map((h) => (
              <button
                key={h.inicioISO}
                type="button"
                className={`agende-horario-btn ${
                  selecionado === h.inicioISO ? "active" : ""
                }`}
                onClick={() => setSelecionado(h.inicioISO)}
              >
                {h.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {erro && <p className="conta-erro">{erro}</p>}

      <div className="conta-painel-actions">
        <button
          type="button"
          className="btn-outline"
          disabled={!selecionado || salvando}
          onClick={confirmar}
        >
          {salvando ? "Salvando..." : "Confirmar remarcação"}
        </button>
        <button type="button" className="conta-cancelar" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function AnamnesePanel({ agendamento, token, onCancel, onDone }) {
  const [carregando, setCarregando] = useState(true);
  const [respostasIniciais, setRespostasIniciais] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/minha-conta/anamnese/${agendamento.servico_id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const data = await res.json().catch(() => null);

        if (res.ok) {
          setRespostasIniciais(data?.respostas || null);
        } else {
          setErro(data?.error || "Não foi possível carregar sua ficha atual.");
        }
      } catch {
        setErro("Falha ao conectar. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    })();
  }, [agendamento.servico_id, token]);

  if (carregando) {
    return <p className="agende-hint">Carregando sua ficha...</p>;
  }

  return (
    <div className="conta-painel">
      {erro && <p className="conta-erro">{erro}</p>}

      <AnamneseForm
        anamneseToken={token}
        servico_id={agendamento.servico_id}
        endpoint="/api/minha-conta/anamnese"
        respostasIniciais={respostasIniciais}
        titulo="Editar Ficha de Anamnese"
        subtitulo="Atualize suas respostas abaixo. Um novo termo de consentimento será registrado com a data e hora de hoje."
        onSuccess={onDone}
      />

      <button
        type="button"
        className="conta-cancelar"
        onClick={onCancel}
        style={{ marginTop: "10px" }}
      >
        Cancelar
      </button>
    </div>
  );
}
