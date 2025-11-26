"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from "@/services/api";
import axios from "axios"; 
import { Facultad } from '@/interfaces/module/Grupos/Facultad';
import { MensajeModal } from '@/interfaces/module/Personal/MensajeModal';
import ModalMensaje from "@/components/ModalMensaje";
import "../../../styles/grupos/formulario.scss";


interface GrupoFormData {
  facultadRegional: string;
  nombre: string;
  correo: string;
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
    correo: '',
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
            console.log("Intentando cargar facultades desde: /facultades-regionales");
            const res = await api.get<Facultad[]>("/facultades-regionales");
            console.log("Facultades cargadas:", res.data);
            setFacultades(res.data || []);
        } catch (error) {
            console.error("Error CRÍTICO al cargar facultades:", error);
            setMensaje({ tipo: 'error', mensaje: 'Error al cargar las facultades regionales. Revisa la consola.' });
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
    if (!formData.correo) nuevosErrores.correo = 'El Correo es requerido.';
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
      formDataToSend.append('idfacultadRegional', formData.facultadRegional);
      formDataToSend.append('correoElectronico', formData.correo);
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
    <div className="nuevo-grupo__form-grid">
      <h2 className="nuevo-grupo__subtitulo">Datos Básicos</h2>
      
      {/* Facultad */}
      <div>
        <label className="nuevo-grupo__label">Facultad Regional *</label>
        <select
          name="facultadRegional"
          value={formData.facultadRegional}
          onChange={handleChange}
          disabled={loadingFacultades}
          className={`nuevo-grupo__select ${errores.facultadRegional ? 'nuevo-grupo__select--error' : ''}`}
        >
          <option value="">{loadingFacultades ? "Cargando..." : SELECCIONAR_REGIONAL}</option>
          {facultades.map(fac => (
            <option key={fac.id} value={fac.id}>{fac.nombre}</option>
          ))}
        </select>
        {errores.facultadRegional && <p className="nuevo-grupo__error-text">{errores.facultadRegional}</p>}
      </div>

      {/* Nombre */}
      <div>
        <label className="nuevo-grupo__label">Nombre del Grupo *</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className={`nuevo-grupo__input ${errores.nombre ? 'nuevo-grupo__input--error' : ''}`}
        />
        {errores.nombre && <p className="nuevo-grupo__error-text">{errores.nombre}</p>}
      </div>

      {/* Correo y Siglas */}
      <div className="nuevo-grupo__row">
        <div className="nuevo-grupo__col">
          <label className="nuevo-grupo__label">Correo Institucional *</label>
          <input
            type="email"
            name="correoInstitucional"
            value={formData.correo}
            onChange={handleChange}
            className={`nuevo-grupo__input ${errores.correo ? 'nuevo-grupo__input--error' : ''}`}
          />
          {errores.correo && <p className="nuevo-grupo__error-text">{errores.correo}</p>}
        </div>
        <div className= "nuevo-grupo__col" style={{ flex: '0 0 33%' }}>
          <label className="nuevo-grupo__label">Siglas *</label>
          <input
            type="text"
            name="siglas"
            value={formData.siglas}
            onChange={handleChange}
            className={`nuevo-grupo__input ${errores.siglas ? 'nuevo-grupo__input--error' : ''}`}
          />
          {errores.siglas && <p className="nuevo-grupo__error-text">{errores.siglas}</p>}
        </div>
      </div>

      {/* Objetivo */}
      <div>
        <label className="nuevo-grupo__label">Objetivo *</label>
        <textarea
          name="objetivo"
          rows={4}
          value={formData.objetivo}
          onChange={handleChange}
          className={`nuevo-grupo__textarea ${errores.objetivo ? 'nuevo-grupo__textarea--error' : ''}`}
        />
        <div className="nuevo-grupo__char-count">{formData.objetivo.length}/200</div>
        {errores.objetivo && <p className="nuevo-grupo__error-text">{errores.objetivo}</p>}
      </div>

      <div className="nuevo-grupo__actions">
        <button type="button" onClick={handleContinuar} className="nuevo-grupo__btn nuevo-grupo__btn--primary">
          Continuar
        </button>
      </div>
    </div>
  );

  // Renderizado - Paso 2
  const renderPaso2 = () => (
    <div className="nuevo-grupo__form-grid">
      <h2 className="nuevo-grupo__subtitulo">Autoridades</h2>
      <div className="nuevo-grupo__row">
        <div className="nuevo-grupo__col">
          <div>
            <div style={{ marginBottom: '1rem' }}></div>
            <label className="nuevo-grupo__label">Director/a *</label>
            <input type="text" name="director" value={formData.director} onChange={handleChange} className={`nuevo-grupo__input ${errores.director ? 'nuevo-grupo__input--error' : ''}`} />
            {errores.director && <p className="nuevo-grupo__error-text">{errores.director}</p>}
          </div>
          <div>
            <div style={{ marginBottom: '1rem' }}></div>
            <label className="nuevo-grupo__label">Vicedirector/a *</label>
            <input type="text" name="vicedirector" value={formData.vicedirector} onChange={handleChange} className={`nuevo-grupo__input ${errores.vicedirector ? 'nuevo-grupo__input--error' : ''}`} />
            {errores.vicedirector && <p className="nuevo-grupo__error-text">{errores.vicedirector}</p>}
          </div>
          <div>
            <label className="nuevo-grupo__label" style={{ fontWeight: 'normal' }}>Integrantes Consejo Ejecutivo</label>
            <input type="text" name="integrantesCE" value={formData.integrantesCE} onChange={handleChange} placeholder="Nombres separados por coma" className="nuevo-grupo__input" />
          </div>
        </div>

        <div className="nuevo-grupo__col">
          <div style={{ height: '100%' }}>
              <label className="nuevo-grupo__label">Organigrama</label>
              <div className="nuevo-grupo__upload-area">
                  <input id="organigramaFile" type="file" className="sr-only" onChange={handleFileChange} />
                  <label htmlFor="organigramaFile" className="nuevo-grupo__upload-area-content">
                      <svg className="nuevo-grupo__upload-area-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 14.5v.5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-.5M12 2v10M9 9l3 3 3-3"/>
                      </svg>
                      <span className="text-sm font-medium">{formData.organigramaFile ? formData.organigramaFile.name : "Subir Archivo"}</span>
                  </label>
              </div>
          </div>
        </div>
      </div>

      <div className="nuevo-grupo__actions nuevo-grupo__actions--between">
        <button type="button" onClick={() => setPaso(1)} className="nuevo-grupo__btn nuevo-grupo__btn--secondary">
          Atrás
        </button>
        <button type="button" onClick={handleConfirmar} disabled={loading} className="nuevo-grupo__btn nuevo-grupo__btn--primary">
          {loading ? 'Guardando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="nuevo-grupo">
      <h1 className="nuevo-grupo__titulo">Nuevo Grupo de Investigacion</h1>
      <div className="nuevo-grupo__card">
        {paso === 1 ? renderPaso1() : renderPaso2()}
      </div>
      {mensaje && (
          <ModalMensaje 
            mensaje={mensaje.mensaje} 
            tipo={mensaje.tipo} 
            onClose={() => setMensaje(null)} 
          />
      )}
    </div>
  );
};

export default NuevoGrupoForm;