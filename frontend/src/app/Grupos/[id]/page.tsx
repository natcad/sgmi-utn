"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaEye,
  FaFileLines,
  FaPen,
  FaFilter,
  FaCirclePlus,
  FaSitemap,
  FaEllipsisVertical,
} from "react-icons/fa6";
import axios from "axios";
import { DataTable } from "@/components/DataTable";
import { obtenercolumnasIntegrante } from "./columnasIntegrantes";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";
import "../../../styles/grupos/detallegrupo.scss";
import { MensajeModal } from "@/interfaces/MensajeModal";
import ModalMensaje from "@/components/ModalMensaje";
import { GrupoDetalle } from "@/interfaces/module/Grupos/GrupoDetalle";
import {
  actualizarGrupoApi,
  getGrupoDetalle,
  getOrganigramaUrl,
  eliminarGrupoApi
} from "@/services/grupos.api";
import { obtenerNombreCompleto } from "@/utils/helpers";
import EditarObjetivoModal from "./EditarObjetivoModal";
import ModalEliminar from "@/components/ModalEliminar";
export default function GrupoDetallePage() {
  const params = useParams();
  const idGrupo = params?.id as string | undefined;
  const router = useRouter();
  const [grupo, setGrupo] = useState<GrupoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<any>(null);
  const [modal, setModal] = useState<MensajeModal>();
  const [editandoObjetivo, setEditandoObjetivo] = useState(false);
  const [objetivoTemp, setObjetivoTemp] = useState("");
  const [guardandoObjetivo, setGuardandoObjetivo] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [eliminandoGrupo, setEliminandoGrupo] = useState(false);

  // Llamamos a la función importada y le pasamos el handler
  const columnasIntegrantes = React.useMemo(
    () =>
      //Se llama a la función 'obtenerColumnasPersonal'
      obtenercolumnasIntegrante(),
    []
  );

  //DESCARGAR ORGANIGRAMA
  const handleDescargarOrganigrama = async () => {
    if (!idGrupo) return;
    if (grupo?.organigramaUrl && grupo?.organigramaPublicId) {
      window.location.href = getOrganigramaUrl(idGrupo);
    }
  };
  const handleNotFinished = () => {
    setModal({
      tipo: "sorry",
      mensaje: "Ups todavia estamos trabajando en esto.",
    });
  };
  const handleVerEquipamiento = () => {
    router.push(`/equipamiento/${idGrupo}`);
  };
  const handleEditarObjetivo = () => {
    if (!grupo) return;
    setObjetivoTemp(grupo.objetivo || "");
    setEditandoObjetivo(true);
  };
  const handleEliminarGrupo = () => {
    setMostrarModalEliminar(true);
    setMenuAbierto(false);
  };

  const handleCancelarEliminarGrupo = () => {
    if (eliminandoGrupo) return;
    setMostrarModalEliminar(false);
  };

  const handleConfirmarEliminarGrupo = async () => {
    if (!idGrupo) return;

    try {
      setEliminandoGrupo(true);
      await eliminarGrupoApi(idGrupo);

      setModal({
        tipo: "exito",
        mensaje: "Grupo eliminado correctamente.",
      });

      // Redirigimos a la lista de grupos
      router.push("/grupos");
    } catch (error) {
      console.error("Error al eliminar grupo:", error);

      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          "No se pudo eliminar el grupo. Intentalo nuevamente.";
        setModal({ tipo: "error", mensaje: msg });
      } else {
        setModal({
          tipo: "error",
          mensaje: "Ocurrió un error inesperado al eliminar el grupo.",
        });
      }
    } finally {
      setEliminandoGrupo(false);
      setMostrarModalEliminar(false);
    }
  };

  const handleCancelarObjetivo = () => {
    setEditandoObjetivo(false);
  };
  const handleModificarGrupo = () => {
    setModal({
      tipo: "sorry",
      mensaje: "Ups todavia estamos trabajando en esto.",
    });
  };
  const handleVerFinanciamientos = () => {
    setModal({
      tipo: "sorry",
      mensaje: "Ups todavia estamos trabajando en esto.",
    });
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuAbierto((prev) => !prev);
  };

  const handleGuardarObjetivo = async () => {
    if (!idGrupo) return;

    try {
      setGuardandoObjetivo(true);
      const grupoActualizado = await actualizarGrupoApi(idGrupo, {
        objetivo: objetivoTemp,
      });

      setGrupo(grupoActualizado);
      setEditandoObjetivo(false);
    } catch (error) {
      console.error("Error al actualizar objetivo:", error);
      setModal({
        tipo: "error",
        mensaje: "No se pudo guardar el objetivo. Intentalo nuevamente.",
      });
    } finally {
      setGuardandoObjetivo(false);
    }
  };

  useEffect(() => {
    if (!idGrupo) return;
    const cargarGrupoDetalle = async () => {
      try {
        setLoading(true);
        const grupoDetalle = await getGrupoDetalle(idGrupo);
        setGrupo(grupoDetalle);
      } catch (error) {
        console.error("Error al cargar detalle del grupo:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarGrupoDetalle();
  }, [idGrupo]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando información del grupo...
      </div>
    );
  if (!grupo)
    return (
      <div className="p-8 text-center text-red-500">
        No se encontró el grupo.
      </div>
    );

  const nombreDirector = obtenerNombreCompleto(grupo.director);
  const nombreVice = obtenerNombreCompleto(grupo.vicedirector);

  return (
    <div className="grupo-detalle">
      {modal && (
        <ModalMensaje
          tipo={modal.tipo}
          mensaje={modal.mensaje}
          onClose={() => setModal(undefined)}
        />
      )}

      <EditarObjetivoModal
        abierto={editandoObjetivo}
        valor={objetivoTemp}
        onChange={setObjetivoTemp}
        onCancelar={handleCancelarObjetivo}
        onGuardar={handleGuardarObjetivo}
        guardando={guardandoObjetivo}
      />
       <ModalEliminar
        isOpen={mostrarModalEliminar}
        message="¿Está seguro que desea eliminar este grupo?"
        warning="Esta acción no se puede deshacer."
        onCancel={handleCancelarEliminarGrupo}
        onConfirm={handleConfirmarEliminarGrupo}
        baseClassName="grupos-page" // o "grupos-page" si querés reutilizar esos estilos
      />

      {/* HEADER */}
      <div className="grupo-detalle__header">
        <div className="grupo-detalle__column">
          <div className="grupo-detalle__info">
            <h1>
              {grupo.siglas ? `${grupo.siglas.toUpperCase()} - ` : ""}
              {grupo.nombre}
            </h1>
            {nombreDirector !== "Sin asignar" && (
              <p>
                <strong>Director:</strong> {nombreDirector}
              </p>
            )}
            {nombreVice !== "Sin asignar" && (
              <p>
                <strong>Vicedirector:</strong> {nombreVice}
              </p>
            )}
          </div>
          <div className="grupo-detalle__actions">
            {grupo.organigramaUrl && grupo.organigramaPublicId && (
              <button
                className="grupo-detalle__btn grupo-detalle__btn--primary"
                onClick={handleDescargarOrganigrama}
              >
                <FaSitemap /> Organigrama
              </button>
            )}

            <button
              className="grupo-detalle__btn grupo-detalle__btn--secondary"
              onClick={handleNotFinished}
            >
              <FaFileLines /> Crear Reporte
            </button>
          </div>
        </div>
        <div className="grupo-detalle__column">
          <div className="grupo-detalle__menu-wrapper">
            <button
              className="grupo-detalle__menu-trigger"
              onClick={toggleMenu}
              type="button"
            >
              <FaEllipsisVertical />
            </button>{" "}
            {menuAbierto && (
              <div className="grupo-detalle__menu">
                <button
                  className="grupo-detalle__menu-item"
                  onClick={handleModificarGrupo}
                  type="button"
                >
                  Modificar grupo
                </button>
                <button
                  className="grupo-detalle__menu-item"
                  onClick={handleEliminarGrupo}
                  type="button"
                >
                  Eliminar grupo
                </button>
                <button
                  className="grupo-detalle__menu-item"
                  onClick={handleVerFinanciamientos}
                  type="button"
                >
                  Ver financiamientos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATS GRID - AQUI ESTABA EL ERROR DE LA TARJETA VACIA */}
      <div className="grupo-detalle__stats-grid">
        {/* 1. Tarjeta de Integrantes (AHORA TIENE DATOS) */}
        <div className="grupo-detalle__card">
          <span className="grupo-detalle__stat-number">
            {grupo.integrantes?.length || 0}
          </span>
          <span className="grupo-detalle__stat-label">Integrantes</span>
        </div>

        {/* 2. Tarjeta de Equipamientos */}
        <div className="grupo-detalle__card">
          <div
            className="grupo-detalle__icon-corner"
            onClick={handleVerEquipamiento}
          >
            <FaEye />
          </div>
          <span className="grupo-detalle__stat-number">2</span>
          <span className="grupo-detalle__stat-label">Equipamientos</span>
        </div>

        {/* 3. Tarjeta de Objetivo (Grande) */}
        <div className="grupo-detalle__card grupo-detalle__card--large">
          <div
            className="grupo-detalle__icon-corner"
            onClick={handleEditarObjetivo}
          >
            <FaPen />
          </div>

          <h3 className="grupo-detalle__objetivo-tittle">Objetivo:</h3>
          <p className="grupo-detalle__objetivo-text">
            {grupo.objetivo || "Sin objetivo definido para este grupo."}
          </p>
        </div>
      </div>

      {/* TABLA INTEGRANTES */}
      <h2 className="grupo-detalle__section-title">Integrantes</h2>

      <div className="grupo-detalle__toolbar">
        <div className="grupo-detalle__search-container">
          <input
            type="text"
            placeholder="Buscar Integrante"
            className="grupo-detalle__search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <button
            className="grupo-detalle__filter-btn"
            onClick={handleNotFinished}
          >
            <FaFilter />
          </button>
        </div>

        <button className="grupo-detalle__btn grupo-detalle__btn--primary">
          <FaCirclePlus /> Agregar Integrante
        </button>
      </div>

      <DataTable<PersonalResponse>
        data={grupo.integrantes || []}
        columns={columnasIntegrantes}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onTableInit={setTable}
        pageSize={3}
      />
    </div>
  );
}
