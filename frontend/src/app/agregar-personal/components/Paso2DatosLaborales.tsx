"use client";

import { useFormContext } from "react-hook-form";
import { PersonalFormValues } from "@/schemas/Personal/personal.schema";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";

interface Paso2DatosLaboralesProps {
  grupos: Grupo[];
  loadingGrupos: boolean;
  soloGrupo?: boolean;
}

export const Paso2DatosLaborales: React.FC<Paso2DatosLaboralesProps> = ({
  grupos,
  loadingGrupos,
  soloGrupo = false,
}) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<PersonalFormValues>();

  const rol = watch("rol");
  const tipoFormacion = watch("tipoFormacion");
  const estadoIncentivo = watch("estadoIncentivo");

  return (
    <div className="addpersonal__form-grid">
      <h2 className="addpersonal__section-title">Datos Laborales</h2>

      {/* Grupo y Horas Semanales */}
      <div className="addpersonal__form-row">
        <div className="addpersonal__form-group">
          <label className="addpersonal__label">
            Grupo<span className="addpersonal__required">*</span>
          </label>
          <div className="addpersonal__select-wrapper">
            <select
              className={`addpersonal__select ${
                errors.grupoId ? "addpersonal__select--error" : ""
              }`}
              disabled={loadingGrupos || soloGrupo}
              {...register("grupoId")}
            >
              <option value="">
                {loadingGrupos ? "Cargando..." : "Seleccionar…"}
              </option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre} ({g.siglas})
                </option>
              ))}
            </select>
          </div>
          {errors.grupoId && (
            <span className="addpersonal__error">{errors.grupoId.message}</span>
          )}
        </div>

        <div className="addpersonal__form-group">
          <label className="addpersonal__label">
            Horas semanales<span className="addpersonal__required">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="HH"
            className={`addpersonal__input ${
              errors.horasSemanales ? "addpersonal__input--error" : ""
            }`}
            {...register("horasSemanales", {
              setValueAs: (v) => {
                if (v === "" || v === null || v === undefined) return "";
                const num = Number(v);
                return isNaN(num) ? v : String(Math.round(num));
              },
            })}
          />
          {errors.horasSemanales && (
            <span className="addpersonal__error">
              {errors.horasSemanales.message}
            </span>
          )}
        </div>
      </div>

      {/* Rol */}
      <div className="addpersonal__form-group">
        <label className="addpersonal__label">
          Rol<span className="addpersonal__required">*</span>
        </label>
        <div className="addpersonal__select-wrapper">
          <select
            className={`addpersonal__select ${
              errors.rol ? "addpersonal__select--error" : ""
            }`}
            {...register("rol")}
          >
            <option value="">Seleccionar…</option>
            <option value="Personal Profesional">Personal Profesional</option>
            <option value="Personal Técnico">Personal Técnico</option>
            <option value="Personal Administrativo">
              Personal Administrativo
            </option>
            <option value="Personal de Apoyo">Personal de Apoyo</option>
            <option value="Investigador">Investigador</option>
            <option value="Personal en Formación">Personal en Formación</option>
          </select>
        </div>
        {errors.rol && (
          <span className="addpersonal__error">{errors.rol.message}</span>
        )}
      </div>

      {/* Campos condicionales para Investigador */}
      {rol === "Investigador" && (
        <div className="addpersonal__section">
          <h3 className="addpersonal__subsection-title">
            Datos de Investigador
          </h3>

          <div className="addpersonal__form-row">
            <div className="addpersonal__form-group">
              <label className="addpersonal__label">
                Categoría UTN<span className="addpersonal__required">*</span>
              </label>
              <select
                className={`addpersonal__select ${
                  errors.categoriaUTN ? "addpersonal__select--error" : ""
                }`}
                {...register("categoriaUTN")}
              >
                <option value="">Seleccionar…</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
              </select>
              {errors.categoriaUTN && (
                <span className="addpersonal__error">
                  {errors.categoriaUTN.message}
                </span>
              )}
            </div>

            <div className="addpersonal__form-group">
              <label className="addpersonal__label">
                Dedicación<span className="addpersonal__required">*</span>
              </label>
              <select
                className={`addpersonal__select ${
                  errors.dedicacion ? "addpersonal__select--error" : ""
                }`}
                {...register("dedicacion")}
              >
                <option value="">Seleccionar…</option>
                <option value="Simple">Simple</option>
                <option value="Semiexclusiva">Semiexclusiva</option>
                <option value="Exclusiva">Exclusiva</option>
              </select>
              {errors.dedicacion && (
                <span className="addpersonal__error">
                  {errors.dedicacion.message}
                </span>
              )}
            </div>
          </div>

          <div className="addpersonal__form-row">
            <div className="addpersonal__form-group">
              <label className="addpersonal__label">
                Estado Incentivo<span className="addpersonal__required">*</span>
              </label>
              <select
                className={`addpersonal__select ${
                  errors.estadoIncentivo ? "addpersonal__select--error" : ""
                }`}
                {...register("estadoIncentivo")}
              >
                <option value="">Seleccionar…</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {errors.estadoIncentivo && (
                <span className="addpersonal__error">
                  {errors.estadoIncentivo.message}
                </span>
              )}
            </div>

            <div className="addpersonal__form-group">
              <label className="addpersonal__label">
                Fecha vencimiento
                {estadoIncentivo === "Activo" && (
                  <span className="addpersonal__required">*</span>
                )}
              </label>
              <input
                type="date"
                lang="es-AR"
                className={`addpersonal__input ${
                  errors.fechaVencimientoIncentivo
                    ? "addpersonal__input--error"
                    : ""
                }`}
                disabled={estadoIncentivo !== "Activo"}
                {...register("fechaVencimientoIncentivo")}
              />
              {errors.fechaVencimientoIncentivo && (
                <span className="addpersonal__error">
                  {errors.fechaVencimientoIncentivo.message}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campos condicionales para Personal en Formación */}
      {rol === "Personal en Formación" && (
        <div className="addpersonal__section">
          <h3 className="addpersonal__subsection-title">Datos de Formación</h3>

          <div className="addpersonal__form-group">
            <label className="addpersonal__label">
              Tipo de formación<span className="addpersonal__required">*</span>
            </label>
            <select
              className={`addpersonal__select ${
                errors.tipoFormacion ? "addpersonal__select--error" : ""
              }`}
              {...register("tipoFormacion")}
            >
              <option value="">Seleccionar…</option>
              <option value="Doctorado">Doctorado</option>
              <option value="Maestría/ Especialización">
                Maestría/ Especialización
              </option>
              <option value="Becario Graduado">Becario Graduado</option>
              <option value="Becario Alumno">Becario Alumno</option>
              <option value="Pasante">Pasante</option>
              <option value="Tesis">Tesis</option>
            </select>
            {errors.tipoFormacion && (
              <span className="addpersonal__error">
                {errors.tipoFormacion.message}
              </span>
            )}
          </div>

          {tipoFormacion === "Doctorado" && (
            <div className="addpersonal__form-row">
              <div className="addpersonal__form-group">
                <label className="addpersonal__label">
                  Organismo<span className="addpersonal__required">*</span>
                </label>
                <input
                  className={`addpersonal__input ${
                    errors.fuenteOrganismo ? "addpersonal__input--error" : ""
                  }`}
                  {...register("fuenteOrganismo")}
                />
                {errors.fuenteOrganismo && (
                  <span className="addpersonal__error">
                    {errors.fuenteOrganismo.message}
                  </span>
                )}
              </div>

              <div className="addpersonal__form-group">
                <label className="addpersonal__label">
                  Financiamiento<span className="addpersonal__required">*</span>
                </label>
                <div className="addpersonal__input-prefix">
                  <span className="prefix">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={`addpersonal__input ${
                      errors.fuenteMonto ? "addpersonal__input--error" : ""
                    }`}
                    {...register("fuenteMonto", {
                      setValueAs: (v) => {
                        if (v === "" || v === null || v === undefined)
                          return undefined;
                        const num = Number(v);
                        return isNaN(num) ? undefined : num;
                      },
                    })}
                  />
                </div>
                {errors.fuenteMonto && (
                  <span className="addpersonal__error">
                    {errors.fuenteMonto.message}
                  </span>
                )}
              </div>
            </div>
          )}
          <div
            className="addpersonal__form-row"
            style={{ color: "gray", textAlign: "center" }}
          >
            <p> Los campos con asterísticos son obligatorios</p>
          </div>
        </div>
      )}
    </div>
  );
};
