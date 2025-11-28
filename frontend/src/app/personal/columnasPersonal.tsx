import { ColumnDef } from "@tanstack/react-table";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";
import AccionesColumna from "@/components/AccionesColumna";

export const obtenerColumnasPersonal = (
  onDelete: (id: number) => void
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
    accessorFn: (row) => row.rol,
    cell: ({ row }) => row.original.rol,
  },
  {header: "Acciones",
    id: "acciones",
    cell: ({row})=>{
        return (
        <AccionesColumna
          id={row.original.id}
          path="personal"
          onDelete={() => onDelete(row.original.id)} 
        />
      );
    },
     enableSorting: false,
  }
];
