"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Grupo } from "@/interfaces/module/Grupos/Grupos"; 
import { DataTable } from "@/components/DataTable"; // Componente DataTable de tu compañera
import api from "@/services/api"; // Servicio API importado correctamente
import { columnasGrupos } from "./columnasGrupo"; // Columnas de tu sección
import { Table, ColumnDef } from "@tanstack/react-table";
import { FaCirclePlus } from "react-icons/fa6";
import axios from "axios"; // Librería Axios
import "../../styles/grupos/home.scss";
import ModalMensaje from "@/components/ModalMensaje"; 
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal"; 

export default function GruposHomepage() {
  const router = useRouter();
  //estados de datos
  const [datos, setDatos] = useState<Grupo[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<Table<Grupo> | null>(null);
  const [loading, setLoading] = useState(false);

  // Estado para el Modal de Mensajes 
  const [modal, setModal] = useState<MensajeModal | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<Grupo[]>("/grupos"); 
      setDatos(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) return;
      }
      console.error("Error al cargar grupos:", err);
     if (axios.isAxiosError(err)) {
         // Si es 401, el interceptor lo maneja. Si es otro, mostrar modal.
         if (err.response?.status !== 401) {
             const mensajeError = err.response?.data?.message || "Error al cargar el listado de grupos.";
             setModal({ 
                tipo: "error", 
                mensaje: mensajeError 
             });
         }
      } else {
          setModal({ tipo: "error", mensaje: "Ocurrió un error inesperado." });
      }

    } finally {
      setLoading(false);
    }
  };

  const handleNuevoGrupo = () => {
    router.push('/grupos/nuevogrupo');
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lógica para detectar si hay resultados tras el filtrado
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
      
      <h1 className="grupos-page__titulo">
        Grupos de Investigacion
      </h1>
      
      <div className="grupos-page__toolbar">
        {/* Buscador */}
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar Grupo..." 
          className="grupos-page__input"
        />
        
        <div className="grupos-page__actions">
            {/* Botón Filtro (Solo visual por ahora) */}
            {/*<button className="grupos-page__btn grupos-page__btn--icon" aria-label="Filtrar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25H10.5m0-15V4.5A2.25 2.25 0 0 1 12.75 2.25h3M10.5 6v14.25m0-14.25H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h5.25" />
                </svg>
            </button>
            */}
            {/* Botón Nuevo Grupo */}
            <button 
            onClick={handleNuevoGrupo} 
            className="grupos-page__btn grupos-page__btn--primary"
            >
            <FaCirclePlus /> Nuevo Grupo
            </button>
        </div>
      </div>

      {/* Tabla de Datos */}
      <DataTable<Grupo>
        data={datos}
        columns={columnasGrupos as ColumnDef<Grupo>[]}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onTableInit={setTable}
        pageSize={10}
      />
      {/* Mensaje visual de "No encontrado" en la tabla */}
        {!loading && table && !hayResultados && (
            <div className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-lg mt-4 shadow-sm">
                <p className="text-lg font-medium">No se encontraron grupos</p>
                <p className="text-sm mt-1">Intenta con otros términos de búsqueda.</p>
            </div>
        )}

      {/* Paginación Manual*/}
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