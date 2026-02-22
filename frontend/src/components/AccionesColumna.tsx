"use client";
import { FaEye, FaPenToSquare, FaTrash} from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { AccionesColumnasProps } from "@/interfaces/AccionesColumnaProps";
import "../styles/components/_accionesColumnas.scss"
export default function AccionesColumna({
    id,
    path,
    onEdit,
    onDelete,
    showView = true,
    showEdit = true,
    showDelete = true,
}: AccionesColumnasProps){
    const router = useRouter();
    return(
        <div className="actions">
          {showView && (<button title="Ver" onClick={()=>router.push(`/${path}/${id}`)} className="actions__btn actions-btn--see">
                <FaEye/>
            </button>
            )}
            {showEdit && (  
            <button title="Editar" onClick={onEdit} className="actions__btn actions-btn--edit">
                <FaPenToSquare/>
            </button>
            )}
            {showDelete && (
            <button title="Eliminar" onClick={onDelete} className="actions__btn actions-btn--delete">
                <FaTrash/>
            </button>
            )}
        </div>
    )
}