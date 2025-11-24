import { ColumnDef } from "@tanstack/react-table";
import { Grupo } from "@/interfaces/module/Grupos/Grupos"; // Importamos el tipo asumido
import AccionesColumna from "@/components/AccionesColumna"; // Importación correcta

export const columnasGrupos: ColumnDef<Grupo>[] = [
  {
    header: "Sigla",
    accessorKey: "sigla", // Usamos accessorKey para campos de primer nivel
    id: "sigla",
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
    accessorKey: "facultadRegional",
    id: "facultadRegional",
    enableSorting: true,
  },
  {
    header: "Correo Electrónico",
    accessorKey: "correoElectronico",
    id: "correoElectronico",
    enableSorting: false, // No se necesita ordenar por correo
  },
  {
    header: "Acciones",
    id: "acciones",
    // Esta función renderiza el componente de acciones para cada fila
    cell: ({ row }) => {
      return <AccionesColumna id={row.original.id} path="grupos" />;
    },
    enableSorting: false,
  },
];