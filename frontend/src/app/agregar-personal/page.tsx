"use client";

import { useState, JSX } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import ModalMensaje from "@/components/ModalMensaje";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import { AxiosError } from "axios";

export type RolPersonal =
  | "Personal Profesional"
  | "Personal Técnico"
  | "Personal Administrativo"
  | "Personal de Apoyo"
  | "Investigador"
  | "Personal en Formación";

export type TipoFormacion =
  | "Doctorado"
  | "Maestría/ Especialización"
  | "Becario Graduado"
  | "Becario Alumno"
  | "Pasante"
  | "Tesis";

export type CategoriaUTN = "A" | "B" | "C" | "D" | "E";

export type Dedicacion = "Simple" | "Semiexclusiva" | "Exclusiva";

export type EstadoIncentivo = "No participa" | "Participa";

export interface FormAddPersonal {
  nombre: string;
  apellido: string;
  email: string;
  horasSemanales: string;
  rol: RolPersonal | "";
  categoriaUTN?: CategoriaUTN;
  dedicacion?: Dedicacion;
  incentivoId?: number;
  estadoIncentivo?: EstadoIncentivo;
  fechaVencimientoIncentivo?: string;
  tipoFormacion?: TipoFormacion;
  fuenteOrganismo?: string;
  fuenteMonto?: number;
}

function convertirHoras(valor: string): number {
  const [hh, mm] = valor.split(":").map(Number);
  return hh + mm / 60;
}

function buildPayload(form: FormAddPersonal, usuarioId: number, grupoId: number) {
  const horas = convertirHoras(form.horasSemanales);

  const base: any = {
    usuarioId,
    grupoId,
    nombre: form.nombre,
    apellido: form.apellido,
    email: form.email,
    horasSemanales: horas,
    rol: form.rol,
    nivelDeFormacion: form.tipoFormacion || null,
    ObjectType:
      form.rol === "Investigador"
        ? "investigador"
        : form.rol === "Personal en Formación"
        ? "en formación"
        : "personal"
  };

  if (form.rol === "Investigador") {
    base.Investigador = {
      categoriaUTN: form.categoriaUTN,
      dedicacion: form.dedicacion,
      idIncentivo: form.incentivoId ?? null
    };
  }

  if (form.rol === "Personal en Formación") {
    const fuentes = [];
    if (form.tipoFormacion === "Doctorado" && form.fuenteOrganismo && form.fuenteMonto) {
      fuentes.push({
        organismo: form.fuenteOrganismo,
        monto: form.fuenteMonto
      });
    }
    base.EnFormacion = {
      tipoFormacion: form.tipoFormacion,
      fuentesDeFinanciamiento: fuentes
    };
  }

  return base;
}

export default function AddPersonal(): JSX.Element  {
  const router = useRouter();
  const { usuario } = useAuth();
  const [modal, setModal] = useState<MensajeModal | null>(null);
  const [formData, setFormData] = useState<FormAddPersonal>({
    nombre: "",
    apellido: "",
    email: "",
    horasSemanales: "",
    rol: "",
    fechaVencimientoIncentivo: ""
  });

  const roles: RolPersonal[] = [
    "Personal Profesional",
    "Personal Técnico",
    "Personal Administrativo",
    "Personal de Apoyo",
    "Investigador",
    "Personal en Formación"
  ];

  const tiposFormacion: TipoFormacion[] = [
    "Doctorado",
    "Maestría/ Especialización",
    "Becario Graduado",
    "Becario Alumno",
    "Pasante",
    "Tesis"
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

  if (value.length >= 3) {
    value = value.slice(0, 2) + ":" + value.slice(2);
  }

  setFormData((prev) => ({
    ...prev,
    horasSemanales: value,
  }));
 };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!usuario?.id) {
        alert("Usuario no autenticado");
        return;
      }

      const usuarioId = usuario.id;

      // Grupo hardcodeado por ahora
      const grupoId = 1;

      let incentivoId = null;
       if (formData.rol === "Investigador") {
      const incentivoRes = await api.post("/ProgramaIncentivo", {
        estado: formData.estadoIncentivo,
        fechaVencimiento: formData.fechaVencimientoIncentivo ? formData.fechaVencimientoIncentivo : null
      });

      incentivoId = incentivoRes.data.id;
    }

      const payload = buildPayload({ ...formData, incentivoId }, usuarioId, grupoId);
      const response = await api.post("/Personal", payload);

      if (response.status === 200 || response.status === 201) {
        router.push("/personal");
         setModal({
          tipo: "exito",
          mensaje:
            "¡Agregado con exito!",
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
        "Intente nuevamente";
      setModal({ tipo: "error", mensaje: mensajeError });
    }
  };

  return (
    <div className="addpersonal">
      <h1>Agregar Personal</h1>
      <div className="addpersonal__container">
        <form onSubmit={handleSubmit} className="addpersonal__form">
          <div className="addpersonal__form-row">
            <div className="addpersonal__form-group">
              <label className="addpersonal__label">Nombre<span className="addpersonal__required">*</span></label>
              <input
                name="nombre"
                className="addpersonal__input"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="addpersonal__form-group">
              <label className="addpersonal__label">Apellido<span className="addpersonal__required">*</span></label>
              <input
                name="apellido"
                className="addpersonal__input"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="addpersonal__form-row">
            <div className="addpersonal__form-group">
              <label className="addpersonal__label">Email institucional<span className="addpersonal__required">*</span></label>
              <input
                name="email"
                type="email"
                className="addpersonal__input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="addpersonal__form-group">
              <label className="addpersonal__label">Horas semanales<span className="addpersonal__required">*</span></label>
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

          <div className="addpersonal__form-group">
            <label className="addpersonal__label">Rol<span className="addpersonal__required">*</span></label>
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
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.rol === "Investigador" && (
            <div className="addpersonal__section">
              <div className="addpersonal__form-row">
                <div className="addpersonal__form-group">
                  <label className="addpersonal__label">Categoría UTN<span className="addpersonal__required">*</span></label>
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
                  <label className="addpersonal__label">Dedicación<span className="addpersonal__required">*</span></label>
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
                <div className="addpersonal__form-group">
                  <label className="addpersonal__label">
                    Estado Incentivo <span className="addpersonal__required">*</span>
                  </label>
                  <select
                    name="estadoIncentivo"
                    className="addpersonal__select"
                    value={formData.estadoIncentivo ?? ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar…</option>
                    <option value="Participa">Participa</option>
                    <option value="No participa">No participa</option>
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
                    disabled={formData.estadoIncentivo !== "Participa"}
                    required={formData.estadoIncentivo === "Participa"}
                  />
                </div>
              </div>
            </div>
          )}

          {formData.rol === "Personal en Formación" && (
            <div className="addpersonal__section">
              <div className="addpersonal__form-group">
                <label className="addpersonal__label">Tipo de formación<span className="addpersonal__required">*</span></label>
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
                <>
                  <div className="addpersonal__form-row">
                    <div className="addpersonal__form-group">
                      <label className="addpersonal__label">Monto<span className="addpersonal__required">*</span></label>
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
                      <label className="addpersonal__label">Organismo<span className="addpersonal__required">*</span></label>
                      <input
                        name="fuenteOrganismo"
                        className="addpersonal__input"
                        value={formData.fuenteOrganismo ?? ""}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="addpersonal__button-group">
            <button
              type="button"
              className="addpersonal__btn-cancel"
              onClick={() => router.push("/personal")}
            >
              Cancelar
            </button>

            <button type="submit" className="addpersonal__btn-confirm">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


