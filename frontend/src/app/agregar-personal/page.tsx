"use client";

import { useState, JSX, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import ModalMensaje from "@/components/ModalMensaje";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import { AxiosError } from "axios";
import { mapPersonalToFormData } from "@/helpers/mapPersonalToFormData";
import {
  FormAddPersonal,
  RolPersonal,
  TipoFormacion,
  CategoriaUTN,
  Dedicacion,
  EstadoIncentivo,
  convertirHoras,
  buildPayload,
} from "@/interfaces//module/Personal/AddPersonal";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";
import { getGrupos } from "@/services/grupos.api";

export default function AddPersonal(): JSX.Element {
  const router = useRouter();
  const { usuario } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [modal, setModal] = useState<MensajeModal | null>(null);
  const grupoIdParam = searchParams.get("grupoId");

  const [grupos, setGrupos] = useState<Grupo[]>([]);

  const [formData, setFormData] = useState<
    FormAddPersonal & { grupoId?: number }
  >({
    nombre: "",
    apellido: "",
    email: "",
    horasSemanales: "",
    rol: "",
    // legajo: "",
    fechaVencimientoIncentivo: "",
    grupoId: undefined,
    telefono: "",
    fechaNacimiento: "",
    fotoPerfil: "",
  });
  const [fotoPerfilFile, setFotoPerfilFile] = useState<File | null>(null);
  const [fotoPerfilPreview, setFotoPerfilPreview] = useState<string | null>(
    null
  );
  const [eliminarFotoPerfil, setEliminarFotoPerfil] = useState<boolean>(false);

  const roles: RolPersonal[] = [
    "Personal Profesional",
    "Personal Técnico",
    "Personal Administrativo",
    "Personal de Apoyo",
    "Investigador",
    "Personal en Formación",
  ];

  const tiposFormacion: TipoFormacion[] = [
    "Doctorado",
    "Maestría/ Especialización",
    "Becario Graduado",
    "Becario Alumno",
    "Pasante",
    "Tesis",
  ];

  const categorias: CategoriaUTN[] = ["A", "B", "C", "D", "E"];
  const dedicaciones: Dedicacion[] = ["Simple", "Semiexclusiva", "Exclusiva"];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecciona un archivo de imagen");
        return;
      }
      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no debe superar los 5MB");
        return;
      }
      setFotoPerfilFile(file);
      setEliminarFotoPerfil(false); // Si se selecciona una nueva imagen, no eliminar
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPerfilPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEliminarFoto = () => {
    setFotoPerfilFile(null);
    setFotoPerfilPreview(null);
    setEliminarFotoPerfil(true);
    // Limpiar el input file
    const fileInput = document.querySelector(
      'input[name="fotoPerfil"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleHorasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) value = value.slice(0, 2) + ":" + value.slice(2);
    setFormData((prev) => ({ ...prev, horasSemanales: value }));
  };

  // Grupos hardcodeados - ya no se cargan desde el API

  useEffect(() => {
    async function fetchGrupos() {
      try {
        const res = await getGrupos();
        console.log(res);
        setGrupos(res);
      } catch (err) {
        console.error(err);
      }
    }
    fetchGrupos();
  }, []);
  //pre cargar el grupo
  // Effect para pre-cargar datos
  useEffect(() => {
    // Verificamos que estamos creando (no editando) y que hay un grupo en la URL
    if (grupoIdParam && !id && usuario) {
      setFormData((prev) => {
        // 1. Base: Siempre pre-seleccionamos el grupo
        const newData = {
          ...prev,
          grupoId: Number(grupoIdParam),
        };

        // 2. Condición: Solo autocompletamos datos personales si NO es admin
        // (Es decir, si es un investigador cargándose a sí mismo)
        if (usuario.rol !== "admin") {
          newData.nombre = usuario.nombre || "";
          newData.apellido = usuario.apellido || "";
          newData.email = usuario.email || "";
        }

        return newData;
      });
    }
  }, [grupoIdParam, usuario, id]);

  // Cargar datos si es edición
  useEffect(() => {
    if (!id) return;

    async function fetchPersonal() {
      try {
        const res = await api.get(`/personal/${id}`);
        const mappedData = mapPersonalToFormData(res.data);
        setFormData(mappedData);
        if (mappedData.fotoPerfil) {
          setFotoPerfilPreview(mappedData.fotoPerfil);
        }
        setEliminarFotoPerfil(false);
      } catch (error) {
        console.error("Error cargando personal:", error);
      }
    }

    fetchPersonal();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!usuario?.id) return alert("Usuario no autenticado");

      let incentivoId: number | null = null;

      if (formData.rol === "Investigador") {
        const incentivoRes = await api.post("/ProgramaIncentivo", {
          estado: formData.estadoIncentivo,
          fechaVencimiento: formData.fechaVencimientoIncentivo || null,
        });
        incentivoId = incentivoRes.data.id;
      }

      const formDataForPayload = {
        ...formData,
        fechaNacimiento: formData.fechaNacimiento || undefined,
        fechaVencimientoIncentivo:
          formData.fechaVencimientoIncentivo || undefined,
        incentivoId,
      };

      const payload = buildPayload(
        formDataForPayload,
        usuario.id,
        Number(formData.grupoId)
      );

      const formDataToSend = new FormData();

      if (eliminarFotoPerfil && id) {
        payload.eliminarFotoPerfil = true;
      }

      formDataToSend.append("data", JSON.stringify(payload));

      if (fotoPerfilFile) {
        formDataToSend.append("fotoPerfil", fotoPerfilFile);
      }

      let response;
      if (id) {
        response = await api.put(`/personal/${id}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await api.post("/personal", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.status === 200 || response.status === 201) {
        router.push("/personal");
        setModal({
          tipo: "exito",
          mensaje: id ? "¡Actualizado con éxito!" : "¡Agregado con éxito!",
        });
      }
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        error?: string;
      }>;
      const mensajeError =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Error al guardar. Intente nuevamente";

      setModal({ tipo: "error", mensaje: mensajeError });
    }
  };

  return (
    <div className="addpersonal">
      <h1>{id ? "Editar Personal" : "Agregar Personal"}</h1>
      <div className="addpersonal__container">
        <form onSubmit={handleSubmit} className="addpersonal__form">
          {/* -------------------- DATOS PERSONALES -------------------- */}
          <div className="addpersonal__section">
            {/* Nombre y apellido */}
            <div className="addpersonal__form-row">
              <div className="addpersonal__form-group">
                <label className="addpersonal__label">
                  Nombre<span className="addpersonal__required">*</span>
                </label>
                <input
                  name="nombre"
                  className="addpersonal__input"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="addpersonal__form-group">
                <label className="addpersonal__label">
                  Apellido<span className="addpersonal__required">*</span>
                </label>
                <input
                  name="apellido"
                  className="addpersonal__input"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Teléfono y nacimiento */}
            <div className="addpersonal__form-row">
              <div className="addpersonal__form-group">
                <label className="addpersonal__label">Teléfono</label>
                <input
                  name="telefono"
                  type="tel"
                  className="addpersonal__input"
                  value={formData.telefono ?? ""}
                  onChange={handleChange}
                />
              </div>

              <div className="addpersonal__form-group">
                <label className="addpersonal__label">
                  Fecha de nacimiento
                </label>
                <input
                  name="fechaNacimiento"
                  type="date"
                  className="addpersonal__input"
                  value={formData.fechaNacimiento ?? ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="addpersonal__form-row">
              <div className="addpersonal__form-group">
                <label className="addpersonal__label">
                  Email institucional
                  <span className="addpersonal__required">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  className="addpersonal__input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Legajo
          <div className="addpersonal__form-group">
            <label className="addpersonal__label">
              Legajo<span className="addpersonal__required">*</span>
            </label>
            <input name="legajo" type="text" className="addpersonal__input" value={formData.legajo} onChange={handleChange} required />
          </div> */}
            </div>

            {/* Foto */}
            <div className="addpersonal__form-group">
              <label className="addpersonal__label">Foto de perfil</label>
              <input
                name="fotoPerfil"
                type="file"
                accept="image/*"
                className="addpersonal__input"
                onChange={handleFileChange}
              />
              {(fotoPerfilPreview ||
                (formData.fotoPerfil && !eliminarFotoPerfil)) && (
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <img
                    src={fotoPerfilPreview || formData.fotoPerfil}
                    alt={fotoPerfilPreview ? "Preview" : "Foto actual"}
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      borderRadius: "8px",
                    }}
                  />
                  {id && (
                    <button
                      type="button"
                      onClick={handleEliminarFoto}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        width: "fit-content",
                      }}
                    >
                      Eliminar imagen
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* -------------------- INFORMACIÓN LABORAL -------------------- */}
          <div className="addpersonal__section">
            {/* Grupo y Rol */}
            <div className="addpersonal__form-row">
              <div className="addpersonal__form-group">
                <label className="addpersonal__label">
                  Grupo<span className="addpersonal__required">*</span>
                </label>
                <div className="addpersonal__select-wrapper">
                  <select
                    name="grupoId"
                    className="addpersonal__select"
                    value={formData.grupoId ?? ""}
                    onChange={handleChange}
                    required
                    disabled={!!grupoIdParam}
                    style={
                      grupoIdParam
                        ? {
                            backgroundColor: "#e9ecef",
                            cursor: "not-allowed",
                            opacity: 0.8,
                          }
                        : {}
                    }
                  >
                    <option value="">Seleccionar…</option>
                    {grupos.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nombre} ({g.siglas})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="addpersonal__form-group">
                <label className="addpersonal__label">
                  Horas semanales
                  <span className="addpersonal__required">*</span>
                </label>
                <input
                  type="text"
                  name="horasSemanales"
                  className="addpersonal__input"
                  placeholder="HH:MM"
                  maxLength={5}
                  value={formData.horasSemanales ?? ""}
                  onChange={handleHorasChange}
                  required
                />
              </div>
            </div>

            {/* Horas */}
            <div className="addpersonal__form-group">
              <label className="addpersonal__label">
                Rol<span className="addpersonal__required">*</span>
              </label>
              <div className="addpersonal__select-wrapper">
                <select
                  name="rol"
                  className="addpersonal__select"
                  value={formData.rol}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar…</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* -------------------- INVESTIGADOR -------------------- */}
          {formData.rol === "Investigador" && (
            <div className="addpersonal__section">
              <div className="addpersonal__form-row">
                <div className="addpersonal__form-group">
                  <label className="addpersonal__label">
                    Categoría UTN
                    <span className="addpersonal__required">*</span>
                  </label>
                  <select
                    name="categoriaUTN"
                    className="addpersonal__select"
                    value={formData.categoriaUTN ?? ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar…</option>
                    {categorias.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="addpersonal__form-group">
                  <label className="addpersonal__label">
                    Dedicación<span className="addpersonal__required">*</span>
                  </label>
                  <select
                    name="dedicacion"
                    className="addpersonal__select"
                    value={formData.dedicacion ?? ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar…</option>
                    {dedicaciones.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="addpersonal__form-row">
                <div className="addpersonal__form-group">
                  <label className="addpersonal__label">
                    Estado Incentivo
                    <span className="addpersonal__required">*</span>
                  </label>
                  <select
                    name="estadoIncentivo"
                    className="addpersonal__select"
                    value={formData.estadoIncentivo ?? ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar…</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="addpersonal__form-group">
                  <label className="addpersonal__label">
                    Fecha vencimiento
                    <span className="addpersonal__required">*</span>
                  </label>
                  <input
                    type="date"
                    name="fechaVencimientoIncentivo"
                    className="addpersonal__input"
                    value={formData.fechaVencimientoIncentivo ?? ""}
                    onChange={handleChange}
                    disabled={formData.estadoIncentivo !== "Activo"}
                    required={formData.estadoIncentivo === "Activo"}
                  />
                </div>
              </div>
            </div>
          )}

          {/* -------------------- PERSONAL EN FORMACIÓN -------------------- */}
          {formData.rol === "Personal en Formación" && (
            <div className="addpersonal__section">
              <div className="addpersonal__form-group">
                <label className="addpersonal__label">
                  Tipo de formación
                  <span className="addpersonal__required">*</span>
                </label>
                <select
                  name="tipoFormacion"
                  className="addpersonal__select"
                  value={formData.tipoFormacion ?? ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar…</option>
                  {tiposFormacion.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {formData.tipoFormacion === "Doctorado" && (
                <div className="addpersonal__form-row">
                  <div className="addpersonal__form-group">
                    <label className="addpersonal__label">
                      Monto<span className="addpersonal__required">*</span>
                    </label>
                    <div className="addpersonal__input-prefix">
                      <span className="prefix">$</span>
                      <input
                        name="fuenteMonto"
                        type="number"
                        className="addpersonal__input"
                        value={formData.fuenteMonto ?? ""}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="addpersonal__form-group">
                    <label className="addpersonal__label">
                      Organismo<span className="addpersonal__required">*</span>
                    </label>
                    <input
                      name="fuenteOrganismo"
                      className="addpersonal__input"
                      value={formData.fuenteOrganismo ?? ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* -------------------- BOTONES -------------------- */}
          <div className="addpersonal__button-group">
            <button
              type="button"
              className="addpersonal__btn-cancel"
              onClick={() => router.push("/personal")}
            >
              Cancelar
            </button>
            <button type="submit" className="addpersonal__btn-confirm">
              {id ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
