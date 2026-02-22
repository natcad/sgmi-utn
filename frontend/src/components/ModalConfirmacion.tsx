"use client";
import { FaCircleQuestion } from "react-icons/fa6"; 

interface ModalConfirmacionProps {
  mensaje: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ModalConfirmacion({
  mensaje,
  onConfirm,
  onCancel,
}: ModalConfirmacionProps) {
  

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="modal-mensaje" onClick={handleOverlayClick}>
      <div className="modal-mensaje__content">
        <div className="modal-mensaje__icon modal-mensaje--warning">
            <FaCircleQuestion />
        </div>
        
        <p 
          className="modal-mensaje__texto" 
          dangerouslySetInnerHTML={{ __html: mensaje }} 
          style={{marginBottom: '2rem'}}
        />

        <div className="modal-mensaje__botones">
          <button 
            onClick={onCancel} 
            className="modal-mensaje__btn modal-mensaje__btn--cancelar"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className="modal-mensaje__btn modal-mensaje__btn--confirmar"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}