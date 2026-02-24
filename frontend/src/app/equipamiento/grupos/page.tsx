"use client";
import { useAuth } from "@/context/AuthContext";
import { DataTable } from "@/components/DataTable";
import EquipamientoModal from "../EquipamientoModal";
import ModalMensaje from "@/components/ModalMensaje";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import { FaCirclePlus } from "react-icons/fa6";
import { useState, useEffect, useCallback } from "react";
import { ResumenEquipamiento } from "@/interfaces/module/Equipamiento/ResumenEquipamiento";
import { getResumenEquipamiento } from "@/services/equipamiento.api";
import { columnasResumen } from "./columnasResumen";

export default function AdminEquipamientoPage() {
  const { usuario } = useAuth();
  const [resumen, setResumen] = useState<ResumenEquipamiento[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [mensaje, setMensaje] = useState<MensajeModal | null>(null);



  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenAdd = () => {
    setOpenModal(true);
  };

  const cargar = useCallback(async (search: string = "") => {
    try {
      const data = await getResumenEquipamiento(search);
      setResumen(data);
    } catch (err) {
      console.error("Error al recargar resumen de equipamiento:", err);
    }
  }, []);

    useEffect(() => {
    if (!usuario || usuario.rol !== "admin") return;

    const delayDebounceFn = setTimeout(() => {
      cargar(globalFilter);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [usuario, globalFilter, cargar]);

  if (!usuario || usuario.rol !== "admin") return null;

  return (
    <div className="equipamiento">
      <div className="equipamiento__titulo">
        <h1 className="equipamiento__titulo">Administración de Equipamiento</h1>
      </div>
      <div className="equipamiento__toolbar">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar Equipamiento..."
          className="equipamiento__input"
        />
        <button className="equipamiento__add-btn" onClick={handleOpenAdd}>
          <FaCirclePlus /> Agregar Equipamiento
        </button>
      </div>

      <DataTable
        data={resumen}
        columns={columnasResumen}
        pageSize={5}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        //manualFiltering={true}
      />
      <EquipamientoModal
        open={openModal}
        onClose={handleCloseModal}
        onSuccess={() => cargar(globalFilter)}
      />
      {mensaje && (
        <ModalMensaje
          tipo={mensaje.tipo}
          mensaje={mensaje.mensaje}
          duracion={2000}
          onClose={() => setMensaje(null)}
        />
      )}
    </div>
  );
}
