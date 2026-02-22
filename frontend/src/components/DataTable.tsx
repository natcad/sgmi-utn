"use client";
import {
  ColumnDef,
  flexRender,
  getPaginationRowModel,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
  Table,
} from "@tanstack/react-table";
import { TableHTMLAttributes, useState, useEffect } from "react";
import { FaUpLong, FaDownLong, FaInbox } from "react-icons/fa6";
import { Row } from "@tanstack/react-table";

interface TablaProps<T> extends TableHTMLAttributes<HTMLTableElement> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  sortBy?: SortingState;
  onTableInit?: (tableInstance: Table<T>) => void;
  rowClassName?: (row: Row<T>) => string;
}

//este componente usa libreria tanstack
//¿cómo usar este componente?:
//en el archivo donde lo vamos a usar ademas de importarlo se debe importar import { ColumnDef } from "@tanstack/react-table";
//supongamos que quiero crear tabla persona: con columna nombre apellido correo
//creo la constante columna: const columnas: ColumDef<Persona>[]=[{accessorKey: "nombre", header:"Nombre"},{accessorKey: "apellido", header:"Apellido"}, {accessorKey: "email", header:"Correo", enableSorting: false},];
//por default todas las columnas se pueden ordenar tanto asc como desc si quiero que alguna no se ordene como correo debo explicitarlo.
//por default muestra 10 datos y ordena por columna "nombre" de forma asc pero esto es personalizable con pageSize y sortBy
//usar el componente: <DataTable data={datos} columns={columnas} pageSize={20} globalFilter={globalFilter}    onGlobalFilterChange={setGlobalFilter} onTableInit={setTable} defaultSorting={[{ id: "apellido", desc: false }]}/>
//ya esta listo para que puedas buscar con un input y para hacer la paginación.

export function DataTable<T>({
  data,
  columns,
  pageSize = 10,
  loading = false,
  emptyMessage,
  globalFilter,
  onGlobalFilterChange,
  sortBy = [{ id: "nombre", desc: false }],
  onTableInit,
  rowClassName,
}: TablaProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(sortBy);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Esto hace la magia
    manualPagination: false,
  });

  useEffect(() => {
    if (globalFilter) {
      table.setPageIndex(0);
    }
  }, [globalFilter, table]);

  useEffect(() => {
    if (onTableInit) onTableInit(table);
  }, [table, onTableInit]);

  return (
    <div className="flex flex-col gap-4 tabla__wrapper">
      {/* Loading state */}
      {loading && (
        <div className="tabla__empty">
          <div className="placeholder placeholder--loading">
            <div className="placeholder__spinner" />
            <div className="placeholder__text">Cargando datos...</div>
          </div>
        </div>
      )}

      {/* Empty state when not loading */}
      {!loading && data.length === 0 && (
        <div className="tabla__empty">
          <div className="placeholder placeholder--empty">
            <FaInbox className="placeholder__icon" aria-hidden />
            <div className="placeholder__title">{emptyMessage ?? "No se encontraron datos"}</div>
            <div className="placeholder__text">Intente cambiar filtros o revise la fuente de datos.</div>
          </div>
        </div>
      )}

      {/* TABLA */}
      {(!loading && data.length > 0) && (
        <>
          <table className="tabla">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                return (
                  <th
                    key={header.id}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    style={{ cursor: canSort ? "pointer" : "default" }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}{" "}
                    {canSort &&
                      ({
                        asc: <FaUpLong />,
                        desc: <FaDownLong />,
                      }[header.column.getIsSorted() as string] ??
                        null)}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={rowClassName?.(row) || ""}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

          {!loading && data.length > 0 && table.getPageCount() > 1 && (
            <div
          className="equipamiento__pagination"
          style={{
            marginTop: "10px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="equipamiento__page-btn"
          >
            Anterior
          </button>

          <span className="equipamiento__page-info">
            Página <strong>{table.getState().pagination.pageIndex + 1}</strong>{" "}
            de <strong>{table.getPageCount()}</strong>
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="equipamiento__page-btn"
          >
            Siguiente ▶
          </button>
        </div>
          )}
        </>
      )}
    </div>
  );
}
