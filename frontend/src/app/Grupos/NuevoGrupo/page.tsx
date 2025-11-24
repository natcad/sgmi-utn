"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from "@/services/api";
// Si no usas axios directamente en este archivo (porque usas 'api'), puedes quitar esta importación.
// Pero la dejamos por si acaso tu instancia de 'api' no captura ciertos errores de tipo.
import axios from "axios"; 
import { Facultad } from '@/interfaces/module/Grupos/Facultad';
import { MensajeModal } from '@/interfaces/module/Personal/MensajeModal';



interface GrupoFormData {
  facultadRegional: string;
  nombre: string;
  correoInstitucional: string;
  siglas: string;
  objetivo: string;
  director: string;
  vicedirector: string;
  integrantesCE: string; 
  organigramaFile: File | null;
}

const SELECCIONAR_REGIONAL = "Seleccione una Regional";

const NuevoGrupoForm = () => {
  const router = useRouter();
  
  // Estados del formulario
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState<GrupoFormData>({
    facultadRegional: '',
    nombre: '',
    correoInstitucional: '',
    siglas: '',
    objetivo: '',
    director: '',
    vicedirector: '',
    integrantesCE: '',
    organigramaFile: null,
  });
  const [errores, setErrores] = useState<Partial<GrupoFormData>>({});
  const [loading, setLoading] = useState(false);
  
  // Estado para Facultades
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [loadingFacultades, setLoadingFacultades] = useState(true);

  //Estado para mensaje
  const [mensaje, setMensaje] = useState<MensajeModal | null>(null);

  // Cargar Facultades al iniciar
    useEffect(() => {
    async function fetchFacultades() {
        setLoadingFacultades(true);
        try {
            // Petición al endpoint real
            const res = await api.get<Facultad[]>("/facultades-regionales");
            setFacultades(res.data || []);
        } catch (error) {
            console.error("Error al cargar facultades:", error);
            setMensaje({ tipo: 'error', mensaje: 'Error al cargar las facultades regionales.' });
        } finally {
            setLoadingFacultades(false);
        }
    }
    fetchFacultades();
  }, []);

  // Manejadores de cambios
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, organigramaFile: e.target.files![0] }));
    }
  };

  // Validaciones
  const validarPaso1 = () => {
    const nuevosErrores: Partial<GrupoFormData> = {};
    if (!formData.facultadRegional || formData.facultadRegional === SELECCIONAR_REGIONAL) {
      nuevosErrores.facultadRegional = 'La Facultad Regional es requerida.';
    }
    if (!formData.nombre) nuevosErrores.nombre = 'El Nombre del Grupo es requerido.';
    if (!formData.correoInstitucional) nuevosErrores.correoInstitucional = 'El Correo es requerido.';
    if (!formData.siglas) nuevosErrores.siglas = 'Las Siglas son requeridas.';
    if (!formData.objetivo) nuevosErrores.objetivo = 'El Objetivo es requerido.';
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const validarPaso2 = () => {
    const nuevosErrores: Partial<GrupoFormData> = {};
    if (!formData.director) nuevosErrores.director = 'El Director es requerido.';
    if (!formData.vicedirector) nuevosErrores.vicedirector = 'El Vicedirector es requerido.';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Navegación del Wizard
  const handleContinuar = () => {
    if (validarPaso1()) {
      setPaso(2);
      setErrores({});
    }
  };

  const handleConfirmar = async () => {
    if (!validarPaso2()) return;

    setLoading(true);

    try {
      // Usamos FormData para enviar el archivo y los datos
      const formDataToSend = new FormData();
      
      // Agregar campos de texto
      formDataToSend.append('siglas', formData.siglas);
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('facultadRegional', formData.facultadRegional);
      formDataToSend.append('correoElectronico', formData.correoInstitucional);
      formDataToSend.append('objetivo', formData.objetivo);
      formDataToSend.append('director', formData.director);
      formDataToSend.append('vicedirector', formData.vicedirector);
      formDataToSend.append('integrantesCE', formData.integrantesCE);

      // Agregar archivo si existe (clave 'organigrama' según tu backend)
      if (formData.organigramaFile) {
        formDataToSend.append('organigrama', formData.organigramaFile);
      }

      // Petición POST
      await api.post('/grupos', formDataToSend);
      setMensaje({ tipo: 'exito', mensaje: 'Grupo de investigación creado exitosamente.' });

      // Esperar un momento para que el usuario lea el mensaje antes de redirigir
      setTimeout(() => {
          router.push('/grupos');
      }, 2000);

    } catch (error) {
      console.error("Error al crear grupo:", error);
      // ERROR: Mostrar modal de error
      let msgError = 'Ocurrió un error al crear el grupo.';
      if (axios.isAxiosError(error) && error.response) {
          // Si el backend devuelve un mensaje de error específico
          msgError = error.response.data.message || msgError;
      }
      setMensaje({ tipo: 'error', mensaje: msgError });
    } finally {
      setLoading(false);
    }
  };

    // Función para cerrar el modal
  const handleCloseModal = () => {
      setMensaje(null);
  };

  // Renderizado - Paso 1
  const renderPaso1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Datos Básicos</h2>
      
      {/* Facultad */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Facultad Regional *</label>
        <select
          name="facultadRegional"
          value={formData.facultadRegional}
          onChange={handleChange}
          disabled={loadingFacultades}
          className={`mt-1 block w-full p-3 border rounded-lg ${errores.facultadRegional ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="">{loadingFacultades ? "Cargando..." : SELECCIONAR_REGIONAL}</option>
          {facultades.map(fac => (
            <option key={fac.id} value={fac.nombre}>{fac.nombre}</option>
          ))}
        </select>
        {errores.facultadRegional && <p className="text-xs text-red-500 mt-1">{errores.facultadRegional}</p>}
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre del Grupo *</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className={`mt-1 block w-full p-3 border rounded-lg ${errores.nombre ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errores.nombre && <p className="text-xs text-red-500 mt-1">{errores.nombre}</p>}
      </div>

      {/* Correo y Siglas */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Correo Institucional *</label>
          <input
            type="email"
            name="correoInstitucional"
            value={formData.correoInstitucional}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg ${errores.correoInstitucional ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errores.correoInstitucional && <p className="text-xs text-red-500 mt-1">{errores.correoInstitucional}</p>}
        </div>
        <div className="sm:w-1/3">
          <label className="block text-sm font-medium text-gray-700">Siglas *</label>
          <input
            type="text"
            name="siglas"
            value={formData.siglas}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 border rounded-lg ${errores.siglas ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errores.siglas && <p className="text-xs text-red-500 mt-1">{errores.siglas}</p>}
        </div>
      </div>

      {/* Objetivo */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Objetivo *</label>
        <textarea
          name="objetivo"
          rows={4}
          value={formData.objetivo}
          onChange={handleChange}
          className={`mt-1 block w-full p-3 border rounded-lg resize-none ${errores.objetivo ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errores.objetivo && <p className="text-xs text-red-500 mt-1">{errores.objetivo}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <button type="button" onClick={handleContinuar} className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 shadow-md">
          Continuar
        </button>
      </div>
    </div>
  );

  // Renderizado - Paso 2
  const renderPaso2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Autoridades</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Director/a *</label>
            <input type="text" name="director" value={formData.director} onChange={handleChange} className={`mt-1 block w-full p-3 border rounded-lg ${errores.director ? 'border-red-500' : 'border-gray-300'}`} />
            {errores.director && <p className="text-xs text-red-500 mt-1">{errores.director}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vicedirector/a *</label>
            <input type="text" name="vicedirector" value={formData.vicedirector} onChange={handleChange} className={`mt-1 block w-full p-3 border rounded-lg ${errores.vicedirector ? 'border-red-500' : 'border-gray-300'}`} />
            {errores.vicedirector && <p className="text-xs text-red-500 mt-1">{errores.vicedirector}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Integrantes Consejo Ejecutivo</label>
            <input type="text" name="integrantesCE" value={formData.integrantesCE} onChange={handleChange} placeholder="Nombres separados por coma" className="mt-1 block w-full p-3 border border-gray-300 rounded-lg" />
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700">Organigrama</label>
           <div className="mt-1 flex justify-center border-2 border-gray-300 border-dashed rounded-lg p-6 hover:border-blue-400 cursor-pointer h-full items-center">
              <input id="organigramaFile" type="file" className="sr-only" onChange={handleFileChange} />
              <label htmlFor="organigramaFile" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <svg className="mx-auto h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 14.5v.5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-.5M12 2v10M9 9l3 3 3-3"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-600 mt-2">{formData.organigramaFile ? formData.organigramaFile.name : "Subir Archivo"}</span>
              </label>
           </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button type="button" onClick={() => setPaso(1)} className="bg-gray-400 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-500 shadow-md">
          Atrás
        </button>
        <button type="button" onClick={handleConfirmar} disabled={loading} className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 shadow-md disabled:opacity-50">
          {loading ? 'Guardando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Nuevo Grupo de Investigacion</h1>
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-4xl mx-auto">
        {paso === 1 ? renderPaso1() : renderPaso2()}
      </div>
    </div>
  );
};

export default NuevoGrupoForm;