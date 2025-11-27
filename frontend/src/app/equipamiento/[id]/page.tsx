"use client";
import { DataTable } from "@/components/DataTable";
import { useState, useEffect, useCallback } from "react";
import { getEquipamiento } from "@/services/equipamiento.api";
import { getGrupoById } from "@/services/grupos.api";
import { columnasEquipamiento } from "../columnasEquipamiento";
import { Table } from "@tanstack/react-table";
import { Equipamiento } from "@/interfaces/module/Equipamiento/Equipamiento";
import { FaCirclePlus } from "react-icons/fa6";
import axios from "axios";
import EquipamientoModal from "../EquipamientoModal";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";

export default function EquipamientoPage() {
  const { usuario } = useAuth();
  const params = useParams();
  const router = useRouter();
  const grupoIdFromUrl = Number(params.id);

  const [datos, setDatos] = useState<Equipamiento[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<Table<Equipamiento> | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [grupo, setGrupo] = useState<Grupo | null>(null);

  const cargar = useCallback(async () => {
    try {
      const data = await getEquipamiento(grupoIdFromUrl);
      setDatos(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) return;
      }
      console.error("Error al cargar equipamiento:", error);
    }
  }, [grupoIdFromUrl]);

  useEffect(() => {
    cargar();
    getGrupoById(grupoIdFromUrl).then(setGrupo).catch(console.error);
  }, [cargar, grupoIdFromUrl]);

  if (usuario?.rol !== "admin" && usuario?.grupoId !== grupoIdFromUrl) {
    router.replace(`/equipamiento/${usuario?.grupoId}`);
    return null;
  }
  if (usuario?.rol === "admin" && !grupoIdFromUrl) {
    router.replace("/equipamiento/grupos");
    return null;
  }

  return (
    <div className="equipamiento">
      <div className="equipamiento__header">
        <div className="equipamiento__titulo">
          <h1 className="equipamiento__titulo">
            Administración de Equipamiento
          </h1>
          <h1 className="equipamiento__titulo">Grupo: {grupo?.nombre}</h1>
        </div>
        <div className="equipamiento__cards">
          <div className="equipamiento__card">
            <h3>Presupuesto</h3>
            <p>${grupo?.presupuesto?.toLocaleString() || "0.00"}</p>
          </div>
          <div className="equipamiento__card">
            <h3>Total Invertido</h3>
            <p>
              $
              {datos
                .reduce(
                  (acc, item) =>
                    acc +
                    Number(item.montoInvertido || 0) *
                      Number(item.cantidad || 1),
                  0
                )
                .toLocaleString()}
            </p>
          </div>
        </div>
      </div>
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
      {table && table.getPageCount() > 1 && (
        <div className="equipamiento__pagination">
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

      <EquipamientoModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={cargar}
      />
    </div>
  );
}
