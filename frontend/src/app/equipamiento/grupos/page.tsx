"use client";
import { useAuth } from "@/context/AuthContext";
import { DataTable } from "@/components/DataTable";
import EquipamientoModal from "../EquipamientoModal";
import ModalMensaje from "@/components/ModalMensaje";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import { FaCirclePlus } from "react-icons/fa6";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";
import { getGrupos } from "@/services/grupos.api";
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
  const cargar = useCallback(async () => {
    try {
      const data = await getResumenEquipamiento();
      setResumen(data);
    } catch (err) {
      console.error("Error al recargar resumen de equipamiento:", err);
    }
  }, []);
    useEffect(() => {
    if (!usuario || usuario.rol !== "admin") return;
   cargar();
  }, [usuario,cargar]);

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
          placeholder="Buscar..."
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
        globalFilter=""
        onGlobalFilterChange={() => {}}
      />
      <EquipamientoModal
        open={openModal}
        onClose={handleCloseModal}
        onSuccess={cargar}
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
