import { ColumnDef } from "@tanstack/react-table";
import { ResumenEquipamiento } from "@/interfaces/module/Equipamiento/ResumenEquipamiento";
import AccionesColumna from "@/components/AccionesColumna";

export const columnasResumen: ColumnDef<ResumenEquipamiento>[] = [
 
  {
    header: "Nombre",
    accessorFn: (row) => row.grupo?.nombre ?? "-",
    id: "nombre",
  },
   {
    header: "Sigla",
    accessorFn: (row) => row.grupo?.siglas ?? "-",
    id: "sigla",
  },
  {
    header: "Cantidad de Equipamiento",
    accessorFn: (row) => row.totalEquipamientos,
    id: "totalEquipamiento",
  },
  {
    header: "Monto Total Invertido",
    accessorFn: (row) =>
      `$ ${row.montoTotalInvertido.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    id: "montoTotalInvertido",
  },
  {
      header: "Acciones",
      id: "acciones",
      cell: ({ row }) => {
      const grupoId = row.original.grupo?.id;
  
        return (
          <AccionesColumna
          id={grupoId}
          path="equipamiento"
          showView={true}
          showEdit={false}
          showDelete={false}
        />
      );
    },
    enableSorting: false,
  },

];
