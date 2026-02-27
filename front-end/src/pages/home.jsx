import { useEffect, useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenuIfLink(e) {
    if (e.target.tagName === "A") setMenuOpen(false);
  }

  useEffect(() => {
    function onScroll() {
      setMenuOpen(false);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onHashChange() {
      setMenuOpen(false);
    }

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <img src="img/Logo.jpg" alt="Logo Clínica JA" />
          </div>

          <button
            className="nav-toggle"
            type="button"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className="nav">
            <ul
              className={`nav-links ${menuOpen ? "open" : ""}`}
              onClick={closeMenuIfLink}
              id="navLinks"
            >
              <li>
                <a href="#inicio">Início</a>
              </li>
              <li>
                <a href="#procedimentos">Procedimentos</a>
              </li>
              <li>
                <a href="#cursos">Cursos</a>
              </li>
              <li>
                <a href="#clientes">Clientes</a>
              </li>
              <li>
                <a href="#localizacao">Localização &amp; Contato</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="inicio">
        <div className="container hero-content">
          <div className="hero-text">
            <p className="hero-tagline">✨ Clínica de Estética</p>
            <h1>Realce sua beleza com a Clínica JA</h1>
            <p>
              Especialistas em procedimentos de estética facial e corporal,
              garantindo resultados naturais, seguros e personalizados.
            </p>

            <a
              href="https://wa.me/5551995262780"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Agende seu atendimento
            </a>
          </div>

          <div className="hero-image">
            <div className="hero-image-placeholder">
              JA
              <small>Estética &amp; Beleza</small>
            </div>
          </div>
        </div>
      </section>

      {/* PROCEDIMENTOS */}
      <section className="section" id="procedimentos">
        <h2 className="section-title">Procedimentos Estéticos</h2>
        <p className="section-subtitle">
          Tratamentos completos para realçar sua beleza de forma natural.
        </p>

        <div className="container cards-grid">
          <article className="card">
            <div className="card-photo">
              <img src="img/Novo Lash.jpg" alt="Lash Lifting" />
            </div>
            <h3>👁️ Lash Lifting</h3>
            <p>Curvatura duradoura e natural por até 45 dias.</p>
          </article>

          <article className="card">
            <div className="card-photo">
              <img
                src="img/Captura de tela 2025-11-23 Pele.png"
                alt="Limpeza de Pele"
              />
            </div>
            <h3>💆‍♀️ Limpeza de Pele</h3>
            <p>
              Limpeza profunda e revitalizante, garantindo uma pele uniforme e
              hidratada.
            </p>
          </article>

          <article className="card">
            <div className="card-photo">
              <img src="img/Nano Fios.jpg" alt="Nano Fios" />
            </div>
            <h3>🪄 Nano Fios</h3>
            <p>
              Técnica avançada para correção de falhas nas sobrancelhas, durando
              de 6 meses a 1 ano e meio.
            </p>
          </article>

          <article className="card">
            <div className="card-photo">
              <img src="img/Brow Lamination.jpg" alt="Brow Lamination" />
            </div>
            <h3>🌿 Brow Lamination</h3>
            <p>Alinhamento dos fios para sobrancelhas modernas e definidas.</p>
          </article>

          <article className="card">
            <div className="card-photo">
              <img
                src="img/Captura de tela 2025-11-23 Design.png"
                alt="Design Personalizado de Sobrancelhas"
              />
            </div>
            <h3>✏️ Design Personalizado</h3>
            <p>
              Garante sobrancelhas harmônicas e alinhadas, podendo optar por
              coloração ou henna.
            </p>
          </article>

          <article className="card">
            <div className="card-photo">
              <img
                src="img/Captura de tela 2025-11-23 Clinica4.png"
                alt="Clínica JA"
              />
            </div>
            <h3>🏩 A Clínica</h3>
            <p>
              Ambiente elegante, aconchegante e projetado para seu bem-estar.
            </p>
          </article>
        </div>
      </section>

      {/* CLIENTES */}
      <section className="section" id="clientes">
        <h2 className="section-title">Clientes Satisfeitas</h2>
        <p className="section-subtitle">
          Veja o que as clientes dizem sobre a JA.
        </p>

        <div className="container testimonials">
          <button className="testimonial-btn" id="prevBtn" type="button">
            ❮
          </button>

          <div className="testimonials-wrapper">
            <div className="testimonial active">
              <h3>Mariana Silva</h3>
              <div className="rating-stars">★★★★★</div>
              <p>
                Retornaria pelo fato de que além da ótima prossifional sinto
                algo bom de ti, os resultados, a conversa e o ambiente são
                simplesmente perfeitos! Tudo que nos mulheres precisamos é disso
                nosso momento de princesas, pra relaxar e desopilar dos
                problemas do dia a dia.
              </p>
            </div>

            <div className="testimonial">
              <h3>Camila Andrade</h3>
              <div className="rating-stars">★★★★★</div>
              <p>
                Amo o atendimento, o cuidado e a conversa, tudo maravilhoso!
              </p>
            </div>

            <div className="testimonial">
              <h3>Aline Duarte</h3>
              <div className="rating-stars">★★★★★</div>
              <p>
                Com certeza retornaria, um lugar onde me sinto bem tratada, além
                de ser um ambiente agradável.
              </p>
            </div>
          </div>

          <button className="testimonial-btn" id="nextBtn" type="button">
            ❯
          </button>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section className="section section-alt" id="localizacao">
        <h2 className="section-title">Onde Estamos</h2>
        <p className="section-subtitle">Venha conhecer nossa clínica.</p>

        <div className="container location-grid">
          <div className="location-details">
            <p>
              <strong>Endereço:</strong>
            </p>
            <p>R. Machado de Assis, 282 - Centro</p>
            <p>Osório - RS, 95520-000</p>

            <div className="map-placeholder">
              <iframe
                src="https://www.google.com/maps?q=R.+Machado+de+Assis,+282,+Osório,+RS&output=embed"
                loading="lazy"
                allowFullScreen
                title="Mapa Clínica JA"
              />
            </div>
          </div>

          <div className="contact-box">
            <h3>Agende Aqui</h3>
            <p>Entre em contato pelo WhatsApp e garanta seu horário.</p>

            <a
              href="https://wa.me/5551995262780"
              className="btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Agendar pelo WhatsApp
            </a>

            <p className="contact-note">Atendimento com hora marcada.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-content">
          <p>&copy; 2025 Clínica JA. Todos os direitos reservados.</p>
          <p className="footer-small">Desenvolvido com carinho.</p>
        </div>
      </footer>
    </>
  );
}
