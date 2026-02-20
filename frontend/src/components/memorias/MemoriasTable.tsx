"use client";

import { useMemo } from "react";
import { ColumnDef, Table, Row } from "@tanstack/react-table";

import { DataTable } from "@/components/DataTable";
import AccionesColumna from "@/components/AccionesColumna";
import { MemoriaResumen } from "@/interfaces/module/Memorias/MemoriaResumen";

interface MemoriasTableProps {
  data: MemoriaResumen[];
  esAdmin: boolean | undefined;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onTableInit?: (tableInstance: Table<MemoriaResumen>) => void;
  onDelete: (id: number) => void;
}

export default function MemoriasTable({
  data,
  esAdmin,
  globalFilter,
  onGlobalFilterChange,
  onTableInit,
  onDelete,
}: MemoriasTableProps) {
  // Función para obtener clases CSS basadas en el estado
  const getRowClassName = (row: Row<MemoriaResumen>): string => {
    if (row.original.estado === "Pendiente de revisión") {
      return "bg-yellow-100";
    }
    return "";
  };

  const columns: ColumnDef<MemoriaResumen>[] = useMemo(() => {
    const baseCols: ColumnDef<MemoriaResumen>[] = [
      {
        accessorKey: "anio",
        header: "Año",
        cell: (info) => info.getValue<number>(),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: (info) => {
          const estado = info.getValue<string>();
          const isPendiente = estado === "Pendiente de revisión";
          
          return (
            <span
              className={`memorias__estado-badge ${
                isPendiente
                  ? "memorias__estado-badge--pendiente"
                  : estado === "Aprobada"
                    ? "memorias__estado-badge--aprobada"
                    : estado === "Rechazada"
                      ? "memorias__estado-badge--rechazada"
                      : "memorias__estado-badge--borrador"
              }`}
            >
              {estado}
            </span>
          );
        },
      },
      {
        accessorKey: "version",
        header: "Versión",
        cell: (info) => info.getValue<number>(),
      },
      {
        accessorKey: "titulo",
        header: "Título",
        cell: (info) => info.getValue<string | null>() || "Sin título",
      },
      {
        accessorKey: "createdAt",
        header: "Creada el",
        cell: (info) => {
          const value = info.getValue<string | null>();
          if (!value) return "-";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return value;
          return date.toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
    ];

    if (esAdmin) {
      baseCols.splice(1, 0, {
        accessorKey: "grupo",
        header: "Grupo",
        cell: ({ row }) =>
          row.original.grupo?.nombre ?? `Grupo #${row.original.grupoId}`,
      });
    }

    baseCols.push({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <AccionesColumna
          id={row.original.id}
          path="memorias"
          showEdit={false}
          onDelete={() => onDelete(row.original.id)}
        />
      ),
    });

    return baseCols;
  }, [esAdmin, onDelete]);

  return (
    <DataTable<MemoriaResumen>
      data={data}
      columns={columns}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      pageSize={6}
      sortBy={[
        { id: "anio", desc: true },
        { id: "version", desc: true },
      ]}
      onTableInit={onTableInit}
      rowClassName={getRowClassName}
    />
  );
}
