import { ColumnDef } from "@tanstack/react-table";
import { Equipamiento } from "@/interfaces/module/Equipamiento/Equipamiento";
import AccionesColumna from "@/components/AccionesColumna";
export const columnasEquipamiento: ColumnDef<Equipamiento>[] = [
  {
    header: "Denominación",
    accessorFn: (row) => row.denominacion,
    id: "denominacion",
  },
  {
    header: "Descripción",
    accessorFn: (row) => row.descripcion,
    id: "descripcion",
  },
  {
    header: "Monto Invertido",
    accessorFn: (row) => row.montoInvertido,
    id: "montoInvertido",
  },
  {
    header: "Fecha de Incorporación",
    accessorFn: (row) => row.fechaIncorporacion,
    id: "fechaIncorporacion",
  },
  { header: "Cantidad", accessorFn: (row) => row.cantidad, id: "cantidad" },
  {
    header: "Acciones",
    id: "acciones",
    cell: ({ row }) => {
      return <AccionesColumna id={row.original.id} path="equipamiento" />;
    },
    enableSorting: false,
  },
];
