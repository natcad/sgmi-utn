/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import type { Table } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import axios from "axios";

import {
  FaEye,
  FaFileLines,
  FaPen,
  FaFilter,
  FaCirclePlus,
  FaSitemap,
  FaEllipsisVertical,
} from "react-icons/fa6";
import { DataTable } from "@/components/DataTable";
import { columnasIntegrante } from "../../grupos/components/columnasIntegrantes";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";
import "../../../styles/grupos/detallegrupo.scss";
import ModalMensaje from "@/components/ModalMensaje";
import ModalConfirmacion from "@/components/ModalConfirmacion";
import {
  exportarEstadoActualGrupoExcel,
  descargarBlob} from "@/services/reporte.api";
import { obtenerNombreCompleto } from "@/utils/helpers";
import EditarObjetivoModal from "../../grupos/components/EditarObjetivoModal";
import ModalEliminar from "@/components/ModalEliminar";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import { useGrupoDetalle } from "@/hooks/useGrupoDetalle";

export default function GrupoDetallePage() {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<Table<PersonalResponse> | null>(null);
  const [idEliminar, setIdEliminar] = useState<number | null>(null);
  const [modalPersonal, setModalPersonal] = useState<{
    tipo: string;
    mensaje: string;
  } | null>(null);

  const handleEditar = (id: number) => {
    router.push(`/agregar-personal?id=${id}`);
  };

  const solicitarEliminacion = (id: number) => {
    setIdEliminar(id);
  };

  const confirmarEliminacion = async () => {
    if (!idEliminar) return;

    try {
      await api.delete(`/personal/${idEliminar}`);
      setModalPersonal({
        tipo: "exito",
        mensaje: "Personal eliminado correctamente",
      });
      // Recargar la página para actualizar la lista de integrantes
      window.location.reload();
    } catch (error) {
      console.error(error);
      setModalPersonal({
        tipo: "error",
        mensaje: "Hubo un error al eliminar el personal",
      });
    } finally {
      setIdEliminar(null);
    }
  };

  const columnasIntegrantes = React.useMemo(
    () => columnasIntegrante(handleEditar, solicitarEliminacion),
    [],
  );
  const {
    grupo,
    loading,
    modal,
    equipamiento,

    handleCloseModal,
    editandoObjetivo,
    objetivoTemp,
    setObjetivoTemp,
    guardandoObjetivo,
    handleEditarObjetivo,
    handleCancelarObjetivo,
    handleGuardarObjetivo,

    menuAbierto,
    toggleMenu,
    mostrarModalEliminar,
    handleEliminarGrupo,
    handleCancelarEliminarGrupo,
    handleConfirmarEliminarGrupo,
    handleAgregarIntegrantes,
    handleDescargarOrganigrama,
    handleNotFinished,
    handleVerEquipamiento,
    handleModificarGrupo,
    handleVerFinanciamientos,
    handleCargarAutoridades,
  } = useGrupoDetalle();

  if (loading)
    return (
      <div className="p-8">
        <Loading message="Cargando información del grupo..." />
      </div>
    );
  if (!grupo)
    return (
      <div className="p-8">
        <EmptyState title="No se encontró el grupo." />
      </div>
    );

  const nombreDirector = obtenerNombreCompleto(grupo.director);
  const nombreVice = obtenerNombreCompleto(grupo.vicedirector);
  const handleExportarEstadoActual = async () => {
    try {
      const blob = await exportarEstadoActualGrupoExcel(grupo.id);
      const nombre = (grupo.nombre ?? `Grupo_${grupo.id}`)
        .trim()
        .replaceAll(" ", "_")
        .replace(/[^\w\-\.]/g, "_");

      descargarBlob(blob, `Estado_Actual_${nombre}.xlsx`);
    } catch (error) {
      console.error(error);
      <ModalMensaje
        tipo={"error"}
        mensaje={"Error al exportar el estado actual del grupo"}
        onClose={handleCloseModal}
      />;
    }
  };

  return (
    <div className="grupo-detalle">
      {modal && (
        <ModalMensaje
          tipo={modal.tipo}
          mensaje={modal.mensaje}
          onClose={handleCloseModal}
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
        baseClassName="grupos-page"
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
              onClick={handleExportarEstadoActual}
              type="button"
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
            </button>
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
                {grupo.integrantes.length > 0 &&
                  !grupo.director &&
                  !grupo.vicedirector && (
                    <button
                      className="grupo-detalle__menu-item"
                      onClick={handleCargarAutoridades}
                      type="button"
                    >
                      Cargar Autoridades y Organigrama
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grupo-detalle__stats-grid">
        <div className="grupo-detalle__card">
          <span className="grupo-detalle__stat-number">
            {grupo.integrantes.length}
          </span>
          <span className="grupo-detalle__stat-label">Integrantes</span>
        </div>

        <div className="grupo-detalle__card">
          <div
            className="grupo-detalle__icon-corner"
            onClick={handleVerEquipamiento}
          >
            <FaEye />
          </div>
          <span className="grupo-detalle__stat-number">
            {equipamiento?.length}
          </span>
          <span className="grupo-detalle__stat-label">Equipamientos</span>
        </div>

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

        <button
          className="grupo-detalle__btn grupo-detalle__btn--primary"
          onClick={() => handleAgregarIntegrantes(grupo.id)}
        >
          <FaCirclePlus /> Agregar Integrante
        </button>
      </div>
      <DataTable<PersonalResponse>
        data={grupo.integrantes}
        columns={columnasIntegrantes}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        pageSize={3}
      />

      {/* Modal de confirmación para eliminar personal */}
      {idEliminar && (
        <ModalConfirmacion
          mensaje="¿Estás seguro de que deseas <b>eliminar</b> a este personal?<br>Esta acción no se puede deshacer."
          onConfirm={confirmarEliminacion}
          onCancel={() => setIdEliminar(null)}
        />
      )}

      {/* Modal de mensaje para personal */}
      {modalPersonal && (
        <ModalMensaje
          tipo={modalPersonal.tipo as any}
          mensaje={modalPersonal.mensaje}
          onClose={() => setModalPersonal(null)}
        />
      )}
    </div>
  );
}
