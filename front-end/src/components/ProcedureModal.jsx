import { useEffect } from "react";

export default function ProcedureModal({ procedure, onClose }) {
  useEffect(() => {
    if (!procedure) return;

    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [procedure, onClose]);

  if (!procedure) return null;

  return (
    <div
      className="procedure-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="procedure-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="procedure-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="procedure-modal-close"
          aria-label="Fechar"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="procedure-modal-photo">
          <img src={procedure.image} alt={procedure.alt} />
        </div>

        <div className="procedure-modal-content">
          <h3 id="procedure-modal-title">{procedure.title}</h3>
          <p>{procedure.description}</p>
        </div>
      </div>
    </div>
  );
}
