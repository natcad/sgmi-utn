import { ColumnDef } from "@tanstack/react-table";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";
import AccionesColumna from "@/components/AccionesColumna";

// 🚨 CORRECCIÓN: Ahora esto es una FUNCIÓN que recibe los handlers (onView, onEdit, onDelete)
export const obtenercolumnasPersonal = (
  onView: (id: string | number) => void,
  // Se pueden añadir onEdit y onDelete si los necesitas, aunque aquí los pasamos como undefined
): ColumnDef<PersonalResponse>[] => [
  {
    header: "Nombre",
    accessorFn: (row) => row.Usuario.nombre,
    id: "nombre",
  },
  {
    header: "Apellido",
    accessorFn: (row) => row.Usuario.apellido,
    id: "apellido",
  },
  {
    header: "Correo",
    accessorFn: (row) => row.Usuario.email,
    id: "email",
    enableSorting: false,
  },
  {
    header: "Grupo",
    accessorFn: (row) => row.grupo?.nombre ?? "",
    id: "grupo",
  },
  {
    header: "Tipo",
    id: "tipo",
    accessorFn: (row) => row.ObjectType,
    cell: ({ row }) => {
      const type = row.original.ObjectType;
      if (type === "investigador") return "Investigador";
      if (type === "en formacion") return "En Formación";
      return "Personal";
    },
  },
  {header: "Acciones",
    id: "acciones",
    cell: ({row})=>{
        return (
            <AccionesColumna 
                id={row.original.id} 
                path="personal" 
                // 🚨 Se pasa el handler de redirección de Ver Detalle
                onView={() => onView(row.original.id)}
                // Se pasan los otros como undefined para que no se muestren
                onEdit={undefined} 
                onDelete={undefined} 
            />
        );
    },
     enableSorting: false,

  }
];