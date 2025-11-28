"use client";
import { FaEye, FaPenToSquare, FaTrash} from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { AccionesColumnasProps } from "@/interfaces/AccionesColumnaProps";
import "../styles/components/_accionesColumnas.scss"
export default function AccionesColumna({
    id,
    path,
    onEdit,
    onView,
    onDelete,
}: AccionesColumnasProps){
    const router = useRouter();
    return(
        <div className="actions">
            <button 
                title="Ver Detalle" 
                onClick={() => onView?.(id)} // Aseguramos que se pase el ID
                className="actions-btn actions-btn--view" // Clase específica para el botón de "Ver"
            >
                <FaEye/>
            </button>
            
            <button title="Editar" onClick={onEdit} className="actions-btn">
                <FaPenToSquare/>
            </button>
            
            <button 
                title="Eliminar Grupo" 
                onClick={() => onDelete?.(id)} // Aseguramos que se pase el ID
                className="actions-btn actions-btn--delete" // Clase específica para el botón de "Eliminar"
            >
                <FaTrash/>
            </button>
        </div>
    )
}