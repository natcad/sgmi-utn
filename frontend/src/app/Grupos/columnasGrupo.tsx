import { ColumnDef } from "@tanstack/react-table";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";
import AccionesColumna from "@/components/AccionesColumna";

export const obtenerColumnas = (
  onView: (id: number) => void,
  onDelete: (id: number) => void
): ColumnDef<Grupo>[] => [
    {
      header: "Sigla",
      accessorKey: "siglas",
      id: "siglas",
      enableSorting: true,
    },
    {
      header: "Nombre",
      accessorKey: "nombre",
      id: "nombre",
      enableSorting: true,
    },
    {
      header: "Facultad Regional",
      accessorKey: "faculRegional.nombre",
      id: "facultadRegional",
      enableSorting: true,
    },
    {
      header: "Correo Electrónico",
      accessorKey: "correo",
      id: "correo",
      enableSorting: false,
    },
    {
      header: "Acciones",
      id: "acciones",
      cell: ({ row }) => {
        return (
          <AccionesColumna
            id={row.original.id}
            path="grupos"
            onView={() => onView(row.original.id)} 
            onDelete={() => onDelete(row.original.id)}
          />
        );
      },
      enableSorting: false,
    },
  ];