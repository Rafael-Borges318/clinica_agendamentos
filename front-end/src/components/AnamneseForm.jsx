import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const DOENCAS_GERAIS = [
  { id: "Diabetes", label: "Diabetes" },
  { id: "Hipertensão", label: "Hipertensão" },
  { id: "Epilepsia", label: "Epilepsia" },
  { id: "Doenças autoimunes", label: "Doenças autoimunes" },
  { id: "Distúrbios hormonais", label: "Distúrbios hormonais" },
  { id: "Problemas circulatórios", label: "Problemas circulatórios" },
  { id: "Trombose", label: "Trombose" },
  { id: "Nenhuma", label: "Nenhuma" },
];

const DOENCAS_PELE = [
  { id: "Psoríase", label: "Psoríase" },
  { id: "Dermatite", label: "Dermatite" },
  { id: "Rosácea", label: "Rosácea" },
  { id: "Acne severa", label: "Acne severa" },
  { id: "Nenhuma", label: "Nenhuma" },
];

// ── estilos inline (sem tocar no CSS externo) ──────────────────────────────
const S = {
  secao: {
    marginBottom: "1.75rem",
    padding: "1.25rem 1.5rem",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    background: "#fafafa",
  },
  titulo: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "1.25rem",
    paddingBottom: "0.5rem",
    borderBottom: "2px solid #e5e7eb",
    margin: "0 0 1.25rem 0",
  },
  checkboxes: {
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
    marginTop: "0.5rem",
  },
  checkItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
    cursor: "pointer",
    color: "#374151",
  },
  termoBloco: {
    background: "#fef9ec",
    border: "1px solid #f59e0b",
    borderRadius: "8px",
    padding: "1rem 1.25rem",
    marginBottom: "1rem",
    fontSize: "0.85rem",
    lineHeight: "1.65",
    color: "#374151",
  },
  consentLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
    fontSize: "0.9rem",
    fontWeight: "500",
    cursor: "pointer",
    color: "#374151",
    lineHeight: "1.5",
  },
};

