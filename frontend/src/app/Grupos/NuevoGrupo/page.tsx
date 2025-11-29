// components/grupos/NuevoGrupoForm/NuevoGrupoForm.tsx
"use client";

import React from "react";
import { FormProvider } from "react-hook-form";

import { useNuevoGrupoForm } from "@/hooks/useNuevoGrupoForm";
import { Paso1DatosBasicos } from "./Paso1";
import { Paso2Autoridades } from "./Paso2";
import ModalMensaje from "@/components/ModalMensaje";

import "../../../styles/grupos/formulario.scss";

const NuevoGrupoForm: React.FC = () => {
  const {
    paso,
    setPaso,
    facultades,
    personal,
    loadingFacultades,
    loadingPersonal,
    loadingSubmit,
    mensaje,
    handleCloseModal,
    previewUrl,
    handleFileChange,
    handleContinuar,
    onSubmit,
    formMethods,
  } = useNuevoGrupoForm();

    const { handleSubmit } = formMethods;

  return (
    <div className="nuevo-grupo">
      <h1 className="nuevo-grupo__titulo">Nuevo Grupo de Investigación</h1>

      <FormProvider {...formMethods}>
        <form
          className="nuevo-grupo__card"
          onSubmit={handleSubmit(onSubmit)}
        >
          {paso === 1 ? (
            <Paso1DatosBasicos
              facultades={facultades}
              loadingFacultades={loadingFacultades}
              onContinuar={handleContinuar}
            />
          ) : (
            <Paso2Autoridades
              personal={personal}
              loadingPersonal={loadingPersonal}
              pasoAnterior={() => setPaso(1)}
              previewUrl={previewUrl}
              onFileChange={handleFileChange}
              loadingSubmit={loadingSubmit}
              onOmitir={() => handleSubmit(onSubmit)()}
            />
          )}
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

export default NuevoGrupoForm;
