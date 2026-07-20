import { useEffect, useState } from "react";
import AgendeAquiForm from "../components/AgendeAquiForm.jsx";
import { CardStack } from "../components/ui/card-stack.tsx";
import { testimonials } from "../data/testimonials.js";

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
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <img src="img/Logo.jpeg" alt="Logo Clínica JA" />
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

      <section className="hero" id="inicio">
        <div className="container hero-content">
          <div className="hero-text">
            <p className="hero-tagline">✨ Clínica de Estética</p>
            <h1>Realce sua beleza com a Clínica JA</h1>
            <p>
              Especialistas em procedimentos de estética facial e corporal,
              garantindo resultados naturais, seguros e personalizados.
            </p>
            <a href="#localizacao" className="btn-gold">
              Agende seu horário!
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

      <section className="section" id="procedimentos">
        <h2 className="section-title">Procedimentos Estéticos</h2>
        <p className="section-subtitle">
          Tratamentos completos para realçar sua beleza de forma natural.
        </p>

        <div className="container cards-grid">
          <article className="card card-procedure">
            <div className="card-photo">
              <img src="img/Lash.png" alt="Lash Lifting" />
              <div className="card-photo-overlay">
                <h3>👁️ Lash Lifting</h3>
                <p>Curvatura duradoura e natural por até 45 dias.</p>
              </div>
            </div>
          </article>

          <article className="card card-procedure">
            <div className="card-photo">
              <img src="img/Pele.png" alt="Limpeza de Pele" />
              <div className="card-photo-overlay">
                <h3>💆‍♀️ Limpeza de Pele</h3>
                <p>
                  Limpeza profunda e revitalizante, garantindo uma pele
                  uniforme e hidratada.
                </p>
              </div>
            </div>
          </article>

          <article className="card card-procedure">
            <div className="card-photo">
              <img src="img/Nano.png" alt="Nano Fios" />
              <div className="card-photo-overlay">
                <h3>🪄 Nano Fios</h3>
                <p>
                  Técnica avançada para correção de falhas nas sobrancelhas,
                  durando de 6 meses a 1 ano e meio.
                </p>
              </div>
            </div>
          </article>

          <article className="card card-procedure">
            <div className="card-photo">
              <img src="img/brow.png" alt="Brow Lamination" />
              <div className="card-photo-overlay">
                <h3>🌿 Brow Lamination</h3>
                <p>
                  Alinhamento dos fios para sobrancelhas modernas e definidas.
                </p>
              </div>
            </div>
          </article>

          <article className="card card-procedure">
            <div className="card-photo">
              <img
                src="img/Design.png"
                alt="Design Personalizado de Sobrancelhas"
              />
              <div className="card-photo-overlay">
                <h3>✏️ Design Personalizado</h3>
                <p>
                  Garante sobrancelhas harmônicas e alinhadas, podendo optar
                  por coloração ou henna.
                </p>
              </div>
            </div>
          </article>

          <article className="card card-procedure">
            <div className="card-photo">
              <img src="img/Clinica4.png" alt="Clínica JA" />
              <div className="card-photo-overlay">
                <h3>🏩 A Clínica</h3>
                <p>
                  Ambiente elegante, aconchegante e projetado para seu
                  bem-estar.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section" id="cursos">
        <h2 className="section-title">Cursos para Profissionais</h2>
        <p className="section-subtitle">
          Aprenda técnicas essenciais com quem domina a beleza.
        </p>

        <div className="container">
          <div className="course-spotlight">
            <div className="course-spotlight-photo">
              <img
                src="img/brow.png"
                alt="Curso de Design Personalizado de Sobrancelhas"
              />
            </div>

            <div className="course-spotlight-content">
              <span className="course-badge">Design Personalizado</span>
              <h3>Torne-se uma especialista</h3>
              <p className="course-spotlight-subtitle">
                Aprenda com quem vive a estética.
              </p>

              <ul className="checklist">
                <li>Turmas presenciais</li>
                <li>Certificado</li>
                <li>Apostila</li>
                <li>Material incluso</li>
                <li>Suporte pós-curso</li>
              </ul>

              <div className="course-spotlight-price">
                <span>A partir de</span>
                <strong>R$449</strong>
              </div>

              <a
                href="https://wa.me/5551995262780"
                className="btn-primary"
                target="_blank"
                rel="noreferrer"
              >
                Quero me inscrever
              </a>
            </div>
          </div>

          <div className="cards-grid">
            <article className="course-card">
              <div className="course-card-photo">
                <img src="img/Lash.png" alt="Expert em Lash Lifting" />
              </div>
              <div className="course-card-content">
                <h4>Expert em Lash Lifting</h4>
                <p>A técnica mais natural para realçar olhares.</p>
                <span className="course-card-price">R$ 579,90</span>
                <a
                  href="https://wa.me/5551995262780"
                  className="btn-outline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Saiba mais
                </a>
              </div>
            </article>

            <article className="course-card">
              <div className="course-card-photo">
                <img src="img/Design.png" alt="Expert em Brow Lamination" />
              </div>
              <div className="course-card-content">
                <h4>Expert em Brow Lamination</h4>
                <p>A técnica mais versátil do design de sobrancelhas.</p>
                <span className="course-card-price">R$ 579,90</span>
                <a
                  href="https://wa.me/5551995262780"
                  className="btn-outline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Saiba mais
                </a>
              </div>
            </article>

            <article className="course-card">
              <div className="course-card-photo">
                <img src="img/Nano.png" alt="Expert em Naturalidade" />
              </div>
              <div className="course-card-content">
                <h4>Expert em Naturalidade</h4>
                <p>Lash Lifting + Brow Lamination em um só curso.</p>
                <span className="course-card-price">R$ 989,90</span>
                <a
                  href="https://wa.me/5551995262780"
                  className="btn-outline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Saiba mais
                </a>
              </div>
            </article>
          </div>

          <div className="credibility-strip credibility-strip--compact">
            <div className="credibility-item">
              <strong>300+</strong>
              <p>Mais de 300 alunas formadas</p>
            </div>

            <div className="credibility-item">
              <strong>98%</strong>
              <p>das alunas recomendam os cursos.</p>
            </div>

            <div className="credibility-item">
              <strong>Aprendizado prático</strong>
              <ul className="checklist checklist-compact">
                <li>Modelos reais</li>
                <li>Certificado</li>
                <li>Apostila</li>
                <li>Suporte</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-testimonials" id="clientes">
        <h2 className="section-title">Clientes Satisfeitas</h2>
        <p className="section-subtitle">
          Veja o que as clientes dizem sobre a JA.
        </p>

        <div className="container">
          <CardStack
            items={testimonials}
            autoAdvance
            intervalMs={3500}
            pauseOnHover
            showDots
            renderCard={(item) => (
              <div className="relative h-full w-full">
                <div className="absolute inset-0">
                  <img
                    src={item.imageSrc}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    draggable={false}
                    loading="lazy"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
                  <div
                    className="mb-2 text-sm tracking-wide"
                    aria-label={`${item.rating} de 5 estrelas`}
                  >
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)}
                  </div>
                  <p className="text-sm italic sm:text-base">
                    "{item.description}"
                  </p>
                  <p className="mt-2 text-sm font-semibold not-italic">
                    {item.title}
                  </p>
                </div>
              </div>
            )}
          />
        </div>
      </section>

      <section className="section section-contact-cta" id="localizacao">
        <div className="container contact-cta-banner">
          <div className="contact-cta-text">
            <h2>Pronta para transformar sua autoestima?</h2>
            <p>
              Agende sua avaliação e descubra, com todo o cuidado da JA, o
              procedimento ideal para realçar sua beleza natural.
            </p>
            <a href="#agende-form" className="btn-primary">
              Agendar Avaliação
            </a>
          </div>

          <div className="contact-cta-photo">
            <img src="img/Clinica5.png" alt="Ambiente acolhedor da Clínica JA" />
          </div>
        </div>

        <div className="container location-grid">
          <div className="location-details">
            <h3 className="location-heading">Onde Estamos</h3>
            <p>
              <strong>Endereço:</strong>
            </p>
            <p>R. Maj. João Marques, 515 - Centro</p>
            <p>Osório - RS, 95520-000</p>

            <div className="map-placeholder">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3459.1250217084917!2d-50.271778024535365!3d-29.889498024108367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95186606f6082d8d%3A0x4f1921d0f9d1e531!2sR.%20Maj.%20Jo%C3%A3o%20Marques%2C%20515%20-%20Centro%2C%20Os%C3%B3rio%20-%20RS%2C%2095520-000!5e0!3m2!1spt-BR!2sbr!4v1772462196889!5m2!1spt-BR!2sbr"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa Clínica JA"
              />
            </div>
          </div>

          <div className="contact-box" id="agende-form">
            <h3>Agende Aqui</h3>
            <p>Preencha e envie seu agendamento. Vamos confirmar com você.</p>

            <AgendeAquiForm />

            <p className="contact-note">Atendimento com hora marcada.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-content">
          <p>&copy; 2025 Clínica JA. Todos os direitos reservados.</p>
          <p className="footer-small">Desenvolvido com carinho.</p>
        </div>
      </footer>
    </>
  );
}
