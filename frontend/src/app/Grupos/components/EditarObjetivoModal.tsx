import React from "react";

interface EditarObjetivoModalProps {
  abierto: boolean;
  valor: string;
  onChange: (nuevoValor: string) => void;
  onCancelar: () => void;
  onGuardar: () => void;
  guardando: boolean;
}

const MAX_OBJETIVO = 255;

const EditarObjetivoModal: React.FC<EditarObjetivoModalProps> = ({
  abierto,
  valor,
  onChange,
  onCancelar,
  onGuardar,
  guardando,
}) => {
  if (!abierto) return null;

  const caracteresUsados = valor.length;
  const superaMaximo = caracteresUsados > MAX_OBJETIVO;

  return (
    <div className="grupo-detalle__modal-backdrop" onClick={onCancelar}>
      <div className="grupo-detalle__modal"   onClick={(e) => {
      e.stopPropagation(); }}>
        <h3 className="grupo-detalle__modal-title">
          Editar objetivo del grupo
        </h3>
        <p className="grupo-detalle__modal-subtitle">
          Actualizá el objetivo institucional de este grupo de investigación.
        </p>

        <textarea
          className="grupo-detalle__objetivo-textarea"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="Escribí el objetivo del grupo..."
          maxLength={MAX_OBJETIVO}            
        />

        <div className="grupo-detalle__help-row">
          <span className="grupo-detalle__help-text">
            Máximo {MAX_OBJETIVO} caracteres.
          </span>
          <span
            className={`grupo-detalle__char-counter${
              superaMaximo ? " grupo-detalle__char-counter--error" : ""
            }`}
          >
            {caracteresUsados}/{MAX_OBJETIVO}
          </span>
        </div>

        <div className="grupo-detalle__modal-actions">
          <button
            className="grupo-detalle__btn grupo-detalle__btn--secondary"
            onClick={onCancelar}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            className="grupo-detalle__btn grupo-detalle__btn--primary"
            onClick={onGuardar}
            disabled={guardando || !valor.trim()}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarObjetivoModal;
