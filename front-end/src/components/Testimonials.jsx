import { useEffect, useState } from "react";

const items = [
  {
    name: "Mariana Silva",
    text: "Retornaria pelo fato de que além da ótima profissional sinto algo bom de ti, os resultados, a conversa e o ambiente são simplesmente perfeitos! Tudo que nós mulheres precisamos é disso: nosso momento de princesas, pra relaxar e desopilar dos problemas do dia a dia.",
  },
  {
    name: "Camila Andrade",
    text: "Amo o atendimento, o cuidado e a conversa, tudo maravilhoso!",
  },
  {
    name: "Aline Duarte",
    text: "Com certeza retornaria, um lugar onde me sinto bem tratada, além de ser um ambiente agradável.",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? items.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c + 1) % items.length);

  // autoplay (opcional)
  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % items.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const t = items[current];

  return (
    <div className="testimonials">
      <button
        className="testimonial-btn"
        type="button"
        onClick={prev}
        aria-label="Anterior"
      >
        ❮
      </button>

      <div className="testimonials-wrapper">
        <div className="testimonial active">
          <h3>{t.name}</h3>
          <div className="rating-stars">★★★★★</div>
          <p>{t.text}</p>
        </div>

        <div className="testimonial-dots">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`dot ${i === current ? "active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Ir para depoimento ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <button
        className="testimonial-btn"
        type="button"
        onClick={next}
        aria-label="Próximo"
      >
        ❯
      </button>
    </div>
  );
}
