import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AnamneseForm({ telefone, tipo, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [respostas, setRespostas] = useState({
    alergia: "",
    gestante: "",
    usaMedicacao: "",
    problemaOcular: "",
    procedimentoRecente: "",
    observacoes: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setRespostas((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/anamneses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telefone,
          tipo,
          respostas,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error || "Erro ao enviar a anamnese.");
        return;
      }

      setMsg("Ficha enviada com sucesso.");
      onSuccess();
    } catch (error) {
      console.log("ERRO ANAMNESE:", error);
      setMsg("Não foi possível enviar a anamnese.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="anamnese-form">
      <h2 className="anamnese-title">Ficha de Anamnese</h2>
      <p className="anamnese-subtitle">
        Preencha as informações abaixo para finalizar seu agendamento.
      </p>

      <div className="anamnese-group">
        <label className="anamnese-label">Possui alguma alergia?</label>
        <input
          type="text"
          name="alergia"
          value={respostas.alergia}
          onChange={handleChange}
          placeholder="Ex: cola, cosméticos, pomadas..."
          className="anamnese-input"
          required
        />
      </div>

      <div className="anamnese-group">
        <label className="anamnese-label">Está gestante?</label>
        <select
          name="gestante"
          value={respostas.gestante}
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
        <label className="anamnese-label">
          Faz uso de medicação contínua?
        </label>
        <input
          type="text"
          name="usaMedicacao"
          value={respostas.usaMedicacao}
          onChange={handleChange}
          placeholder="Ex: antibióticos, isotretinoína, etc."
          className="anamnese-input"
          required
        />
      </div>

      <div className="anamnese-group">
        <label className="anamnese-label">
          Tem sensibilidade ou problema ocular/na pele?
        </label>
        <input
          type="text"
          name="problemaOcular"
          value={respostas.problemaOcular}
          onChange={handleChange}
          placeholder="Ex: irritação, conjuntivite, dermatite..."
          className="anamnese-input"
          required
        />
      </div>

      <div className="anamnese-group">
        <label className="anamnese-label">
          Fez algum procedimento recentemente na região?
        </label>
        <input
          type="text"
          name="procedimentoRecente"
          value={respostas.procedimentoRecente}
          onChange={handleChange}
          placeholder="Ex: cílios, peeling, sobrancelha, limpeza..."
          className="anamnese-input"
          required
        />
      </div>

      <div className="anamnese-group">
        <label className="anamnese-label">Observações adicionais</label>
        <textarea
          name="observacoes"
          value={respostas.observacoes}
          onChange={handleChange}
          placeholder="Escreva aqui qualquer informação importante..."
          className="anamnese-textarea"
          rows="4"
        />
      </div>

      <button type="submit" className="btn-outline" disabled={loading}>
        {loading ? "Enviando..." : "Enviar ficha"}
      </button>

      {msg && <p className="agende-msg">{msg}</p>}
    </form>
  );
}