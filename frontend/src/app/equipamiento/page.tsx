"use client";
import { DataTable } from "@/components/DataTable";
import { useState, useEffect, useCallback } from "react";
import { getEquipamiento } from "@/services/equipamiento.api";
import { columnasEquipamiento } from "./columnasEquipamiento";
import { Table } from "@tanstack/react-table";
import { Equipamiento } from "@/interfaces/module/Equipamiento/Equipamiento";
import { FaCirclePlus } from "react-icons/fa6";
import axios from "axios";
import EquipamientoModal from "./EquipamientoModal";
import { useAuth } from "@/context/AuthContext";

export default function EquipamientoPage() {
  const [datos, setDatos] = useState<Equipamiento[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<Table<Equipamiento> | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const { usuario } = useAuth();

  const cargar = useCallback(
  async () => {
    try {
      if (!usuario) return;
      let data;

      if (usuario.rol === "admin") {
        data = await getEquipamiento();
      } else {
        data = await getEquipamiento(usuario.grupoId ?? undefined);
      }
      setDatos(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) return;
      }
      console.error("Error al cargar equipamiento:", error);
    }
  },[usuario]);
  useEffect(() => {
    if (!usuario) return;
    cargar();
  }, [usuario, globalFilter, cargar]);
  return (
    <div className="equipamiento">
      <h1 className="equipamiento__titulo">Administración de Equipamiento</h1>
      <div className="equipamiento__toolbar">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar..."
          className="equipamiento__input"
        />
        <button
          className="equipamiento__add-btn"
          onClick={() => setOpenModal(true)}
        >
          <FaCirclePlus /> Agregar Equipamiento
        </button>
      </div>
      <DataTable<Equipamiento>
        data={datos}
        columns={columnasEquipamiento}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onTableInit={setTable}
        pageSize={10}
        sortBy={[{ id: "fechaIncorporacion", desc: true }]}

      />
      {table && (
        <div className="equipamiento__pagination">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
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

      <EquipamientoModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={cargar}
      />
    </div>
  );
}
