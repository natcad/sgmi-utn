"use client";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";
import { DataTable } from "@/components/DataTable";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { columnasPersonal } from "./columnasPersonal";
import { Table } from "@tanstack/react-table";
import { FaCirclePlus } from "react-icons/fa6";
import ModalMensaje from "@/components/ModalMensaje";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import axios from "axios";
import Link from "next/link";

export default function Personal() {
  const [datos, setDatos] = useState<PersonalResponse[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<Table<PersonalResponse> | null>(null);
  const [modal, setModal] = useState<MensajeModal | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get<PersonalResponse[]>("/personal");
        setDatos(res.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) return;
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
        onKeyDown={(e) => {
          if (e.key === "Enter" && table) {
            const filasFiltradas = table.getRowModel().rows;
            if (globalFilter.trim() !== "" && filasFiltradas.length === 0) {
              setModal({
                tipo: "warning",
                mensaje: "Personal No Encontrado <br/> Ingrese Nuevamente",
              });
            }
          }
        }}
      />

        <Link className="personal__add-btn" href="/agregar-personal">
          <FaCirclePlus /> Agregar Personal
        </Link>
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
              Página <strong>{table.getState().pagination.pageIndex + 1}</strong> de{" "}
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

      {modal && (
        <ModalMensaje
          tipo={modal.tipo}
          mensaje={modal.mensaje}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
