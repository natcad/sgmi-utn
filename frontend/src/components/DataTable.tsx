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
} from "@tanstack/react-table";
import { TableHTMLAttributes, useState, useEffect } from "react";
import { FaUpLong, FaDownLong } from "react-icons/fa6";

interface TablaProps<T> extends TableHTMLAttributes<HTMLTableElement> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  pageSize?: number;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  onTableInit?: (table: ReturnType<typeof useReactTable<T>>) => void;
  sortBy?: SortingState;
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
  globalFilter,
  onGlobalFilterChange,
  onTableInit,
  sortBy = [{ id: "nombre", desc: false }],
}: TablaProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(sortBy);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
      sorting: sortBy,
    },
  });
  useEffect(() => {
    onTableInit?.(table);
  }, [table, onTableInit]);

  return (
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
                  )} {" "}
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
  );
}
