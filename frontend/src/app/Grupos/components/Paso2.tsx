// components/grupos/NuevoGrupoForm/Paso2Autoridades.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { GrupoFormValues } from "@/schemas/Grupo/grupo.schema";
import {
  CARGANDO_PERSONAL,
  SELECCIONAR_DIRECTOR,
  SELECCIONAR_VICEDIRECTOR,
} from "@/hooks/useNuevoGrupoForm";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";
import { useEffect } from "react";

interface Paso2AutoridadesProps {
  personal: PersonalResponse[];
  loadingPersonal: boolean;
  pasoAnterior: () => void;
  previewUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loadingSubmit: boolean;
  onOmitir: () => void;   
}

export const Paso2Autoridades: React.FC<Paso2AutoridadesProps> = ({
  personal,
  loadingPersonal,
  pasoAnterior,
  previewUrl,
  onFileChange,
  loadingSubmit,
  onOmitir
}) => {
  const {
    register,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<GrupoFormValues>();
  const directorValue = watch("director");
  const vicedirectorValue = watch("vicedirector");

  const integrantesSeleccionados =
    (getValues("integrantesCE") as number[] | null | undefined) ?? [];

  useEffect(() => {
    const current =
      (getValues("integrantesCE") as number[] | null | undefined) ?? [];

    const autoridadesIds = [directorValue, vicedirectorValue]
      .filter(Boolean)
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));

    if (autoridadesIds.length === 0) return;

    const merged = Array.from(new Set([...current, ...autoridadesIds]));

    setValue("integrantesCE", merged, { shouldValidate: true });
  }, [directorValue, vicedirectorValue, getValues, setValue]);

  const handleToggleIntegrantes = (idToToggle: number) => {
    const directorId = directorValue ? Number(directorValue) : null;
    const viceId = vicedirectorValue ? Number(vicedirectorValue) : null;

    const esAutoridad =
      (directorId !== null && idToToggle === directorId) ||
      (viceId !== null && idToToggle === viceId);

    if (esAutoridad) return;

    const current =
      (getValues("integrantesCE") as number[] | null | undefined) ?? [];

    const yaExiste = current.includes(idToToggle);

    const actualizados = yaExiste
      ? current.filter((id) => id !== idToToggle)
      : [...current, idToToggle];

    setValue("integrantesCE", actualizados, {
      shouldValidate: true,
    });
  };

  return (
    <div className="nuevo-grupo__form-grid">
      <h2 className="nuevo-grupo__subtitulo">Autoridades</h2>

      <div className="nuevo-grupo__row">
        <div className="nuevo-grupo__col">
          {/* Director */}
          <div>
            <label className="nuevo-grupo__label">Director/a</label>
            <select
              disabled={loadingPersonal}
              className={`nuevo-grupo__select ${
                errors.director ? "nuevo-grupo__select--error" : ""
              }`}
              {...register("director")}
            >
              <option value="">
                {loadingPersonal ? CARGANDO_PERSONAL : SELECCIONAR_DIRECTOR}
              </option>
              {personal.map((p) => {
                const nombreCompleto = p.Usuario
                  ? `${p.Usuario.apellido}, ${p.Usuario.nombre}`
                  : `Personal N° ${p.id}`;
                const identificador =
                  p.usuarioId || p.rol || p.nivelDeFormacion;
                const detalle = identificador ? ` (${identificador})` : "";
                return (
                  <option key={p.id} value={p.id}>
                    {nombreCompleto}
                    {detalle}
                  </option>
                );
              })}
            </select>
            {errors.director && (
              <p className="nuevo-grupo__error-text">
                {errors.director.message}
              </p>
            )}
          </div>

          {/* Vicedirector */}
          <div>
            <label className="nuevo-grupo__label">Vicedirector/a</label>
            <select
              disabled={loadingPersonal}
              className={`nuevo-grupo__select ${
                errors.vicedirector ? "nuevo-grupo__select--error" : ""
              }`}
              {...register("vicedirector")}
            >
              <option value="">
                {loadingPersonal ? CARGANDO_PERSONAL : SELECCIONAR_VICEDIRECTOR}
              </option>
              {personal.map((p) => {
                const nombreCompleto = p.Usuario
                  ? `${p.Usuario.apellido}, ${p.Usuario.nombre}`
                  : `Personal N° ${p.id}`;
                const identificador =
                  p.usuarioId || p.rol || p.nivelDeFormacion;
                const detalle = identificador ? ` (${identificador})` : "";
                return (
                  <option key={p.id} value={p.id}>
                    {nombreCompleto}
                    {detalle}
                  </option>
                );
              })}
            </select>
            {errors.vicedirector && (
              <p className="nuevo-grupo__error-text">
                {errors.vicedirector.message}
              </p>
            )}
          </div>

          {/* Integrantes CE */}
          <div>
            <label className="nuevo-grupo__label">
              Integrantes Consejo Ejecutivo
            </label>
            <div
              className="nuevo-grupo__select nuevo-grupo__select--multiple"
              style={{ height: "150px", overflowY: "auto" }}
            >
              {personal.map((p) => {
                const id = p.id as number;
                const nombreCompleto = p.Usuario
                  ? `${p.Usuario.apellido}, ${p.Usuario.nombre}`
                  : `Personal N° ${id}`;
                const identificador =
                  p.usuarioId || p.rol || p.nivelDeFormacion;
                const detalle = identificador ? ` (${identificador})` : "";

                const isSelected = integrantesSeleccionados.includes(id);

                return (
                  <div
                    key={id}
                    className={`nuevo-grupo__list-option ${
                      isSelected ? "nuevo-grupo__list-option--selected" : ""
                    }`}
                    onClick={() => handleToggleIntegrantes(id)}
                  >
                    {nombreCompleto}
                    {detalle}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Organigrama */}
        <div className="nuevo-grupo__col">
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <label className="nuevo-grupo__label">Organigrama</label>
            <div
              className={`nuevo-grupo__upload-area ${
                previewUrl ? "nuevo-grupo__upload-area--active" : ""
              }`}
            >
              <input
                id="organigramaFile"
                type="file"
                className="nuevo-grupo__file-input"
                accept=".pdf,.jpg,.png,.doc,.docx"
                onChange={onFileChange}
              />
              <label
                htmlFor="organigramaFile"
                className="nuevo-grupo__upload-label"
              >
                {previewUrl ? (
                  <>
                    <svg
                      className="nuevo-grupo__upload-icon nuevo-grupo__upload-icon--success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="nuevo-grupo__filename">
                      Archivo seleccionado
                    </span>
                    <span className="nuevo-grupo__upload-text">
                      Clic para cambiar archivo
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      className="nuevo-grupo__upload-icon"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="nuevo-grupo__upload-title">
                      Subir Organigrama
                    </span>
                    <span className="nuevo-grupo__upload-text">
                      PDF, Word o Imagen
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="nuevo-grupo__actions nuevo-grupo__actions--between">
        <button
          type="button"
          onClick={pasoAnterior}
          className="nuevo-grupo__btn nuevo-grupo__btn--secondary"
        >
          Atrás
        </button>

        <div className="nuevo-grupo__actions">
          <button
            type="button"
            onClick={onOmitir}
            disabled={loadingSubmit}
            className="nuevo-grupo__btn nuevo-grupo__btn--ghost"
          >
            Omitir este paso
          </button>
          <button
            type="submit"
            disabled={loadingSubmit}
            className="nuevo-grupo__btn nuevo-grupo__btn--primary"
          >
            {loadingSubmit ? "Guardando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};
