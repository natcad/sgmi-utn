"use client";
import React from "react";

interface ModalRechazoComentarioProps {
  onConfirm: (comentario: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ModalRechazoComentario({
  onConfirm,
  onCancel,
  loading = false,
}: ModalRechazoComentarioProps) {
  const [comentario, setComentario] = React.useState("");

  const handleConfirm = () => {
    if (!comentario.trim()) {
      // Opcional: mostrar validación
      return;
    }
    onConfirm(comentario);
  };

  return (
    <div
      className="memoria-detalle__modal-overlay"
      onClick={() => !loading && onCancel()}
      role="presentation"
    >
      <div
        className="memoria-detalle__modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="memoria-detalle__modal-title">
          Motivo del rechazo
        </h3>
        <p className="memoria-detalle__modal-subtitle">
          Por favor, indica el motivo del rechazo para que el grupo pueda hacer las correcciones necesarias.
        </p>
        <textarea
          className="memoria-detalle__modal-textarea"
          rows={4}
          placeholder="Explica los motivos del rechazo..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          disabled={loading}
        />
        <div className="memoria-detalle__modal-actions">
          <button
            type="button"
            className="memoria-detalle__modal-btn memoria-detalle__modal-btn--secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="memoria-detalle__modal-btn"
            onClick={handleConfirm}
            disabled={loading || !comentario.trim()}
          >
            {loading ? "Rechazando..." : "Rechazar"}
          </button>
        </div>
      </div>
    </div>
  );
}
