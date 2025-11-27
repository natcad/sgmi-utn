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
  director: number | string;
  vicedirector: number | string;
  integrantesCE: number[]; 
  organigramaFile: File | null;
}

const SELECCIONAR_REGIONAL = "Seleccione una Regional";
const SELECCIONAR_DIRECTOR = "Seleccione Director/a";
const SELECCIONAR_VICEDIRECTOR = "Seleccione Vicedirector/a";
//const SELECCIONAR_INTEGRANTES = "Seleccione Integrantes";
const CARGANDO_PERSONAL = "Cargando personal...";

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
    integrantesCE: [],
    organigramaFile: null,
  });
  const [errores, setErrores] = useState<Partial<GrupoFormData>>({});
  const [loading, setLoading] = useState(false);
  
  // Estado para Facultades
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [loadingFacultades, setLoadingFacultades] = useState(true);
  const [personal, setPersonal] = useState<any[]>([]);
  const [loadingpersonal, setLoadingPersonal] = useState(true);

  //Estado para mensaje
  const [mensaje, setMensaje] = useState<MensajeModal | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cargar Facultades al iniciar
    useEffect(() => {
    async function fetchData() {
      setLoadingFacultades(true);
      setLoadingPersonal(true);
      try {
        const res = await api.get<Facultad[]>("/facultades-regionales");
        setFacultades(res.data || []);
      } catch (error) {
        setMensaje({ tipo: 'error', mensaje: 'Error al cargar las facultades regionales.' });
      } finally {
        setLoadingFacultades(false);
      }

      try {
        const resPersonal = await api.get("/personal"); 
        setPersonal(resPersonal.data || []);
      } catch (error) {
        setMensaje(prev => ({ tipo: 'error', mensaje: (prev?.mensaje || '') + ' Error al cargar el personal.' }));
      } finally {
          setLoadingPersonal(false); // <-- ¡Desactiva el loading de personal aquí!
      }
    }
    fetchData();
  }, []);


  // Manejadores de cambios

  const handleToggleIntegrantes = (idToToggle: number) => {
    // Si el ID ya está seleccionado, lo quitamos; si no, lo añadimos.
    setFormData(prev => {
        const currentIntegrantes = prev.integrantesCE;
        
        if (currentIntegrantes.includes(idToToggle)) {
            // Deseleccionar: filtrar el ID
            return {
                ...prev,
                integrantesCE: currentIntegrantes.filter(id => id !== idToToggle)
            };
        } else {
            // Seleccionar: añadir el ID
            return {
                ...prev,
                integrantesCE: [...currentIntegrantes, idToToggle]
            };
        }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, organigramaFile: file }));

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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
      formDataToSend.append('correo', formData.correo);
      formDataToSend.append('objetivo', formData.objetivo);
      formDataToSend.append('director', String(formData.director));
      formDataToSend.append('vicedirector', String(formData.vicedirector));
      formDataToSend.append('integrantesCE', JSON.stringify(formData.integrantesCE));

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

  // Paso 1
  const renderPaso1 = () => (
    <div className="nuevo-grupo__form-grid">
      <h2 className="nuevo-grupo__subtitulo">Datos Básicos</h2>
      
      {/* Facultad */}
      <div>
        <label className="nuevo-grupo__label">Facultad Regional </label>
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
        <label className="nuevo-grupo__label">Nombre del Grupo </label>
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
          <label className="nuevo-grupo__label">Correo Institucional </label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            className={`nuevo-grupo__input ${errores.correo ? 'nuevo-grupo__input--error' : ''}`}
          />
          {errores.correo && <p className="nuevo-grupo__error-text">{errores.correo}</p>}
        </div>
        <div className= "nuevo-grupo__col" style={{ flex: '0 0 33%' }}>
          <label className="nuevo-grupo__label">Siglas </label>
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
        <label className="nuevo-grupo__label">Objetivo </label>
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

      {/*Botón continuar*/}
      <div className="nuevo-grupo__actions">
        <button type="button" onClick={handleContinuar} className="nuevo-grupo__btn nuevo-grupo__btn--primary">
          Continuar
        </button>
      </div>
    </div>
  );

  // Paso 2
  const renderPaso2 = () => (
    <div className="nuevo-grupo__form-grid">
      <h2 className="nuevo-grupo__subtitulo">Autoridades</h2>
      <div className="nuevo-grupo__row">
        <div className="nuevo-grupo__col">
          <div>
              <div>
                  <label className="nuevo-grupo__label">Director/a </label>
                  <select 
                    name="director" 
                    value={formData.director} 
                    onChange={handleChange}
                    disabled={loadingpersonal}
                    className={`nuevo-grupo__select ${errores.director ? 'nuevo-grupo__select--error' : ''}`}
                  >
                    <option value="">{loadingpersonal ? CARGANDO_PERSONAL : SELECCIONAR_DIRECTOR}</option>
                    {personal.map((p) => {
                      const nombreCompleto = p.Usuario ? `${p.Usuario.apellido}, ${p.Usuario.nombre}` : `Personal N° ${p.id}`;
                      const identificador = p.legajo || p.rol || p.cargo;
                      const detalle = identificador ? ` (${identificador})` : '';
                      return (
                        <option key={p.id} value={p.id}>
                          {nombreCompleto}{detalle}
                        </option>
                      );
                    })}
                  </select>
                  {errores.director && <p className="nuevo-grupo__error-text">{errores.director}</p>}
              </div>

            <div>
              <label className="nuevo-grupo__label">Vicedirector/a </label>
              <select 
                name="vicedirector" 
                value={formData.vicedirector} 
                onChange={handleChange} 
                disabled={loadingpersonal}
                className={`nuevo-grupo__select ${errores.vicedirector ? 'nuevo-grupo__select--error' : ''}`}
              >            
                <option value="">{loadingpersonal ? CARGANDO_PERSONAL : SELECCIONAR_VICEDIRECTOR}</option>
                  {personal.map((p) => {
                    const nombreCompleto = p.Usuario ? `${p.Usuario.apellido}, ${p.Usuario.nombre}`: `Personal N° ${p.id}`;
                    const identificador = p.legajo || p.rol || p.cargo;
                    const detalle = identificador ? ` (${identificador})` : '';
                  return (
                    <option key={p.id} value={p.id}> 
                      {nombreCompleto}{detalle}
                    </option>
                  );
                  })}
              </select>
              {errores.vicedirector && <p className="nuevo-grupo__error-text">{errores.vicedirector}</p>}
            </div>

            <div>
              <label className="nuevo-grupo__label">Integrantes Consejo Ejecutivo</label>
              {/*CLAVE: Permite seleccionar varios*/}
                <div 
                  // Usamos las clases de select para mantener el look and feel del borde y fondo
                  className="nuevo-grupo__select nuevo-grupo__select--multiple"
                  style={{ height: '150px', overflowY: 'auto' }} // Aseguramos el scroll y la altura
                >
                  {personal.map((p) => {
                      const id = p.id;
                      
                      // La lógica para construir el texto es la misma
                      const nombreCompleto = p.Usuario 
                          ? `${p.Usuario.apellido}, ${p.Usuario.nombre}` 
                          : `Personal N° ${id}`;
                          
                      const identificador = p.legajo || p.rol || p.cargo;
                      const detalle = identificador ? ` (${identificador})` : '';

                      // Comprueba si el ID actual está en el array de seleccionados
                      const isSelected = formData.integrantesCE.includes(id);

                      return (
                          <div
                              key={id}
                              // Usamos la nueva clase SCSS para el estilo de lista (Ver Solución 3 en la respuesta anterior)
                              className={`nuevo-grupo__list-option ${isSelected ? 'nuevo-grupo__list-option--selected' : ''}`}
                              // Manejador: Llama a la nueva función de toggle al hacer click
                              onClick={() => handleToggleIntegrantes(id)}
                          >
                              {nombreCompleto}{detalle}
                          </div>
                    );
                    })}
                </div>
            </div>
          </div>
        </div>
        {/* ... dentro de renderPaso2 ... */}
      </div>
          <div className="nuevo-grupo__col">
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <label className="nuevo-grupo__label">Organigrama </label> {/* Agregué el asterisco rojo si es obligatorio */}
      
                  <div className={`nuevo-grupo__upload-area ${formData.organigramaFile ? 'nuevo-grupo__upload-area--active' : ''}`}>
                    <input 
                      id="organigramaFile" 
                      type="file" 
                      className="nuevo-grupo__file-input" // Clase para ocultarlo
                      onChange={handleFileChange} 
                      accept=".pdf,.jpg,.png,.doc,.docx" // Opcional: limita tipos de archivo
                    />
                      <label htmlFor="organigramaFile" className="nuevo-grupo__upload-label">
                        {formData.organigramaFile ? (
                          // VISTA CUANDO HAY ARCHIVO SELECCIONADO
                          <>
                            <svg className="nuevo-grupo__upload-icon nuevo-grupo__upload-icon--success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="nuevo-grupo__filename">{formData.organigramaFile.name}</span>
                            <span className="nuevo-grupo__upload-text">Clic para cambiar archivo</span>
                          </>
                        ) : (
                          // VISTA POR DEFECTO (VACÍO)
                          <>
                            <svg className="nuevo-grupo__upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="nuevo-grupo__upload-title">Subir Organigrama</span>
                            <span className="nuevo-grupo__upload-text">PDF, Word o Imagen</span>
                          </>
                        )}
                      </label>
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