import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const DOENCAS_GERAIS = [
  { id: "diabetes", label: "Diabetes" },
  { id: "hipertensao", label: "Hipertensão" },
  { id: "epilepsia", label: "Epilepsia" },
  { id: "doencas_autoimunes", label: "Doenças autoimunes" },
  { id: "disturbios_hormonais", label: "Distúrbios hormonais" },
  { id: "problemas_circulatorios", label: "Problemas circulatórios" },
  { id: "trombose", label: "Trombose" },
];

const DOENCAS_PELE = [
  { id: "psoriase", label: "Psoríase" },
  { id: "dermatite", label: "Dermatite" },
  { id: "rosacea", label: "Rosácea" },
  { id: "acne", label: "Acne" },
];

const secaoStyle = {
  marginBottom: "2rem",
  padding: "1.25rem 1.5rem",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  background: "#fafafa",
};

const secaoTituloStyle = {
  fontSize: "0.95rem",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "1.25rem",
  paddingBottom: "0.5rem",
  borderBottom: "2px solid #e5e7eb",
};

const checkboxesStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.45rem",
  marginTop: "0.5rem",
};

const checkboxItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.9rem",
  cursor: "pointer",
  color: "#374151",
};

const consentimentoStyle = {
  ...checkboxItemStyle,
  alignItems: "flex-start",
  fontWeight: "500",
  lineHeight: "1.5",
};

