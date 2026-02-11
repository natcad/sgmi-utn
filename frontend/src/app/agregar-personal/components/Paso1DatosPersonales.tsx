"use client";

import { useFormContext } from "react-hook-form";
import { PersonalFormValues } from "@/schemas/Personal/personal.schema";

interface Paso1DatosPersonalesProps {
  fotoPerfilPreview: string | null;
  eliminarFotoPerfil: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEliminarFoto: () => void;
}

export const Paso1DatosPersonales: React.FC<Paso1DatosPersonalesProps> = ({
  fotoPerfilPreview,
  eliminarFotoPerfil,
  onFileChange,
  onEliminarFoto,
}) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<PersonalFormValues>();

  return (
    <div className="addpersonal__form-grid">
      <h2 className="addpersonal__section-title">Datos Personales</h2>

      {/* Nombre y Apellido */}
      <div className="addpersonal__form-row">
        <div className="addpersonal__form-group">
          <label className="addpersonal__label">
            Nombre<span className="addpersonal__required">*</span>
          </label>
          <input
            className={`addpersonal__input ${
              errors.nombre ? "addpersonal__input--error" : ""
            }`}
            {...register("nombre")}
          />
          {errors.nombre && (
            <span className="addpersonal__error">{errors.nombre.message}</span>
          )}
        </div>

        <div className="addpersonal__form-group">
          <label className="addpersonal__label">
            Apellido<span className="addpersonal__required">*</span>
          </label>
          <input
            className={`addpersonal__input ${
              errors.apellido ? "addpersonal__input--error" : ""
            }`}
            {...register("apellido")}
          />
          {errors.apellido && (
            <span className="addpersonal__error">
              {errors.apellido.message}
            </span>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="addpersonal__form-group">
        <label className="addpersonal__label">
          Email institucional<span className="addpersonal__required">*</span>
        </label>
        <input
          type="email"
          className={`addpersonal__input ${
            errors.email ? "addpersonal__input--error" : ""
          }`}
          {...register("email")}
        />
        {errors.email && (
          <span className="addpersonal__error">{errors.email.message}</span>
        )}
      </div>

      {/* Teléfono y Fecha de Nacimiento */}
      <div className="addpersonal__form-row">
        <div className="addpersonal__form-group">
          <label className="addpersonal__label">Teléfono</label>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`addpersonal__input ${
              errors.telefono ? "addpersonal__input--error" : ""
            }`}
            {...register("telefono", {
              setValueAs: (v) => {
                if (v === "" || v === null || v === undefined) return undefined;
                const num = Number(v);
                return isNaN(num) ? v : num;
              },
            })}
          />
          {errors.telefono && (
            <span className="addpersonal__error">
              {errors.telefono.message}
            </span>
          )}
        </div>

        <div className="addpersonal__form-group">
          <label className="addpersonal__label">Fecha de nacimiento</label>
          <input
            type="date"
            lang="es-AR"
            className="addpersonal__input"
            {...register("fechaNacimiento")}
          />
        </div>
      </div>

      {/* Foto de Perfil */}
      <div className="addpersonal__form-group">
        <label className="addpersonal__label">Foto de perfil</label>
        <input
          name="fotoPerfil"
          type="file"
          accept="image/*"
          className="addpersonal__input"
          onChange={onFileChange}
        />
        {(fotoPerfilPreview ||
          (watch("fotoPerfil") && !eliminarFotoPerfil)) && (
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <img
              src={fotoPerfilPreview || watch("fotoPerfil") || ""}
              alt="Preview"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "50%",
                border: "2px solid #e2e8f0",
              }}
            />
            <button
              type="button"
              onClick={onEliminarFoto}
              className="addpersonal__btn-eliminar-foto"
              style={{
                width: "fit-content",
                padding: "8px 16px",
                backgroundColor: "#D64545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Eliminar imagen
            </button>
          </div>
        )}
      </div>
      <div className="addpersonal__form-row" style={{ color: "gray", textAlign:"center" }}>
        <p> Los campos con asterísticos son obligatorios</p>
      </div>
    </div>
  );
};
