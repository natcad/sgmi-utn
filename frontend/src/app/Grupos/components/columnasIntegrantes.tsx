import { ColumnDef } from "@tanstack/react-table";
import AccionesColumna from "@/components/AccionesColumna";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";

export const columnasIntegrante = (
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
    header: "Rol",
    accessorFn: (row) => row.rol,
    id: "rol",
    enableSorting: false,
  },
  {
    header: "Horas Semanales",
    accessorFn: (row) => row.horasSemanales ?? "",
    id: "grupo",
  },
  {
    header: "Nivel de Formación",
    id: "nivelDeFormacion",
    accessorFn: (row) => row.nivelDeFormacion
  },
  {
    header: "Email",
    id: "emailInstitucional",
    accessorFn: (row) => row.emailInstitucional
  },
  
  {
    header: "Acciones",
    id: "acciones",
    cell: ({ row }) => {
      return (
        <AccionesColumna
          id={row.original.id}
          path="personal"
          onEdit={undefined}
          onDelete={undefined}
        />
      );
    },
    enableSorting: false,
  },
];
