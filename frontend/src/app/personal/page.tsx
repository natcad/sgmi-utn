"use client";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";
import { DataTable } from "@/components/DataTable";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { columnasPersonal } from "./columnasPersonal";
import { Table } from "@tanstack/react-table";
import { FaCirclePlus, FaMagnifyingGlass } from "react-icons/fa6";
import axios from "axios";
export default function Pesonal() {
  const [datos, setDatos] = useState<PersonalResponse[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<Table<PersonalResponse> | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get<PersonalResponse[]>("/personal");
        setDatos(res.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) return;
        }
        console.error("Error al cargar personal:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="personal">
      <h1 className="personal__titulo">Administración de Personal</h1>
      <div className="personal__toolbar">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar..."
          className="personal__input"
        />
        <button className="personal__add-btn">
          <FaCirclePlus /> Agregar Personal
        </button>
      </div>
      <div className="personal__table-wrapper">
        <DataTable<PersonalResponse>
          data={datos}
          columns={columnasPersonal}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          onTableInit={setTable}
          pageSize={6}
        />
        {table && (
          <div className="personal__pagination">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="personal__page-btn"
            >
              ◀ Anterior
            </button>

            <span className="personal__page-info">
              Página{" "}
              <strong>{table.getState().pagination.pageIndex + 1}</strong> de{" "}
              <strong>{table.getPageCount()}</strong>
            </span>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="personal__page-btn"
            >
              Siguiente ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
