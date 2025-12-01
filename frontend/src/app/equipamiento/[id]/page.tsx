"use client";
import { DataTable } from "@/components/DataTable";
import { useState, useEffect, useCallback } from "react";
import {
  deleteEquipamiento,
  getEquipamiento,
} from "@/services/equipamiento.api";
import { getGrupoById } from "@/services/grupos.api";
import { columnasEquipamiento } from "../columnasEquipamiento";
import { Equipamiento } from "@/interfaces/module/Equipamiento/Equipamiento";
import { FaCirclePlus } from "react-icons/fa6";
import axios from "axios";
import EquipamientoModal from "../EquipamientoModal";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";
import ModalMensaje from "@/components/ModalMensaje";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import { useMemo } from "react";
import ModalEliminar from "@/components/ModalEliminar";

export default function EquipamientoPage() {
  const { usuario } = useAuth();
  const params = useParams();
  const router = useRouter();
  const grupoIdFromUrl = Number(params.id);
  const [datos, setDatos] = useState<Equipamiento[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [itemEditando, setItemEditando] = useState<Equipamiento | null>(null);
  const [mensaje, setMensaje] = useState<MensajeModal | null>(null);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);

  const handleEditar = (item: Equipamiento) => {
    setItemEditando(item);
    setOpenModal(true);
  };

  const handleEliminar = (id: number) => {
    setIdAEliminar(id);
    setModalEliminarOpen(true);
  };

  const confirmarEliminar = async () => {
    if (!idAEliminar) return;

    try {
      await deleteEquipamiento(idAEliminar);
      setMensaje({
        tipo: "exito",
        mensaje: "Equipamiento eliminado correctamente.",
      });
      await cargar();
    } catch (error) {
      console.error("Error al eliminar equipamiento:", error);
      setMensaje({
        tipo: "error",
        mensaje: "No se pudo eliminar el equipamiento.",
      });
    } finally {
      setModalEliminarOpen(false);
      setIdAEliminar(null);
    }
  };

  const cancelarEliminar = () => {
    setModalEliminarOpen(false);
    setIdAEliminar(null);
  };

  const columnas = columnasEquipamiento(handleEditar, handleEliminar);

  const cargar = useCallback(async () => {
    if (!grupoIdFromUrl) return;
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

  const datosOrdenados = useMemo(() => {
    return [...datos].sort((a, b) => {
      const fechaA = new Date(a.fechaIncorporacion).getTime();
      const fechaB = new Date(b.fechaIncorporacion).getTime();
      return fechaB - fechaA; // descendente
    });
  }, [datos]);

  useEffect(() => {
    if (!usuario) return;
    if (usuario?.rol !== "admin" && usuario?.grupoId !== grupoIdFromUrl) {
      router.replace(`/equipamiento/${usuario?.grupoId}`);
    }
    if (usuario?.rol === "admin" && !grupoIdFromUrl) {
      router.replace("/equipamiento/grupos");
    }
  }, [usuario, grupoIdFromUrl, router]);
  const handleCloseModal = () => {
    setOpenModal(false);
    setItemEditando(null);
  };

  const handleOpenAdd = () => {
    setItemEditando(null);
    setOpenModal(true);
  };

  return (
    <div className="equipamiento">
      <ModalEliminar
        isOpen={modalEliminarOpen}
        message="¿Seguro que querés eliminar este equipamiento?"
        onCancel={cancelarEliminar}
        onConfirm={confirmarEliminar}
        baseClassName="equipamiento"
      />

      <div className="equipamiento__header">
        <div className="equipamiento__titulo">
          <h1 className="equipamiento__titulo">
            Administración de Equipamiento
          </h1>
          <h1 className="equipamiento__titulo">Grupo: {grupo?.nombre}</h1>
        </div>
        <div className="equipamiento__cards">
          <div className="equipamiento__card">
            <h3>
              Equipamientos <br /> Registrados
            </h3>
            <p>{datos.length}</p>
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
          <div className="equipamiento__card">
            <h3>Presupuesto</h3>
            <p>${grupo?.presupuesto?.toLocaleString() || "0.00"}</p>
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
        <button className="equipamiento__add-btn" onClick={handleOpenAdd}>
          <FaCirclePlus /> Agregar Equipamiento
        </button>
      </div>
      <DataTable<Equipamiento>
        data={datosOrdenados}
        columns={columnas}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        pageSize={5}
        sortBy={[{ id: "fechaIncorporacion", desc: true }]}
      />

      <EquipamientoModal
        open={openModal}
        onClose={handleCloseModal}
        onSuccess={cargar}
        equipamientoEditando={itemEditando}
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
