import { useEffect, useState } from "react";
import AgendeAquiForm from "../components/AgendeAquiForm.jsx";
import Testimonials from "../components/Testimonials.jsx";

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
          <article className="card">
            <div className="card-photo">
              <img src="img/Lash.png" alt="Lash Lifting" />
            </div>
            <h3>👁️ Lash Lifting</h3>
            <p>Curvatura duradoura e natural por até 45 dias.</p>
          </article>

          <article className="card">
            <div className="card-photo">
              <img src="img/Pele.png" alt="Limpeza de Pele" />
            </div>
            <h3>💆‍♀️ Limpeza de Pele</h3>
            <p>
              Limpeza profunda e revitalizante, garantindo uma pele uniforme e
              hidratada.
            </p>
          </article>

          <article className="card">
            <div className="card-photo">
              <img src="img/Nano.png" alt="Nano Fios" />
            </div>
            <h3>🪄 Nano Fios</h3>
            <p>
              Técnica avançada para correção de falhas nas sobrancelhas, durando
              de 6 meses a 1 ano e meio.
            </p>
          </article>

          <article className="card">
            <div className="card-photo">
              <img src="img/brow.png" alt="Brow Lamination" />
            </div>
            <h3>🌿 Brow Lamination</h3>
            <p>Alinhamento dos fios para sobrancelhas modernas e definidas.</p>
          </article>

          <article className="card">
            <div className="card-photo">
              <img
                src="img/Design.png"
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
              <img src="img/Clinica4.png" alt="Clínica JA" />
            </div>
            <h3>🏩 A Clínica</h3>
            <p>
              Ambiente elegante, aconchegante e projetado para seu bem-estar.
            </p>
          </article>
        </div>
      </section>

      <section className="section section-alt" id="cursos">
        <h2 className="section-title">Cursos para Profissionais</h2>
        <p className="section-subtitle">
          Aprenda técnicas essenciais com quem domina a beleza.
        </p>

        <div className="container cards-grid">
          <article className="card">
            <h3>Design Personalizado</h3>
            <p>
              Domine o design de sobrancelhas com técnica, precisão e
              naturalidade.
            </p>

            <p className="card-detail">
              • Como alisar as sobrancelhas <br />
              • Princípios do visagismo <br />
              • Princípios de biossegurança <br />
              • Como montar a bancada de forma organizada <br />
              • Como fazer marcação à mão livre <br />
              • Como fazer depilação com pinça e cera <br />
              • Como preparar coloração e henna e como aplicar <br />
              <br />
              • Curso com 2 dias (1º teórico, 2º prático), 2 módulos, Coffee
              break incluso <br />
              • Apostila online <br />
              • Certificado <br />
              • Kit básico <br />• Suporte pós-curso
            </p>

            <p className="card-price">R$ 449,90</p>

            <a
              href="https://wa.me/5551995262780"
              className="btn-outline"
              target="_blank"
              rel="noreferrer"
            >
              Saiba mais
            </a>
          </article>

          <article className="card">
            <h3>Expert em Lash Lifting</h3>
            <p>
              Curso completo sobre a técnica mais natural para realçar olhares.
            </p>

            <p className="card-detail">
              • Estrutura da haste
              <br />
              • Química dos produtos
              <br />
              • Segurança no manuseio
              <br />
              • 3 modelos reais
              <br />• Apostila online
            </p>

            <p className="card-price">R$ 579,90</p>

            <a
              href="https://wa.me/5551995262780"
              className="btn-outline"
              target="_blank"
              rel="noreferrer"
            >
              Saiba mais
            </a>
          </article>

          <article className="card">
            <h3>Expert em Brow Lamination</h3>
            <p>Domine a técnica mais versátil do design de sobrancelhas.</p>

            <p className="card-detail">
              • Estrutura da haste
              <br />
              • Química dos produtos
              <br />
              • Segurança
              <br />
              • 3 modelos
              <br />• Apostila online
            </p>

            <p className="card-price">R$ 579,90</p>

            <a
              href="https://wa.me/5551995262780"
              className="btn-outline"
              target="_blank"
              rel="noreferrer"
            >
              Saiba mais
            </a>
          </article>

          <article className="card">
            <h3>Expert em Naturalidade</h3>
            <p>Lash Lifting + Brow Lamination em um só curso.</p>

            <p className="card-detail">
              • Estrutura da haste
              <br />
              • Análise facial
              <br />
              • 4 modelos reais
              <br />• Apostila online
            </p>

            <p className="card-price">R$ 989,90</p>

            <a
              href="https://wa.me/5551995262780"
              className="btn-outline"
              target="_blank"
              rel="noreferrer"
            >
              Saiba mais
            </a>
          </article>
        </div>
      </section>

      <section className="section" id="clientes">
        <h2 className="section-title">Clientes Satisfeitas</h2>
        <p className="section-subtitle">
          Veja o que as clientes dizem sobre a JA.
        </p>

        <Testimonials />
      </section>

      <section className="section section-alt" id="localizacao">
        <h2 className="section-title">Onde Estamos</h2>
        <p className="section-subtitle">Venha conhecer nossa clínica.</p>

        <div className="container location-grid">
          <div className="location-details">
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

          <div className="contact-box">
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
