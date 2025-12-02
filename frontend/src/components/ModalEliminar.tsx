"use client";

import { ModalEliminarProps } from "@/interfaces/ModalEliminarProps";
import { FaTriangleExclamation } from "react-icons/fa6";



export default function ModalEliminar({
  isOpen,
  title = "Confirmar Eliminación",
  message,
  warning = "Esta acción no se puede deshacer.",
  onCancel,
  onConfirm,
  baseClassName = "grupos-page",
}: ModalEliminarProps) {
  if (!isOpen) return null;

  const overlayClass = `${baseClassName}__modal-overlay`;
  const contentClass = `${baseClassName}__modal-content`;
  const iconClass = `${baseClassName}__modal-icon`;
  const titleClass = `${baseClassName}__modal-title`;
  const textClass = `${baseClassName}__modal-text`;
  const actionsClass = `${baseClassName}__modal-actions`;
  const btnClass = `${baseClassName}__btn`;
  const btnCancelClass = `${baseClassName}__btn ${baseClassName}__btn--cancel`;
  const btnDangerClass = `${baseClassName}__btn ${baseClassName}__btn--danger`;

  return (
    <div className={overlayClass}>
      <div className={contentClass}>
        <div className={iconClass}>
          <FaTriangleExclamation />
        </div>
        <h3 className={titleClass}>{title}</h3>

        <p className={textClass}>
          {message}
          <span>{warning}</span>
        </p>

        <div className={actionsClass}>
          <button onClick={onCancel} className={btnCancelClass}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={btnDangerClass}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
