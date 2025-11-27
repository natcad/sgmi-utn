import { ColumnDef } from "@tanstack/react-table";
import { Equipamiento } from "@/interfaces/module/Equipamiento/Equipamiento";
import AccionesColumna from "@/components/AccionesColumna";
import { formatDate } from "@/utils/formatDate";
import { truncate } from "@/utils/truncate";
export const columnasEquipamiento = (
  onEdit: (item: Equipamiento) => void,
  onDelete: (id: number) => void
): ColumnDef<Equipamiento>[] => [
  {
    header: "Denominación",
    accessorFn: (row) => row.denominacion,
    id: "denominacion",
  },
  {
    header: "Descripción",
    id: "descripcion",
    cell: ({ row }) => (
      <div className="descripcion-celda">
        {truncate(row.original.descripcion, 130)}
        <div className="tooltip">{row.original.descripcion}</div>
      </div>
    ),
  },
  {
    header: "Monto Invertido",
    id: "montoInvertido",
    cell: ({ row }) => {
      return `$ ${row.original.montoInvertido.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
  },
  {
    header: "Fecha de Incorporación",
    accessorFn: (row) => formatDate(row.fechaIncorporacion),
    id: "fechaIncorporacion",
  },
  { header: "Cantidad", accessorFn: (row) => row.cantidad, id: "cantidad" },
  {
    header: "Acciones",
    id: "acciones",
    cell: ({ row }) => {
      const item = row.original;

      return (
        <AccionesColumna
          id={row.original.id}
          path="equipamiento"
          showView={false}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.id)}
        />
      );
    },
    enableSorting: false,
  },
];
