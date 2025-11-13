"use client";
import {
  ColumnDef,
  flexRender,
  getPaginationRowModel,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TableHTMLAttributes } from "react";

interface TablaProps<T> extends TableHTMLAttributes<HTMLTableElement> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  pageSize?: number;
}

export function DataTable<T>({ data, columns, pageSize = 10 }: TablaProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });
  return (
    <div className="tabla__wrapper">


      <table className="tabla">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
            <div className="tabla-sgmi__paginacion">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          ← Anterior
        </button>

        <span>
          Página{" "}
          <strong>
            {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </strong>
        </span>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
