"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/DataTable";
import EmptyState from "@/components/EmptyState";
import {
  MemoriaEquipamientoItem,
  MemoriaPersonalItem,
} from "@/interfaces/module/Memorias/MemoriaDetalle";

interface MemoriaDetalleTablesProps {
  personal?: MemoriaPersonalItem[];
  equipamiento?: MemoriaEquipamientoItem[];
}

export default function MemoriaDetalleTables({
  personal,
  equipamiento,
}: MemoriaDetalleTablesProps) {
  const columnasPersonal: ColumnDef<MemoriaPersonalItem>[] = useMemo(
    () => [
      {
        accessorKey: "personal",
        header: "Integrante",
        cell: ({ row }) => {
          const p = row.original.personal;
          const u = p?.Usuario;
          if (!p || !u) return `#${row.original.idPersonal}`;
          return `${u.apellido} ${u.nombre}`;
        },
      },
      {
        accessorKey: "rol",
        header: "Rol",
        cell: (info) => info.getValue<string | null>() ?? "-",
      },
      {
        accessorKey: "horasSemanales",
        header: "Horas/sem",
        cell: (info) => info.getValue<number | null>() ?? "-",
      },
      {
        accessorKey: "categoriaUTN",
        header: "Cat. UTN",
        cell: ({ row }) => {
          const topLevel = row.original.categoriaUTN;
          if (topLevel) return topLevel;
          const investigador = (row.original.personal as any)?.Investigador;
          return investigador?.categoriaUTN ?? "-";
        },
      },
      {
        accessorKey: "dedicacion",
        header: "Dedicación",
        cell: ({ row }) => {
          const topLevel = row.original.dedicacion;
          if (topLevel) return topLevel;
          const investigador = (row.original.personal as any)?.Investigador;
          return investigador?.dedicacion ?? "-";
        },
      },
      {
        accessorKey: "tipoFormacion",
        header: "Formación",
        cell: ({ row }) => {
          const topLevel = row.original.tipoFormacion;
          if (topLevel) return topLevel;
          const enFormacion = (row.original.personal as any)?.EnFormacion;
          return enFormacion?.tipoFormacion ?? "-";
        },
      },
    ],
    []
  );

  const columnasEquipamiento: ColumnDef<MemoriaEquipamientoItem>[] = useMemo(
    () => [
      {
        accessorKey: "denominacion",
        header: "Denominación",
        cell: (info) => info.getValue<string>(),
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: (info) => info.getValue<string | null>() ?? "-",
      },
      {
        accessorKey: "cantidad",
        header: "Cantidad",
        cell: (info) => info.getValue<number>(),
      },
      {
        accessorKey: "montoInvertido",
        header: "Monto invertido",
        cell: (info) => `$ ${info.getValue<string>()}`,
      },
      {
        accessorKey: "fechaIncorporacion",
        header: "Fecha incorporación",
        cell: (info) => info.getValue<string>(),
      },
    ],
    []
  );

  return (
    <>
      <div className="memoria-detalle__section">
        <h2 className="memoria-detalle__section-title">
          Personal en la memoria
        </h2>
        {personal && personal.length > 0 ? (
          <div className="memoria-detalle__table-wrapper">
            <DataTable<MemoriaPersonalItem>
              data={personal}
              columns={columnasPersonal}
              sortBy={[{ id: "personal", desc: false }]}
              pageSize={6}
            />
          </div>
        ) : (
          <EmptyState
            title="Sin personal"
            description="Esta memoria no tiene registros de personal."
          />
        )}
      </div>

      <div className="memoria-detalle__section">
        <h2 className="memoria-detalle__section-title">
          Equipamiento en la memoria
        </h2>
        {equipamiento && equipamiento.length > 0 ? (
          <div className="memoria-detalle__table-wrapper">
            <DataTable<MemoriaEquipamientoItem>
              data={equipamiento}
              columns={columnasEquipamiento}
              pageSize={6}
              sortBy={[{ id: "fechaIncorporacion", desc: true }]}
            />
          </div>
        ) : (
          <EmptyState
            title="Sin equipamiento"
            description="Esta memoria no tiene registros de equipamiento."
          />
        )}
      </div>
    </>
  );
}
