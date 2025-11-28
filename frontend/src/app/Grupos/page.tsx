"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Grupo } from "@/interfaces/module/Grupos/Grupos";
import { DataTable } from "@/components/DataTable";
import api from "@/services/api";
import { obtenerColumnas } from "./columnasGrupo";
import { Table, ColumnDef } from "@tanstack/react-table";
import { FaCirclePlus, FaTriangleExclamation } from "react-icons/fa6";
import axios from "axios";
import "../../styles/grupos/home.scss";
import "../../styles/components/_accionesColumnas.scss";
import ModalMensaje from "@/components/ModalMensaje";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";

export default function GruposHomepage() {
  const router = useRouter();
  const [datos, setDatos] = useState<Grupo[]>([]); // Estado que guarda los grupos obtenidos de la API
  const [globalFilter, setGlobalFilter] = useState("");  // Filtro global para el buscador
  const [table, setTable] = useState<Table<Grupo> | null>(null); // Referencia a la tabla generada por tanstack
  const [loading, setLoading] = useState(false); // Estado para indicar carga mientras se consulta al backend

  const [modal, setModal] = useState<MensajeModal | null>(null); // Modal para mostrar mensajes
  const [grupoAEliminar, setGrupoAEliminar] = useState<number | null>(null); // ID del grupo que el usuario quiere eliminar (para abrir confirmación)


  
  /**
   * Obtiene la lista de grupos desde el backend.
   * Manejo de errores y muestra modales si algo falla.
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<Grupo[]>("/grupos", {
  withCredentials: true,
    });
      setDatos(res.data);
    } catch (err) {
       // Manejo de errores con Axios
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) return;
      }
      console.error("Error al cargar grupos:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status !== 401) {  // Sesión expirada, no mostrará modal
          const mensajeError = err.response?.data?.message || "Error al cargar el listado de grupos.";
          setModal({
            tipo: "error",
            mensaje: mensajeError
          });
        }
      } else {
        // Error inesperado
        setModal({ tipo: "error", mensaje: "Ocurrió un error inesperado." });
      }

    } finally {
      setLoading(false);
    }
  };

   // Redirige a la página de creación de nuevo grupo
  const handleNuevoGrupo = () => {
    router.push('/grupos/nuevogrupo');
  };

  // Redirige a la página de ver un grupo
  const handleVerDetalle = (id: string | number) => { 
  router.push(`/grupos/${id}`); // Redirige a /grupos/[id] que es tu página de detalle
  };

  /**
   * Confirma eliminación después de que la usuaria acepta en el modal.
   * Llama al backend y recarga la tabla.
   */
  const confirmarEliminacion = async () => {
    if (!grupoAEliminar) return;
    try {
      await api.delete(`/grupos/${grupoAEliminar}`);
      setModal({ tipo: "exito", mensaje: "Grupo eliminado correctamente." });
      fetchData();
    } catch (error) {
      console.error("Error al eliminar grupo:", error);
      setModal({ tipo: "error", mensaje: "Error al eliminar el grupo." });
    } finally {
      setGrupoAEliminar(null);
    }
  };

  // Abre modal de confirmación para eliminar
  const handleEliminar = (id: number) => {
    setGrupoAEliminar(id);
  };
  
  const columnas = React.useMemo(() => obtenerColumnas(handleVerDetalle, handleEliminar), []);

   // Ejecuta la carga de datos una sola vez al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

    // Identifica si hay resultados en la tabla
  const hayResultados = table ? table.getRowModel().rows.length > 0 : true;

  return (
    <div className="grupos-page">

      {modal && (
        <ModalMensaje
          tipo={modal.tipo}
          mensaje={modal.mensaje}
          onClose={() => setModal(null)}
        />
      )}

      {grupoAEliminar && (
        <div className="grupos-page__modal-overlay">
          <div className="grupos-page__modal-content">
            <div className="grupos-page__modal-icon">
              <FaTriangleExclamation />
            </div>
            <h3 className="grupos-page__modal-title">Confirmar Eliminación</h3>
            <p className="grupos-page__modal-text">
              ¿Está seguro que desea eliminar este grupo?
              <span>Esta acción no se puede deshacer.</span>
            </p>
            <div className="grupos-page__modal-actions">
              <button
                onClick={() => setGrupoAEliminar(null)}
                className="grupos-page__btn grupos-page__btn--cancel"
              >
                Cancelar
              </button>
              <button
                onClick={() => { confirmarEliminacion(); }}
                className="grupos-page__btn grupos-page__btn--danger"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="grupos-page__titulo">
        Grupos de Investigacion
      </h1>

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
        onTableInit={setTable}
        pageSize={10}
      />
      {/* Mensaje cuando no hay resultados */}
      {!loading && table && !hayResultados && (
        <div className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-lg mt-4 shadow-sm">
          <p className="text-lg font-medium">No se encontraron grupos</p>
          <p className="text-sm mt-1">Intenta con otros términos de búsqueda.</p>
        </div>
      )}

      {table && (
        <div className="grupos-page__pagination">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="grupos-page__page-btn"
          >
            ◀ Anterior
          </button>

          <span className="grupos-page__page-info">
            Página <strong>{table.getState().pagination.pageIndex + 1}</strong>{" "}
            de <strong>{table.getPageCount()}</strong>
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="grupos-page__page-btn"
          >
            Siguiente ▶
          </button>
        </div>
      )}
    </div>
  );
}