// ── helpers ────────────────────────────────────────────────────────────────
function formatDataHora(date) {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Componente ─────────────────────────────────────────────────────────────
export default function AnamneseForm({ anamneseToken, tipo, servico_id, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Captura o momento em que o cliente lê o termo de consentimento
  const [dataHoraConsentimento] = useState(() => formatDataHora(new Date()));

  const [respostas, setRespostas] = useState({
    // Seção 1
    idade: "",
    profissao: "",
    como_nos_conheceu: "",
    // Seção 2
    doencas_diagnosticadas: [],
    outras_condicoes_saude: "",
    gestante_amamentando: "",
    usa_medicacao_continua: "",
    qual_medicacao_continua: "",
    reacao_alergica_produto: "",
    descricao_alergia: "",
    // Seção 3
    tipo_pele: "",
    doencas_pele: [],
    sensibilidade_problema_ocular: "",
    descricao_problema_ocular: "",
    exposicao_solar_frequente: "",
    usa_protetor_solar: "",
    // Seção 4
    realizou_procedimento_antes: "",
    onde_quando_procedimento_anterior: "",
    procedimento_ultimos_30_dias: "",
    qual_procedimento_recente: "",
    reacao_adversa_estetica: "",
    descricao_reacao_adversa: "",
    uso_cigarro_alcool: "",
    // Seção 5
    expectativa_procedimento: "",
    observacoes_adicionais: "",
    // Seção 6
    consentimento: false,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setRespostas((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleCheckMultiple(field, id) {
    setRespostas((prev) => {
      const arr = prev[field];
      if (id === "Nenhuma") {
        return {
          ...prev,
          [field]: arr.includes("Nenhuma") ? [] : ["Nenhuma"],
        };
      }
      const semNenhuma = arr.filter((v) => v !== "Nenhuma");
      return {
        ...prev,
        [field]: semNenhuma.includes(id)
          ? semNenhuma.filter((v) => v !== id)
          : [...semNenhuma, id],
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anamneseToken}`,
        },
        body: JSON.stringify({ servico_id, respostas }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error || "Erro ao enviar a anamnese.");
        return;
      }

      onSuccess();
    } catch {
      setMsg("Não foi possível enviar a anamnese.");
    } finally {
      setLoading(false);
    }
  }

  const termoCompleto =
    `Declaro que as informações fornecidas acima são verdadeiras e completas. ` +
    `Autorizo a realização do procedimento e estou ciente de que informações incorretas ` +
    `podem comprometer o resultado e minha segurança. Este registro foi realizado ` +
    `digitalmente em ${dataHoraConsentimento} e tem validade legal conforme o Marco ` +
    `Civil da Internet (Lei 12.965/2014).`;

  return (
    <form onSubmit={handleSubmit} className="anamnese-form">
      <h2 className="anamnese-title">Ficha de Anamnese</h2>
      <p className="anamnese-subtitle">
        Preencha as informações abaixo para finalizar seu agendamento. Suas
        respostas são confidenciais e essenciais para a segurança do
        procedimento.
      </p>

      {/* ══ 1. DADOS PESSOAIS ══ */}
      <div style={S.secao}>
        <h3 style={S.titulo}>1. Dados Pessoais</h3>

        <div className="anamnese-group">
          <label className="anamnese-label">Idade *</label>
          <input
            type="number"
            name="idade"
            value={respostas.idade}
            onChange={handleChange}
            min="1"
            max="120"
            placeholder="Ex: 28"
            className="anamnese-input"
            required
          />
        </div>

        <div className="anamnese-group">
          <label className="anamnese-label">Profissão / onde trabalha *</label>
          <input
            type="text"
            name="profissao"
            value={respostas.profissao}
            onChange={handleChange}
            placeholder="Ex: Professora, Enfermeira, Estudante..."
            className="anamnese-input"
            required
          />
        </div>

        <div className="anamnese-group">
          <label className="anamnese-label">Como nos conheceu?</label>
          <select
            name="como_nos_conheceu"
            value={respostas.como_nos_conheceu}
            onChange={handleChange}
            className="anamnese-input"
          >
            <option value="">Selecione</option>
            <option value="Instagram">Instagram</option>
            <option value="Indicação">Indicação</option>
            <option value="Google">Google</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
      </div>

      {/* ══ 2. SAÚDE GERAL ══ */}
      <div style={S.secao}>
        <h3 style={S.titulo}>2. Saúde Geral</h3>

        <div className="anamnese-group">
          <label className="anamnese-label">
            Possui alguma doença diagnosticada?
          </label>
          <div className="anamnese-check-group">
            {DOENCAS_GERAIS.map(({ id, label }) => (
              <div key={id} className="anamnese-check-item">
                <input
                  type="checkbox"
                  id={`doenca-${id}`}
                  checked={respostas.doencas_diagnosticadas.includes(id)}
                  onChange={() => handleCheckMultiple("doencas_diagnosticadas", id)}
                />
                <label htmlFor={`doenca-${id}`}>{label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="anamnese-group">
          <label className="anamnese-label">Outras condições de saúde</label>
          <input
            type="text"
            name="outras_condicoes_saude"
            value={respostas.outras_condicoes_saude}
            onChange={handleChange}
            placeholder="Descreva se necessário"
            className="anamnese-input"
          />
        </div>

        <div className="anamnese-group">
          <label className="anamnese-label">Está gestante ou amamentando?</label>
          <select
            name="gestante_amamentando"
            value={respostas.gestante_amamentando}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="Não">Não</option>
            <option value="Gestante">Gestante</option>
            <option value="Amamentando">Amamentando</option>
          </select>
        </div>

        <div className="anamnese-group">
          <label className="anamnese-label">Faz uso de medicação contínua?</label>
          <select
            name="usa_medicacao_continua"
            value={respostas.usa_medicacao_continua}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        {respostas.usa_medicacao_continua === "sim" && (
          <div className="anamnese-group">
            <label className="anamnese-label">Qual medicação?</label>
            <input
              type="text"
              name="qual_medicacao_continua"
              value={respostas.qual_medicacao_continua}
              onChange={handleChange}
              placeholder="Ex: antibióticos, isotretinoína, anticoagulantes..."
              className="anamnese-input"
            />
          </div>
        )}

        <div className="anamnese-group">
          <label className="anamnese-label">
            Já teve reação alérgica a algum produto?
          </label>
          <select
            name="reacao_alergica_produto"
            value={respostas.reacao_alergica_produto}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        {respostas.reacao_alergica_produto === "sim" && (
          <div className="anamnese-group">
            <label className="anamnese-label">Descreva a alergia</label>
            <input
              type="text"
              name="descricao_alergia"
              value={respostas.descricao_alergia}
              onChange={handleChange}
              placeholder="Ex: látex, cosméticos, fragrâncias..."
              className="anamnese-input"
            />
          </div>
        )}
      </div>

      {/* ══ 3. CONDIÇÕES DA PELE E REGIÃO ══ */}
      <div style={S.secao}>
        <h3 style={S.titulo}>3. Condições da Pele e Região</h3>

        <div className="anamnese-group">
          <label className="anamnese-label">
            Como você classificaria sua pele?
          </label>
          <select
            name="tipo_pele"
            value={respostas.tipo_pele}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="Normal">Normal</option>
            <option value="Oleosa">Oleosa</option>
            <option value="Seca">Seca</option>
            <option value="Mista">Mista</option>
            <option value="Sensível">Sensível</option>
          </select>
        </div>

        <div className="anamnese-group">
          <label className="anamnese-label">
            Possui alguma doença de pele diagnosticada?
          </label>
          <div className="anamnese-check-group">
            {DOENCAS_PELE.map(({ id, label }) => (
              <div key={id} className="anamnese-check-item">
                <input
                  type="checkbox"
                  id={`pele-${id}`}
                  checked={respostas.doencas_pele.includes(id)}
                  onChange={() => handleCheckMultiple("doencas_pele", id)}
                />
                <label htmlFor={`pele-${id}`}>{label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="anamnese-group">
          <label className="anamnese-label">
            Tem sensibilidade ou problema ocular?
          </label>
          <select
            name="sensibilidade_problema_ocular"
            value={respostas.sensibilidade_problema_ocular}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        {respostas.sensibilidade_problema_ocular === "sim" && (
          <div className="anamnese-group">
            <label className="anamnese-label">Descreva o problema</label>
            <input
              type="text"
              name="descricao_problema_ocular"
              value={respostas.descricao_problema_ocular}
              onChange={handleChange}
              placeholder="Ex: olho seco, conjuntivite recorrente, dermatite ocular..."
              className="anamnese-input"
            />
          </div>
        )}

        <div className="anamnese-group">
          <label className="anamnese-label">Realiza exposição solar frequente?</label>
          <select
            name="exposicao_solar_frequente"
            value={respostas.exposicao_solar_frequente}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>
        </div>

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
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
            <option value="Às vezes">Às vezes</option>
          </select>
        </div>
      </div>

      {/* ══ 4. HISTÓRICO ESTÉTICO ══ */}
      <div style={S.secao}>
        <h3 style={S.titulo}>4. Histórico Estético</h3>

        <div className="anamnese-group">
          <label className="anamnese-label">
            Já realizou este tipo de procedimento antes?
          </label>
          <select
            name="realizou_procedimento_antes"
            value={respostas.realizou_procedimento_antes}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        {respostas.realizou_procedimento_antes === "sim" && (
          <div className="anamnese-group">
            <label className="anamnese-label">Onde e quando?</label>
            <input
              type="text"
              name="onde_quando_procedimento_anterior"
              value={respostas.onde_quando_procedimento_anterior}
              onChange={handleChange}
              placeholder="Ex: Studio X, há 6 meses..."
              className="anamnese-input"
            />
          </div>
        )}

        <div className="anamnese-group">
          <label className="anamnese-label">
            Fez algum procedimento estético nos últimos 30 dias na região?
          </label>
          <select
            name="procedimento_ultimos_30_dias"
            value={respostas.procedimento_ultimos_30_dias}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        {respostas.procedimento_ultimos_30_dias === "sim" && (
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
            Já teve alguma reação adversa a procedimento estético?
          </label>
          <select
            name="reacao_adversa_estetica"
            value={respostas.reacao_adversa_estetica}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        {respostas.reacao_adversa_estetica === "sim" && (
          <div className="anamnese-group">
            <label className="anamnese-label">Descreva o que ocorreu</label>
            <input
              type="text"
              name="descricao_reacao_adversa"
              value={respostas.descricao_reacao_adversa}
              onChange={handleChange}
              placeholder="Ex: alergia à cola de cílios, irritação após peeling..."
              className="anamnese-input"
            />
          </div>
        )}

        <div className="anamnese-group">
          <label className="anamnese-label">
            Faz uso de cigarro ou bebida alcoólica frequente?
          </label>
          <select
            name="uso_cigarro_alcool"
            value={respostas.uso_cigarro_alcool}
            onChange={handleChange}
            className="anamnese-input"
            required
          >
            <option value="">Selecione</option>
            <option value="Não">Não</option>
            <option value="Cigarro">Cigarro</option>
            <option value="Álcool">Álcool</option>
            <option value="Ambos">Ambos</option>
          </select>
        </div>
      </div>

      {/* ══ 5. EXPECTATIVAS ══ */}
      <div style={S.secao}>
        <h3 style={S.titulo}>5. Expectativas</h3>

        <div className="anamnese-group">
          <label className="anamnese-label">
            O que você espera deste procedimento?
          </label>
          <textarea
            name="expectativa_procedimento"
            value={respostas.expectativa_procedimento}
            onChange={handleChange}
            placeholder="Conte o que espera alcançar com este procedimento..."
            className="anamnese-textarea"
            rows="3"
          />
        </div>

        <div className="anamnese-group">
          <label className="anamnese-label">Observações adicionais</label>
          <textarea
            name="observacoes_adicionais"
            value={respostas.observacoes_adicionais}
            onChange={handleChange}
            placeholder="Qualquer informação adicional que julgue importante..."
            className="anamnese-textarea"
            rows="3"
          />
        </div>
      </div>

      {/* ══ 6. TERMO DE CONSENTIMENTO ══ */}
      <div style={S.secao}>
        <h3 style={S.titulo}>6. Termo de Consentimento</h3>

        <div style={S.termoBloco}>{termoCompleto}</div>

        <div className="anamnese-check-item">
          <input
            type="checkbox"
            id="consentimento"
            name="consentimento"
            checked={respostas.consentimento}
            onChange={handleChange}
          />
          <label htmlFor="consentimento">
            Li e concordo com os termos acima.
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="btn-outline"
        disabled={loading || !respostas.consentimento}
      >
        {loading ? "Enviando..." : "Enviar ficha"}
      </button>

      {msg && <p className="agende-msg">{msg}</p>}
    </form>
  );
}
