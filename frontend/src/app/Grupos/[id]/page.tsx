"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Importación correcta de useRouter
import { FaEye, FaFileLines, FaPen, FaFilter, FaCirclePlus, FaSitemap } from "react-icons/fa6";
import { DataTable } from "@/components/DataTable";
import api from "@/services/api";
import { ColumnDef } from "@tanstack/react-table";
//Importamos la función que crea las columnas (asumiendo que columnasPersonal es ahora la función)
import { obtenercolumnasPersonal } from '@/app/personal/columnasPersonal';
import { PersonalResponse } from "@/interfaces/module/Personal/Personal"; 
import "../../../styles/grupos/detallegrupo.scss";

// --- INTERFACES ---
//interface Integrante {
  //id: number | string; 
  //nombre: string;
  //apellido: string;
  //rol: string;
  //horasSemanales: number;
  //nivelFormacion: string;
//}

// Interfaz flexible para evitar errores si la estructura cambia
interface UsuarioData {
  nombre: string;
  apellido: string;
}

interface DirectorData {
  Usuario?: UsuarioData; // Caso: viene anidado
  nombre?: string;       // Caso: viene plano
  apellido?: string;
}

interface GrupoDetalle {
  id: number;
  nombre: string;
  siglas: string;
  objetivo: string;
  director: { Usuario: { nombre: string; apellido: string } } | null;
  vicedirector: { Usuario: { nombre: string; apellido: string } } | null;
  integrantes: PersonalResponse[]; // La propiedad 'integrantes' debe existir
}

export default function GrupoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const idGrupo = params?.id;

  const [grupo, setGrupo] = useState<GrupoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<any>(null);

   // 🚨 LÓGICA MOVIDA FUERA DE useEffect 🚨
  // 1. Función para manejar la redirección del botón 'Ver Integrante'
  const handleVerIntegrante = (id: string | number) => {
    router.push(`/personal/${id}`); // Ruta al detalle del personal
  };

  // Llamamos a la función importada y le pasamos el handler
  const columnasIntegrantes = React.useMemo(() => 
    //Se llama a la función 'obtenerColumnasPersonal'
  obtenercolumnasPersonal(handleVerIntegrante), 
  [handleVerIntegrante]);

  //DESCARGAR ORGANIGRAMA
  const handleDescargarOrganigrama = async () => {
    if (!idGrupo) return;
    try {
      // Asumimos que existe un endpoint específico para descargar el archivo
      // Si tu backend devuelve la URL en el objeto grupo, avísame para cambiar esto.
      const response = await api.get(`/grupos/${idGrupo}/organigrama`, { 
        responseType: 'blob' // Importante para archivos binarios
      });
      
      // Crear URL temporal y forzar descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Organigrama_${grupo?.siglas || 'Grupo'}.pdf`); // Asumimos PDF, ajusta la extensión si es imagen
      document.body.appendChild(link);
      link.click();
      
      // Limpieza
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar organigrama:", error);
      alert("No se pudo descargar el organigrama. Verifique que exista uno cargado.");
    }
  };

  useEffect(() => {
    if (!idGrupo) return;

    async function fetchGrupoDetalle() {
      try {
        setLoading(true);
        const res = await api.get(`/grupos/${idGrupo}`);
        const data = res.data;

        // 🚨 Usamos data.personal o un array vacío como fallback
        const integrantesAPI: PersonalResponse[] = data.personal || []; 

        setGrupo({
          ...data,
          integrantes: integrantesAPI 
        });

      } catch (error) {
        console.error("Error al cargar detalle del grupo:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGrupoDetalle();
  }, [idGrupo]); // Dependencia del ID del grupo


  if (loading) return <div className="p-8 text-center text-gray-500">Cargando información del grupo...</div>;
  if (!grupo) return <div className="p-8 text-center text-red-500">No se encontró el grupo.</div>;

  
  // Intenta leer de director.Usuario.nombre O director.nombre
  const obtenerNombreCompleto = (persona: DirectorData | null) => {
    if (!persona) return "Sin asignar";
    if (persona.Usuario) {
        return `${persona.Usuario.nombre} ${persona.Usuario.apellido}`;
    }
    if (persona.nombre && persona.apellido) {
        return `${persona.nombre} ${persona.apellido}`;
    }
    return "Datos incompletos";
  };

  const nombreDirector = obtenerNombreCompleto(grupo.director);
  const nombreVice = obtenerNombreCompleto(grupo.vicedirector);


  return (
    <div className="grupo-detalle">
      {/* HEADER */}
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

      {/* STATS GRID - AQUI ESTABA EL ERROR DE LA TARJETA VACIA */}
      <div className="grupo-detalle__stats-grid">
        
        {/* 1. Tarjeta de Integrantes (AHORA TIENE DATOS) */}
          <div className="grupo-detalle__card">
                {/* Si quieres un icono aqui tambien, descomenta: */}
                {/* <div className="grupo-detalle__icon-corner"><FaSitemap /></div> */}
                <span className="grupo-detalle__stat-number">{grupo.integrantes?.length || 0}</span>
                <span className="grupo-detalle__stat-label">Integrantes</span>
          </div>

            {/* 2. Tarjeta de Equipamientos */}
          <div className="grupo-detalle__card">
            <div className="grupo-detalle__icon-corner"><FaEye /></div>
            <span className="grupo-detalle__stat-number">2</span>
            <span className="grupo-detalle__stat-label">Equipamientos</span>
          </div>


        {/* 3. Tarjeta de Objetivo (Grande) */}
        <div className="grupo-detalle__card grupo-detalle__card--large">
          <div className="grupo-detalle__icon-corner"><FaPen /></div>
          <h3 className="grupo-detalle__objetivo-title">Objetivo:</h3>
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
            onChange={e => setGlobalFilter(e.target.value)}
          />
          <button className="grupo-detalle__filter-btn">
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
        pageSize={10} 
      />
    </div>
  );
}