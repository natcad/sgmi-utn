"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { AxiosError } from "axios";
import ModalMensaje from "@/components/ModalMensaje";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";

interface FormData {
  rol: string;
  horasSemanales: string;
  nombre: string;
  apellido: string;
  formacion?: string;
  financiamento?: string;
}

export default function AddPersonal() {
  const [modal, setModal] = useState<MensajeModal | null>(null);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    rol: "Personal Profesional",
    horasSemanales: "",
    nombre: "",
    apellido: "",
    formacion:"Doctorado",
    financiamento:""
  });

  const isBecario = formData.rol === "Becario y/o Personal en Formación";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const respuesta = await api.post("/Personal/");
      if (respuesta.status === 200) {
        mostrarExito();
        setTimeout(() => {
          router.push("/personal");
        }, 2500);
      }
    } catch (err) {
      const axiosError = err as AxiosError<{
        error?: string;
        message?: string;
      }>;
      const mensajeError =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        "Intente nuevamente";
      mostrarError(mensajeError);
    }
  };

  const mostrarExito = () => {
    setModal({
      tipo: "exito",
      mensaje: "Agregado con Exito",
    });
  };

 const mostrarError = (error: string) => {
    setModal({
      tipo: "error",
      mensaje: `No hemos podido realizar la operación. <br/>${error}`,
    });
  };

  return (
    <div className="addpersonal">
      <h1 className="addpersonal__title">Agregar Integrante</h1>

      <div className="addpersonal__container">
        <form className="addpersonal__form" onSubmit={handleSubmit}>
          <div className="addpersonal__form-row">
            <div className="addpersonal__form-group">
              <label htmlFor="rol" className="addpersonal__label">
                Rol <span className="addpersonal__required">*</span>
              </label>

              <div className="addpersonal__select-wrapper">
                <select
                  id="rol"
                  className="addpersonal__select"
                  value={formData.rol}
                  onChange={(e) =>
                    setFormData({ ...formData, rol: e.target.value })
                  }
                >
                  <option value="Personal Profesional">
                    Personal Profesional
                  </option>
                  <option value="Personal Técnico">Personal Técnico</option>
                  <option value="Personal Administrativo">
                    Personal Administrativo
                  </option>
                  <option value="Becario y/o Personal en Formación">
                    Becario y/o Personal en Formación
                  </option>
                </select>
              </div>
            </div>

            <div className="addpersonal__form-group">
              <label htmlFor="horas" className="addpersonal__label">
                Horas Semanales <span className="addpersonal__required">*</span>
              </label>

              <input
                id="horas"
                type="text"
                className="addpersonal__input"
                placeholder="hh : mm"
                value={formData.horasSemanales}
                onChange={(e) =>
                  setFormData({ ...formData, horasSemanales: e.target.value })
                }
              />
            </div>
          </div>

          <div className="addpersonal__form-row">
            <div className="addpersonal__form-group">
              <label htmlFor="nombre" className="addpersonal__label">
                Nombre <span className="addpersonal__required">*</span>
              </label>

              <input
                id="nombre"
                type="text"
                className="addpersonal__input"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
            </div>

            <div className="addpersonal__form-group">
              <label htmlFor="apellido" className="addpersonal__label">
                Apellido <span className="addpersonal__required">*</span>
              </label>

              <input
                id="apellido"
                type="text"
                className="addpersonal__input"
                value={formData.apellido}
                onChange={(e) =>
                  setFormData({ ...formData, apellido: e.target.value })
                }
              />
            </div>
          </div>

          {isBecario && (
            <>
            <div className="addpersonal__form-row">
                <div className="addpersonal__form-group">
                  <label className="addpersonal__label">
                    Tipo de Formación <span className="addpersonal__required">*</span>
                  </label>
                  <div className="addpersonal__select-wrapper">
                        <select
                        id="formacion"
                        className="addpersonal__select"
                        value={formData.formacion}
                        onChange={(e) =>
                            setFormData({ ...formData, formacion: e.target.value })
                        }
                        >
                        <option value="Doctorado">Doctorado</option>
                        <option value="Maestría / Especialización">Maestría / Especialización</option>
                        <option value="Becario Graduado">Becario Graduado</option>
                        <option value="Becario Alumnos">Becario Alumnos</option>
                        <option value="Pasante">Pasante</option>
                        <option value="Proyectos Finales y Tesinas / Tesis de Posgrado">
                            Proyectos Finales y Tesinas / Tesis de Posgrado
                        </option>
                        </select>
                    </div>
                </div>

                <div className="addpersonal__form-group">
                  <label className="addpersonal__label">
                    Fuente de Financiamento <span className="addpersonal__required">*</span>
                  </label>

                  <input
                    type="text"
                    className="addpersonal__input"
                    value={formData.financiamento || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, financiamento: e.target.value })
                    }
                  />
                </div>
              </div>
            </>
          )}

          <div className="addpersonal__button-group">
            <Link href="/personal"
              className="addpersonal__btn-cancel"
            >
               Cancelar
            </Link>

            <button type="submit" className="addpersonal__btn-confirm">
              Confirmar
            </button>
        </div>
        </form>
      </div>
    </div>
  );
}