export default function AnamneseForm({ telefone, tipo, servico_id, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [respostas, setRespostas] = useState({
    // Saúde geral
    doencas_preexistentes: [],
    outras_condicoes: "",
    // Medicamentos e alergias
    usa_medicacao: "",
    qual_medicacao: "",
    tem_alergia: "",
    qual_alergia: "",
    // Condições específicas
    gravida_ou_amamentando: "",
    sensibilidade_pele: "",
    onde_sensibilidade: "",
    doencas_pele: [],
    doenca_pele_outro: "",
    // Hábitos
    usa_protetor_solar: "",
    fuma: "",
    consome_alcool: "",
    exposicao_solar_frequente: "",
    // Histórico estético
    procedimento_recente_regiao: "",
    qual_procedimento_recente: "",
    reacao_adversa_procedimento: "",
    qual_reacao_adversa: "",
    // Expectativas
    expectativas: "",
    // Consentimento
    consentimento: false,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setRespostas((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleDoencaGeralCheck(id) {
    setRespostas((prev) => {
      const arr = prev.doencas_preexistentes;
      return {
        ...prev,
        doencas_preexistentes: arr.includes(id)
          ? arr.filter((v) => v !== id)
          : [...arr, id],
      };
    });
  }

  function handleDoencaPeleCheck(id) {
    setRespostas((prev) => {
      const arr = prev.doencas_pele;
      return {
        ...prev,
        doencas_pele: arr.includes(id)
          ? arr.filter((v) => v !== id)
          : [...arr, id],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!respostas.consentimento) {
      setMsg("Você precisa aceitar o termo de consentimento para continuar.");
      return;
    }

    setMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/anamneses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefone, servico_id, respostas }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error || "Erro ao enviar a anamnese.");
        return;
      }

      setMsg("Ficha enviada com sucesso.");
      onSuccess();
    } catch {
      setMsg("Não foi possível enviar a anamnese.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="anamnese-form">
      <h2 className="anamnese-title">Ficha de Anamnese</h2>
      <p className="anamnese-subtitle">
        Preencha as informações abaixo para finalizar seu agendamento. Suas
        respostas são confidenciais e essenciais para a segurança do
        procedimento.
      </p>

      {/* ── 1. SAÚDE GERAL ── */}
      <div style={secaoStyle}>
        <h3 style={secaoTituloStyle}>1. Saúde Geral</h3>

        <div className="anamnese-group">
          <label className="anamnese-label">
            Possui alguma das condições abaixo?
          </label>
          <div style={checkboxesStyle}>
            {DOENCAS_GERAIS.map(({ id, label }) => (
              <label key={id} style={checkboxItemStyle}>
                <input
                  type="checkbox"
                  checked={respostas.doencas_preexistentes.includes(id)}
                  onChange={() => handleDoencaGeralCheck(id)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="anamnese-group">
          <label className="anamnese-label">Outras condições de saúde</label>
          <input
            type="text"
            name="outras_condicoes"
            value={respostas.outras_condicoes}
            onChange={handleChange}
            placeholder="Descreva outras condições, se houver"
            className="anamnese-input"
          />
        </div>
      </div>

      {/* ── 2. MEDICAMENTOS E ALERGIAS ── */}
      <div style={secaoStyle}>
        <h3 style={secaoTituloStyle}>2. Medicamentos e Alergias</h3>

        <div className="anamnese-group">
          <label className="anamnese-label">Usa alguma medicação contínua?</label>
          <select
            name="usa_medicacao"
            value={respostas.usa_medicacao}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        {respostas.usa_medicacao === "sim" && (
          <div className="anamnese-group">
            <label className="anamnese-label">Qual medicação?</label>
            <input
              type="text"
              name="qual_medicacao"
              value={respostas.qual_medicacao}
              onChange={handleChange}
              placeholder="Ex: antibióticos, isotretinoína, anticoagulantes..."
              className="anamnese-input"
            />
          </div>
        )}

        <div className="anamnese-group">
          <label className="anamnese-label">Tem alguma alergia?</label>
          <select
            name="tem_alergia"
            value={respostas.tem_alergia}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        {respostas.tem_alergia === "sim" && (
          <div className="anamnese-group">
            <label className="anamnese-label">A que tem alergia?</label>
            <input
              type="text"
              name="qual_alergia"
              value={respostas.qual_alergia}
              onChange={handleChange}
              placeholder="Ex: látex, cosméticos, fragrâncias, produtos químicos..."
              className="anamnese-input"
            />
          </div>
        )}
      </div>

      {/* ── 3. CONDIÇÕES ESPECÍFICAS ── */}
      <div style={secaoStyle}>
        <h3 style={secaoTituloStyle}>3. Condições Específicas</h3>

        <div className="anamnese-group">
          <label className="anamnese-label">Está grávida ou amamentando?</label>
          <select
            name="gravida_ou_amamentando"
            value={respostas.gravida_ou_amamentando}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        <div className="anamnese-group">
          <label className="anamnese-label">Tem sensibilidade na pele?</label>
          <select
            name="sensibilidade_pele"
            value={respostas.sensibilidade_pele}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        {respostas.sensibilidade_pele === "sim" && (
          <div className="anamnese-group">
            <label className="anamnese-label">Em qual região?</label>
            <input
              type="text"
              name="onde_sensibilidade"
              value={respostas.onde_sensibilidade}
              onChange={handleChange}
              placeholder="Ex: rosto, olhos, pescoço..."
              className="anamnese-input"
            />
          </div>
        )}

        <div className="anamnese-group">
          <label className="anamnese-label">
            Tem alguma doença de pele diagnosticada?
          </label>
          <div style={checkboxesStyle}>
            {DOENCAS_PELE.map(({ id, label }) => (
              <label key={id} style={checkboxItemStyle}>
                <input
                  type="checkbox"
                  checked={respostas.doencas_pele.includes(id)}
                  onChange={() => handleDoencaPeleCheck(id)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="anamnese-group">
          <label className="anamnese-label">Outra doença de pele</label>
          <input
            type="text"
            name="doenca_pele_outro"
            value={respostas.doenca_pele_outro}
            onChange={handleChange}
            placeholder="Se não listada acima, descreva aqui"
            className="anamnese-input"
          />
        </div>
      </div>

      {/* ── 4. HÁBITOS ── */}
      <div style={secaoStyle}>
        <h3 style={secaoTituloStyle}>4. Hábitos</h3>

        <div className="anamnese-group">
          <label className="anamnese-label">Usa protetor solar diariamente?</label>
          <select
            name="usa_protetor_solar"
            value={respostas.usa_protetor_solar}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        <div className="anamnese-group">
          <label className="anamnese-label">Fuma?</label>
          <select
            name="fuma"
            value={respostas.fuma}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        <div className="anamnese-group">
          <label className="anamnese-label">Consome álcool?</label>
          <select
            name="consome_alcool"
            value={respostas.consome_alcool}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="raramente">Raramente</option>
            <option value="socialmente">Socialmente</option>
            <option value="frequentemente">Frequentemente</option>
          </select>
        </div>

        <div className="anamnese-group">
          <label className="anamnese-label">Pratica exposição solar frequente?</label>
          <select
            name="exposicao_solar_frequente"
            value={respostas.exposicao_solar_frequente}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>
      </div>

      {/* ── 5. HISTÓRICO ESTÉTICO ── */}
      <div style={secaoStyle}>
        <h3 style={secaoTituloStyle}>5. Histórico Estético</h3>

        <div className="anamnese-group">
          <label className="anamnese-label">
            Fez algum procedimento estético nos últimos 30 dias na região?
          </label>
          <select
            name="procedimento_recente_regiao"
            value={respostas.procedimento_recente_regiao}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        {respostas.procedimento_recente_regiao === "sim" && (
          <div className="anamnese-group">
            <label className="anamnese-label">Qual procedimento?</label>
            <input
              type="text"
              name="qual_procedimento_recente"
              value={respostas.qual_procedimento_recente}
              onChange={handleChange}
              placeholder="Ex: cílios, peeling, sobrancelha, limpeza de pele..."
              className="anamnese-input"
            />
          </div>
        )}

        <div className="anamnese-group">
          <label className="anamnese-label">
            Já teve reação adversa a algum procedimento estético?
          </label>
          <select
            name="reacao_adversa_procedimento"
            value={respostas.reacao_adversa_procedimento}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        {respostas.reacao_adversa_procedimento === "sim" && (
          <div className="anamnese-group">
            <label className="anamnese-label">Qual reação?</label>
            <input
              type="text"
              name="qual_reacao_adversa"
              value={respostas.qual_reacao_adversa}
              onChange={handleChange}
              placeholder="Descreva a reação e o procedimento que a causou..."
              className="anamnese-input"
            />
          </div>
        )}
      </div>

      {/* ── 6. EXPECTATIVAS ── */}
      <div style={secaoStyle}>
        <h3 style={secaoTituloStyle}>6. Expectativas</h3>

        <div className="anamnese-group">
          <label className="anamnese-label">
            O que você espera deste procedimento?
          </label>
          <textarea
            name="expectativas"
            value={respostas.expectativas}
            onChange={handleChange}
            placeholder="Conte o que espera alcançar com este procedimento..."
            className="anamnese-textarea"
            rows="4"
          />
        </div>
      </div>

      {/* ── 7. TERMO DE CONSENTIMENTO ── */}
      <div style={secaoStyle}>
        <h3 style={secaoTituloStyle}>7. Termo de Consentimento</h3>

        <div className="anamnese-group">
          <label style={consentimentoStyle}>
            <input
              type="checkbox"
              name="consentimento"
              checked={respostas.consentimento}
              onChange={handleChange}
              style={{ marginTop: "3px", flexShrink: 0 }}
            />
            Declaro que as informações acima são verdadeiras e autorizo a
            realização do procedimento.
          </label>
        </div>
      </div>

      <button type="submit" className="btn-outline" disabled={loading}>
        {loading ? "Enviando..." : "Enviar ficha"}
      </button>

      {msg && <p className="agende-msg">{msg}</p>}
    </form>
  );
}
