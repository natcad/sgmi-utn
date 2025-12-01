"use client";
import React, { useState } from "react";
import type { Table } from "@tanstack/react-table";

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
import { columnasIntegrante } from "../components/columnasIntegrantes";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";
import "../../../styles/grupos/detallegrupo.scss";
import ModalMensaje from "@/components/ModalMensaje";

import { obtenerNombreCompleto } from "@/utils/helpers";
import EditarObjetivoModal from "../components/EditarObjetivoModal";
import ModalEliminar from "@/components/ModalEliminar";
import { useGrupoDetalle } from "@/hooks/useGrupoDetalle";
export default function GrupoDetallePage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<Table<PersonalResponse> | null>(null);

  const columnasIntegrantes = React.useMemo(() => columnasIntegrante(), []);
  const {
    grupo,
    loading,
    modal,
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

    handleDescargarOrganigrama,
    handleNotFinished,
    handleVerEquipamiento,
    handleModificarGrupo,
    handleVerFinanciamientos,
    handleCargarAutoridades,
  } = useGrupoDetalle();

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
          <span className="grupo-detalle__stat-number">2</span>
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

        <button className="grupo-detalle__btn grupo-detalle__btn--primary">
          <FaCirclePlus /> Agregar Integrante
        </button>
      </div>

      <DataTable<PersonalResponse>
        data={grupo.integrantes}
        columns={columnasIntegrantes}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onTableInit={setTable}
        pageSize={3}
      />
    </div>
  );
}
