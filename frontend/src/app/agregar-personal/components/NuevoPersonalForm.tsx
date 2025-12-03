"use client";

import React from "react";
import { FormProvider } from "react-hook-form";
import { useNuevoPersonalForm } from "@/hooks/useNuevoPersonalForm";
import { Paso1DatosPersonales } from "./Paso1DatosPersonales";
import { Paso2DatosLaborales } from "./Paso2DatosLaborales";
import ModalMensaje from "@/components/ModalMensaje";
import { PersonalFormValues } from "@/schemas/Personal/personal.schema";

interface NuevoPersonalFormProps {
  modo?: "crear" | "editar";
  valoresIniciales?: Partial<PersonalFormValues>;
  idPersonal?: number;
  grupoId?: number; 
}

const NuevoPersonalForm: React.FC<NuevoPersonalFormProps> = ({
  modo = "crear",
  valoresIniciales,
  idPersonal,
  grupoId,
}) => {
  const {
    paso,
    setPaso,
    grupos,
    loadingGrupos,
    loadingSubmit,
    mensaje,
    handleCloseModal,
    fotoPerfilPreview,
    eliminarFotoPerfil,
    handleFileChange,
    handleEliminarFoto,
    handleContinuar,
    onSubmit,
    formMethods,
  } = useNuevoPersonalForm({ modo, valoresIniciales, idPersonal, grupoId });

  const { handleSubmit, formState: { errors } } = formMethods;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Si estamos en el paso 1, no enviar el formulario
    if (paso === 1) {
      handleContinuar();
      return;
    }
    console.log("handleFormSubmit llamado");
    const result = await handleSubmit(onSubmit as any)(e);
    // Si hay errores de validación, mostrarlos
    if (Object.keys(errors).length > 0) {
      console.log("Errores de validación:", errors);
    }
    return result;
  };

  return (
    <div className="addpersonal">
      <h1 className="addpersonal__titulo">
        {modo === "crear" ? "Agregar Personal" : "Editar Personal"}
      </h1>

      <FormProvider {...formMethods}>
        <form
          className="addpersonal__container"
          onSubmit={handleFormSubmit}
        >
          <div className="addpersonal__form">
            {paso === 1 ? (
              <Paso1DatosPersonales
                fotoPerfilPreview={fotoPerfilPreview}
                eliminarFotoPerfil={eliminarFotoPerfil}
                onFileChange={handleFileChange}
                onEliminarFoto={handleEliminarFoto}
              />
            ) : (
              <Paso2DatosLaborales
                grupos={grupos}
                loadingGrupos={loadingGrupos}
              />
            )}

            {/* Botones de acción */}
            <div className="addpersonal__button-group">
              {paso === 1 ? (
                <>
                  <button
                    type="button"
                    className="addpersonal__btn-cancel"
                    onClick={() => window.history.back()}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="addpersonal__btn-confirm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleContinuar();
                    }}
                  >
                    Continuar
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="addpersonal__btn-cancel"
                    onClick={() => setPaso(1)}
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="addpersonal__btn-confirm"
                    disabled={loadingSubmit}
                  >
                    {loadingSubmit
                      ? "Guardando..."
                      : modo === "crear"
                      ? "Guardar"
                      : "Actualizar"}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </FormProvider>

      {mensaje && (
        <ModalMensaje
          mensaje={mensaje.mensaje}
          tipo={mensaje.tipo}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default NuevoPersonalForm;

