"use client";

import { useState, JSX, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import ModalMensaje from "@/components/ModalMensaje";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import { AxiosError } from "axios";

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

export default function AddPersonal(): JSX.Element {
  const router = useRouter();
  const { usuario } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [modal, setModal] = useState<MensajeModal | null>(null);
  const [grupos, setGrupos] = useState<{ id: number; nombre: string }[]>([]);

  const [formData, setFormData] = useState<FormAddPersonal & { grupoId?: number }>({
    nombre: "",
    apellido: "",
    email: "",
    horasSemanales: "",
    rol: "",
    fechaVencimientoIncentivo: "",
    grupoId: undefined,
  });

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

  const handleHorasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) value = value.slice(0, 2) + ":" + value.slice(2);
    setFormData((prev) => ({ ...prev, horasSemanales: value }));
  };

  // Cargar grupos
  useEffect(() => {
    async function fetchGrupos() {
      try {
        const res = await api.get("/grupos"); // Ajustar endpoint
        setGrupos(res.data);
      } catch (error) {
        console.error("Error cargando grupos:", error);
      }
    }
    fetchGrupos();
  }, []);

  // Cargar datos si es edición
  useEffect(() => {
    if (!id) return;

    async function fetchPersonal() {
      try {
        const res = await api.get(`/personal/${id}`);
        const data = res.data;

        setFormData({
          nombre: data.Usuario.nombre,
          apellido: data.Usuario.apellido,
          email: data.Usuario.email,
          horasSemanales: data.horasSemanales
            ? `${Math.floor(data.horasSemanales)}:${Math.round((data.horasSemanales % 1) * 60)
                .toString()
                .padStart(2, "0")}`
            : "",
          rol: data.rol,
          categoriaUTN: data.categoriaUTN ?? "",
          dedicacion: data.dedicacion ?? "",
          estadoIncentivo: data.ProgramaIncentivo?.estado ?? "",
          fechaVencimientoIncentivo: data.ProgramaIncentivo?.fechaVencimiento ?? "",
          tipoFormacion: data.tipoFormacion ?? "",
          fuenteOrganismo: data.fuentesDeFinanciamiento?.[0]?.organismo ?? "",
          fuenteMonto: data.fuentesDeFinanciamiento?.[0]?.monto ?? 0,
          grupoId: data.grupo?.id ?? undefined,
        });
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

      const payload = buildPayload(
        { ...formData, incentivoId },
        usuario.id,
        Number(formData.grupoId) // Asegurarse de que sea número
      );

      let response;
      if (id) {
        response = await api.put(`/personal/${id}`, payload);
      } else {
        response = await api.post("/personal", payload);
      }

      if (response.status === 200 || response.status === 201) {
        router.push("/personal");
        setModal({
          tipo: "exito",
          mensaje: id ? "¡Actualizado con éxito!" : "¡Agregado con éxito!",
        });
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string }>;
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
          {/* Nombre y Apellido */}
          <div className="addpersonal__form-row">
            <div className="addpersonal__form-group">
              <label className="addpersonal__label">
                Nombre<span className="addpersonal__required">*</span>
              </label>
              <input name="nombre" className="addpersonal__input" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="addpersonal__form-group">
              <label className="addpersonal__label">
                Apellido<span className="addpersonal__required">*</span>
              </label>
              <input name="apellido" className="addpersonal__input" value={formData.apellido} onChange={handleChange} required />
            </div>
          </div>

          {/* Email y Horas */}
          <div className="addpersonal__form-row">
            <div className="addpersonal__form-group">
              <label className="addpersonal__label">
                Email institucional<span className="addpersonal__required">*</span>
              </label>
              <input name="email" type="email" className="addpersonal__input" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="addpersonal__form-group">
              <label className="addpersonal__label">
                Horas semanales<span className="addpersonal__required">*</span>
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

          {/* Grupo */}
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
              >
                <option value="">Seleccionar…</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rol */}
          <div className="addpersonal__form-group">
            <label className="addpersonal__label">
              Rol<span className="addpersonal__required">*</span>
            </label>
            <div className="addpersonal__select-wrapper">
              <select name="rol" className="addpersonal__select" value={formData.rol} onChange={handleChange} required>
                <option value="">Seleccionar…</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sección Investigador */}
          {formData.rol === "Investigador" && (
            <div className="addpersonal__section">
              <div className="addpersonal__form-row">
                <div className="addpersonal__form-group">
                  <label className="addpersonal__label">Categoría UTN<span className="addpersonal__required">*</span></label>
                  <select name="categoriaUTN" className="addpersonal__select" value={formData.categoriaUTN ?? ""} onChange={handleChange} required>
                    <option value="">Seleccionar…</option>
                    {categorias.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="addpersonal__form-group">
                  <label className="addpersonal__label">Dedicación<span className="addpersonal__required">*</span></label>
                  <select name="dedicacion" className="addpersonal__select" value={formData.dedicacion ?? ""} onChange={handleChange} required>
                    <option value="">Seleccionar…</option>
                    {dedicaciones.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="addpersonal__form-group">
                  <label className="addpersonal__label">Estado Incentivo<span className="addpersonal__required">*</span></label>
                  <select name="estadoIncentivo" className="addpersonal__select" value={formData.estadoIncentivo ?? ""} onChange={handleChange} required>
                    <option value="">Seleccionar…</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="addpersonal__form-group">
                  <label className="addpersonal__label">Fecha vencimiento<span className="addpersonal__required">*</span></label>
                  <input type="date" name="fechaVencimientoIncentivo" className="addpersonal__input" value={formData.fechaVencimientoIncentivo ?? ""} onChange={handleChange} disabled={formData.estadoIncentivo !== "Activo"} required={formData.estadoIncentivo === "Activo"} />
                </div>
              </div>
            </div>
          )}

          {/* Sección Personal en Formación */}
          {formData.rol === "Personal en Formación" && (
            <div className="addpersonal__section">
              <div className="addpersonal__form-group">
                <label className="addpersonal__label">Tipo de formación<span className="addpersonal__required">*</span></label>
                <select name="tipoFormacion" className="addpersonal__select" value={formData.tipoFormacion ?? ""} onChange={handleChange} required>
                  <option value="">Seleccionar…</option>
                  {tiposFormacion.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {formData.tipoFormacion === "Doctorado" && (
                <div className="addpersonal__form-row">
                  <div className="addpersonal__form-group">
                    <label className="addpersonal__label">Monto<span className="addpersonal__required">*</span></label>
                    <div className="addpersonal__input-prefix">
                      <span className="prefix">$</span>
                      <input name="fuenteMonto" type="number" className="addpersonal__input" value={formData.fuenteMonto ?? ""} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="addpersonal__form-group">
                    <label className="addpersonal__label">Organismo<span className="addpersonal__required">*</span></label>
                    <input name="fuenteOrganismo" className="addpersonal__input" value={formData.fuenteOrganismo ?? ""} onChange={handleChange} required />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="addpersonal__button-group">
            <button type="button" className="addpersonal__btn-cancel" onClick={() => router.push("/personal")}>Cancelar</button>
            <button type="submit" className="addpersonal__btn-confirm">{id ? "Actualizar" : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
