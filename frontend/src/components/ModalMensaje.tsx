"use client";
import { useEffect,useState,JSX } from "react";
import { FaCircleCheck,
    FaCircleExclamation,
    FaCircleXmark
 } from "react-icons/fa6";
interface ModalMensajeProps{
    tipo: "exito" | "error" |"warning";
    mensaje: string;
    duracion?: number;
    onClose?: () => void;
}
//Modal reutilizable para mensajes de exito/ error/ warning
 
export default function ModalMensaje({
    tipo,
    mensaje,
    duracion = 3000,
    onClose,
}:ModalMensajeProps){
    const [visible,setVisible]= useState<boolean>(true);
    //maneja cierre automatico por tiempo
    useEffect(()=>{ const timer = setTimeout(()=>{
        setVisible(false);
        setTimeout(()=> onClose && onClose(),300);
    },duracion);
    return () => clearTimeout(timer);},[duracion,onClose]);
   
    //cierra el modal al tocar el overlay
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>)=>{
        if (e.target === e.currentTarget){
            setVisible(false);
            setTimeout(()=> onClose&&onClose(),300);
        }
    };
   
    if (!visible)return null;
    
    const iconos: Record<typeof tipo, JSX.Element>={
        exito: <FaCircleCheck/>,
        error: <FaCircleExclamation/>,
        warning: <FaCircleXmark/>,
    }
    
    return(
        <div className={`modal-mensaje modal-mensaje--${tipo}`}
            onClick={handleOverlayClick}>
            <div className="modal-mensaje__content">
                <div className="modal-mensaje__icon">{iconos[tipo]}</div>
                <p className="modal-mensaje__texto"dangerouslySetInnerHTML={{ __html: mensaje }}/>
            </div>
        </div>
    )
   
}