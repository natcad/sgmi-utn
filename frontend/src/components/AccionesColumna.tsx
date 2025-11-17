"use client";
import { FaEye, FaPenToSquare, FaTrash} from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { AccionesColumnasProps } from "@/interfaces/AccionesColumnaProps";

export default function AccionesColumna({
    id,
    path,
    onEdit,
    onDelete,
}: AccionesColumnasProps){
    const router = useRouter();
    return(
        <div className="actions">
            <button title="Ver" onClick={()=>router.push(`/${path}/${id}`)} className="actions-btn">
                <FaEye/>
            </button>
            
            <button title="Editar" onClick={onEdit} className="actions-btn">
                <FaPenToSquare/>
            </button>
            
            <button title="Eliminar" onClick={onDelete} className="actions-btn">
                <FaTrash/>
            </button>
        </div>
    )
}