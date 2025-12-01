"use client";
import React from "react";
import { FaCirclePlus } from "react-icons/fa6";

import { Grupo } from "@/interfaces/module/Grupos/Grupos";
import { DataTable } from "@/components/DataTable";
import { Table } from "@tanstack/react-table";
import "../../styles/grupos/home.scss";
import "../../styles/components/_accionesColumnas.scss";
import ModalMensaje from "@/components/ModalMensaje";
import ModalEliminar from "../../components/ModalEliminar";
import { useGruposListado } from "@/hooks/useGrupo";

export default function GruposHomepage() {
  const {
    datos,
    loading,
    globalFilter,
    setGlobalFilter,
    columnas,
    hayResultados,
    handleNuevoGrupo,
    grupoAEliminar,
    confirmarEliminacion,
    cancelarEliminacion,
    modal,
    handleCloseModal,
    checkingRole,
    esAdmin,
    tieneGrupo,
  } = useGruposListado();

  if (checkingRole) {
    return (
      <div className="grupos-page">
        <p>Cargando...</p>
      </div>
    );
  }
  return (
    <div className="grupos-page">
      {modal && (
        <ModalMensaje
          tipo={modal.tipo}
          mensaje={modal.mensaje}
          onClose={handleCloseModal}
        />
      )}

      {grupoAEliminar !== null && (
        <ModalEliminar
          isOpen={grupoAEliminar !== null}
          message="¿Está seguro que desea eliminar este grupo?"
          warning="Esta acción no se puede deshacer."
          onCancel={cancelarEliminacion}
          onConfirm={confirmarEliminacion}
          baseClassName="grupos-page"
        />
      )}

      <h1 className="grupos-page__titulo">Grupos de Investigacion</h1>
      {!esAdmin && tieneGrupo === false && (
        <div className="grupos-page__no-group">
          <p>No tienes un grupo asignado aún.</p>
          <button
            onClick={handleNuevoGrupo}
            className="grupos-page__btn grupos-page__btn--primary"
          >
            <FaCirclePlus /> Añadir nuevo grupo
          </button>
        </div>
      )}

      {/* Admin: ve toolbar + tabla */}
      {esAdmin && (
        <>
          <div className="grupos-page__toolbar">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar Grupo..."
              className="grupos-page__input"
            />

            <div className="grupos-page__actions">
              <button
                onClick={handleNuevoGrupo}
                className="grupos-page__btn grupos-page__btn--primary"
              >
                <FaCirclePlus /> Nuevo Grupo
              </button>
            </div>
          </div>

          {/* Tabla de grupos */}
          <DataTable<Grupo>
            data={datos}
            columns={columnas}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            pageSize={10}
          />
  
        </>
      )}
    </div>
  );
}
