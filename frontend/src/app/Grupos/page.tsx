"use client";
import React, { useState, useEffect } from 'react';
// === IMPORTS REALES DE TU PROYECTO ===
import { Grupo } from "@/interfaces/module/Grupos/Grupos"; 
import { DataTable } from "@/components/DataTable"; // Componente DataTable de tu compañera
import api from "@/services/api"; // Servicio API importado correctamente
import { columnasGrupos } from "./columnasGrupo"; // Columnas de tu sección
import { Table, ColumnDef } from "@tanstack/react-table";
import { FaCirclePlus } from "react-icons/fa6";
import axios from "axios"; // Librería Axios






// === COMPONENTE PRINCIPAL ===
export default function GruposHomepage() {
  const [datos, setDatos] = useState<Grupo[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<Table<Grupo> | null>(null);
  const [loading, setLoading] = useState(false);

  // Función para obtener los datos (GET)
  const fetchData = async () => {
    setLoading(true);
    try {
      // 🚨 CORRECCIÓN: Usando la importación 'api' sin (window as any)
      const res = await api.get<Grupo[]>("/grupos"); 
      setDatos(res.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) return;
      }
      console.error("Error al cargar grupos:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🧪 FUNCIÓN TEMPORAL PARA CREAR UN GRUPO (Función POST)
  const handleCrearGrupoTemporal = async () => {
    // Datos de prueba basados en tu interfaz Grupo
    const testData: Omit<Grupo, 'id'> = {
      siglas: "TEST",
      nombre: `Grupo Temporal Test - ${Date.now()}`,
      facultadRegional: "Buenos Aires",
      correoelectronico: `test-${Date.now()}@test.com`,
      objetivo: "Grupo creado para prueba de conexión POST",
      organigrama: null,
      presupuesto: null,
      idDirector: null,
      idVicedirector: null,
      idFuenteDeFinanciamiento: null,
    };

    try {
      setLoading(true);
      // 🚨 CORRECCIÓN: Usando la importación 'api' para el POST sin (window as any)
      const res = await api.post("/grupos", testData);
      console.log("Grupo creado exitosamente:", res.data);
      // Usar console.log en lugar de alert, siguiendo buenas prácticas
      console.log("Grupo de prueba creado con éxito. Recargando tabla..."); 
      
      // Recargar la lista para mostrar el nuevo grupo
      await fetchData(); 
    } catch (error) {
      console.error("Error al crear grupo:", error);
      // Se puede añadir un modal para mostrar el error si es necesario
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Nota: La lógica de filtrado y paginación se manejará dentro de DataTable si usas tanstack/react-table.
  // Si DataTable maneja la paginación y filtro global, no necesitamos la lógica useMemo.
  // Dejamos solo los componentes que tu compañera usó:

  return (
    <div className="grupos p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      
      <h1 className="grupos__titulo text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        Grupos de Investigacion
      </h1>
      
      <div className="grupos__toolbar flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* Input de búsqueda */}
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar Grupo..." 
          className="grupos__input w-full sm:w-80 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
        />
        {/* Botón de Filtro (Visual del Figma) */}
        <button className="flex items-center text-gray-600 bg-white border border-gray-300 py-3 px-4 rounded-lg shadow-sm hover:bg-gray-100 transition">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25H10.5m0-15V4.5A2.25 2.25 0 0 1 12.75 2.25h3M10.5 6v14.25m0-14.25H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h5.25" />
             </svg>
        </button>
        {/* Botón "Nuevo Grupo" con la función temporal de creación */}
        <button 
          onClick={handleCrearGrupoTemporal} 
          disabled={loading}
          className="grupos__add-btn flex items-center bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-lg w-full sm:w-auto disabled:opacity-50"
        >
          <FaCirclePlus className="w-5 h-5 mr-2" /> Nuevo Grupo (TEST)
        </button>
      </div>

      {/* Uso del componente DataTable, usando el tipo Grupo */}
      <DataTable<Grupo>
        data={datos}
        columns={columnasGrupos as ColumnDef<Grupo>[]}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onTableInit={setTable}
        pageSize={10}
      />

      {/* Lógica de Paginación, idéntica a la de tu compañera */}
      {table && (
        <div className="grupos__pagination flex justify-center items-center mt-6 space-x-4">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="grupos__page-btn bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
          >
            ◀ Anterior
          </button>

          <span className="grupos__page-info text-sm font-medium text-gray-700">
            Página <strong>{table.getState().pagination.pageIndex + 1}</strong>{" "}
            de <strong>{table.getPageCount()}</strong>
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="grupos__page-btn bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
          >
            Siguiente ▶
          </button>
        </div>
      )}
    </div>
  );
}