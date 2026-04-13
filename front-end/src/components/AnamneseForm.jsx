import { useState } from "react";

export default function AnamneseForm({ telefone, tipo, onSuccess }) {
  const [respostas, setRespostas] = useState({
    alergia: "",
    gravidez: "",
    observacoes: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    await fetch(`${import.meta.env.VITE_API_URL}/anamneses`, {
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

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Ficha de Anamnese</h2>

      <input
        placeholder="Tem alergia?"
        onChange={(e) =>
          setRespostas({ ...respostas, alergia: e.target.value })
        }
      />

      <input
        placeholder="Está grávida?"
        onChange={(e) =>
          setRespostas({ ...respostas, gravidez: e.target.value })
        }
      />

      <textarea
        placeholder="Observações"
        onChange={(e) =>
          setRespostas({ ...respostas, observacoes: e.target.value })
        }
      />

      <button type="submit">Enviar</button>
    </form>
  );
}
