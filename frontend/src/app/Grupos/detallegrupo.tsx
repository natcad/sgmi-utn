"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Hook para leer el ID de la URL
import { FaEye, FaFileLines, FaPen, FaFilter, FaCirclePlus, FaSitemap } from "react-icons/fa6";
import { DataTable } from "@/components/DataTable";
import api from "@/services/api";
//import { columnasIntegrantes, Integrante } from "./columnasIntegrantes";
import { ColumnDef } from "@tanstack/react-table";
import "./GrupoDetalle.scss";

// Interfaz para el detalle completo del grupo
interface GrupoDetalle {
  id: number;
  nombre: string;
  siglas: string;
  objetivo: string;
  // Asumimos que el backend devuelve objetos para director/vice
  director: { nombre: string; apellido: string } | null; 
  vicedirector: { nombre: string; apellido: string } | null;
  //integrantes: Integrante[];
  // equipamientos: any[]; // Descomentar si existe
}

export default function GrupoDetallePage() {
  // Obtenemos el ID de la URL (ej: localhost:3000/grupos/5 -> id = 5)
  const params = useParams();
  const idGrupo = params?.id; 

  const [grupo, setGrupo] = useState<GrupoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<any>(null);

  useEffect(() => {
    if (!idGrupo) return;

    async function fetchGrupoDetalle() {
      try {
        setLoading(true);
        // Petición al backend para obtener 1 grupo específico
        const res = await api.get(`/grupos/${idGrupo}`);
        const data = res.data;

        // MOCK DE INTEGRANTES:
        // Si tu backend aún no devuelve la lista de 'personal' o 'integrantes',
        // usamos estos datos falsos para que veas la tabla llena como en el Figma.
        const integrantesMock = data.personal || [
            { id: 1, nombre: "Juan", apellido: "Martinez", rol: "Investigador", horasSemanales: 40, nivelFormacion: "Graduado" },
            { id: 2, nombre: "María", apellido: "Gonzalez", rol: "Personal En Formación", horasSemanales: 20, nivelFormacion: "Becario Graduado" },
            { id: 3, nombre: "Lucas Matias", apellido: "Perez", rol: "Personal Profesional", horasSemanales: 36, nivelFormacion: "Doctorado" },
            { id: 4, nombre: "Sebastian", apellido: "Fernandez", rol: "Personal de Apoyo", horasSemanales: 15, nivelFormacion: "Becario Alumno" },
        ];

        setGrupo({
            ...data,
            integrantes: integrantesMock
        });

      } catch (error) {
        console.error("Error al cargar detalle del grupo:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGrupoDetalle();
  }, [idGrupo]);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando información del grupo...</div>;
  if (!grupo) return <div className="p-8 text-center text-red-500">No se encontró el grupo.</div>;

  // Helpers para mostrar nombres o "Sin asignar"
  const nombreDirector = grupo.director ? `${grupo.director.nombre} ${grupo.director.apellido}` : "Sin asignar";
  const nombreVice = grupo.vicedirector ? `${grupo.vicedirector.nombre} ${grupo.vicedirector.apellido}` : "Sin asignar";

  return (
    <div className="grupo-detalle">
      
      {/* === CABECERA DEL GRUPO === */}
      <div className="grupo-detalle__header">
        <div className="grupo-detalle__info">
          <h1>{grupo.siglas ? `${grupo.siglas} - ` : ''}{grupo.nombre}</h1>
          <p><strong>Director:</strong> {nombreDirector}</p>
          <p><strong>Vicedirector:</strong> {nombreVice}</p>
        </div>
        <div className="grupo-detalle__actions">
          <button className="grupo-detalle__btn grupo-detalle__btn--primary">
            <FaSitemap /> Organigrama
          </button>
          <button className="grupo-detalle__btn grupo-detalle__btn--secondary">
            <FaFileLines /> Crear Reporte
          </button>
        </div>
      </div>

      {/* === TARJETAS DE ESTADÍSTICAS === */}
      <div className="grupo-detalle__stats-grid">
        {/* Tarjeta 1: Cantidad de Integrantes */}
        <div className="grupo-detalle__card">
          {/*<span className="grupo-detalle__stat-number">{grupo.integrantes?.length || 0}</span>*/}
          {/*<span className="grupo-detalle__stat-label">Integrantes</span>*/}
        </div>

        {/* Tarjeta 2: Cantidad de Equipamientos (Mockeado en 2 como en Figma) */}
        <div className="grupo-detalle__card">
          <div className="grupo-detalle__icon-corner"><FaEye /></div>
          <span className="grupo-detalle__stat-number">2</span>
          <span className="grupo-detalle__stat-label">Equipamientos</span>
        </div>

        {/* Tarjeta 3: Objetivo */}
        <div className="grupo-detalle__card grupo-detalle__card--large">
          <div className="grupo-detalle__icon-corner"><FaPen /></div>
          <h3 className="grupo-detalle__objetivo-title">Objetivo:</h3>
          <p className="grupo-detalle__objetivo-text">
            {grupo.objetivo || "Sin objetivo definido para este grupo."}
          </p>
        </div>
      </div>

      {/* === SECCIÓN INTEGRANTES === */}
      <h2 className="grupo-detalle__section-title">Integrantes</h2>
      
      <div className="grupo-detalle__toolbar">
        {/* Buscador y Filtro */}
        <div className="grupo-detalle__search-container">
            <input 
                type="text" 
                placeholder="Buscar Integrante" 
                className="grupo-detalle__search"
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value)}
            />
            <button className="grupo-detalle__filter-btn">
                <FaFilter />
            </button>
        </div>
        
        {/* Botón Agregar Integrante */}
        <button className="grupo-detalle__btn grupo-detalle__btn--primary">
            <FaCirclePlus /> Agregar Integrante
        </button>
      </div>

      {/* Tabla de Integrantes */}
      {/*<DataTable<Integrante>
        data={grupo.integrantes || []}
        columns={columnasIntegrantes}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onTableInit={setTable}
        pageSize={5}
      />*/}
    </div>
  );
}