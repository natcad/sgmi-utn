"use client";

import { useFormContext } from "react-hook-form";
import { Facultad } from "@/interfaces/module/Grupos/Facultad";
import { GrupoFormValues } from "@/schemas/Grupo/grupo.schema";
import { SELECCIONAR_REGIONAL } from "@/hooks/useNuevoGrupoForm"; 

interface Paso1DatosBasicosProps {
  facultades: Facultad[];
  loadingFacultades: boolean;
  onContinuar: () => void;
}

export const Paso1DatosBasicos: React.FC<Paso1DatosBasicosProps> = ({
  facultades,
  loadingFacultades,
  onContinuar,
}) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<GrupoFormValues>();

  const objetivoValue = watch("objetivo") || "";

  return (
    <div className="nuevo-grupo__form-grid">
      <h2 className="nuevo-grupo__subtitulo">Datos Básicos</h2>

      {/* Facultad */}
      <div>
        <label className="nuevo-grupo__label">Facultad Regional</label>
        <select
          disabled={loadingFacultades}
          className={`nuevo-grupo__select ${
            errors.facultadRegional ? "nuevo-grupo__select--error" : ""
          }`}
          {...register("facultadRegional")}
        >
          <option value="">
            {loadingFacultades ? "Cargando..." : SELECCIONAR_REGIONAL}
          </option>
          {facultades.map((fac) => (
            <option key={fac.id} value={fac.id}>
              {fac.nombre}
            </option>
          ))}
        </select>
        {errors.facultadRegional && (
          <p className="nuevo-grupo__error-text">
            {errors.facultadRegional.message}
          </p>
        )}
      </div>

      {/* Nombre */}
      <div>
        <label className="nuevo-grupo__label">Nombre del Grupo</label>
        <input
          type="text"
          className={`nuevo-grupo__input ${
            errors.nombre ? "nuevo-grupo__input--error" : ""
          }`}
          {...register("nombre")}
        />
        {errors.nombre && (
          <p className="nuevo-grupo__error-text">
            {errors.nombre.message}
          </p>
        )}
      </div>

      {/* Correo y Siglas */}
      <div className="nuevo-grupo__row">
        <div className="nuevo-grupo__col">
          <label className="nuevo-grupo__label">
            Correo Institucional
          </label>
          <input
            type="email"
            className={`nuevo-grupo__input ${
              errors.correo ? "nuevo-grupo__input--error" : ""
            }`}
            {...register("correo")}
          />
          {errors.correo && (
            <p className="nuevo-grupo__error-text">
              {errors.correo.message}
            </p>
          )}
        </div>
        <div
          className="nuevo-grupo__col"
          style={{ flex: "0 0 33%" }}
        >
          <label className="nuevo-grupo__label">Siglas</label>
          <input
            type="text"
            className={`nuevo-grupo__input ${
              errors.siglas ? "nuevo-grupo__input--error" : ""
            }`}
            {...register("siglas")}
          />
          {errors.siglas && (
            <p className="nuevo-grupo__error-text">
              {errors.siglas.message}
            </p>
          )}
        </div>
      </div>

      {/* Objetivo */}
      <div>
        <label className="nuevo-grupo__label">Objetivo</label>
        <textarea
          rows={4}
          className={`nuevo-grupo__textarea ${
            errors.objetivo ? "nuevo-grupo__textarea--error" : ""
          }`}
          {...register("objetivo")}
        />
        <div className="nuevo-grupo__char-count">
          {objetivoValue.length}/200
        </div>
        {errors.objetivo && (
          <p className="nuevo-grupo__error-text">
            {errors.objetivo.message}
          </p>
        )}
      </div>

      {/* Botón continuar */}
      <div className="nuevo-grupo__actions">
        <button
          type="button"
          onClick={onContinuar}
          className="nuevo-grupo__btn nuevo-grupo__btn--primary"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
