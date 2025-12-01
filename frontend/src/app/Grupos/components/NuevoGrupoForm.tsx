// components/grupos/NuevoGrupoForm/NuevoGrupoForm.tsx
"use client";

import React, { useEffect } from "react";
import { FormProvider } from "react-hook-form";

import { useNuevoGrupoForm } from "@/hooks/useNuevoGrupoForm";
import { Paso1DatosBasicos } from "./Paso1";
import { Paso2Autoridades } from "./Paso2";
import ModalMensaje from "@/components/ModalMensaje";

import { GrupoFormValues } from "@/schemas/Grupo/grupo.schema";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";

import "../../../styles/grupos/formulario.scss";

interface NuevoGrupoFormProps {
  modo?: "crear" | "editar";
  valoresIniciales?: Partial<GrupoFormValues>;
  idGrupo?: number;
  integrantesGrupo?: PersonalResponse[];
  startOnPaso2?: boolean; 
}

const NuevoGrupoForm: React.FC<NuevoGrupoFormProps> = ({
  modo = "crear",
  valoresIniciales,
  idGrupo,
  integrantesGrupo = [],
  startOnPaso2 = false,
}) => {
 const {
    paso,
    setPaso,
    facultades,
    loadingFacultades,
    loadingSubmit,
    mensaje,
    handleCloseModal,
    previewUrl,
    handleFileChange,
    handleContinuar,
    onSubmit,
    formMethods,
  } = useNuevoGrupoForm({ modo, valoresIniciales, idGrupo, integrantesGrupo });

  const { handleSubmit } = formMethods;

  
  useEffect(() => {
    if (modo === "editar" && startOnPaso2 && integrantesGrupo.length > 0) {
      setPaso(2);
    }
  }, [modo, startOnPaso2, integrantesGrupo.length, setPaso]);

  const mostrarPaso2 =
    modo === "editar" && integrantesGrupo.length > 0 && paso === 2;

  const handleContinuarPaso1 =
    modo === "crear"
      ? () => handleSubmit(onSubmit)()
      : handleContinuar;

  return (
    <div className="nuevo-grupo">
      <h1 className="nuevo-grupo__titulo">
        {modo === "crear"
          ? "Nuevo Grupo de Investigación"
          : "Editar Grupo de Investigación"}
      </h1>

      <FormProvider {...formMethods}>
        <form className="nuevo-grupo__card" onSubmit={handleSubmit(onSubmit)}>
          {mostrarPaso2 ? (
            <Paso2Autoridades
              personal={integrantesGrupo}
              loadingPersonal={false}
              pasoAnterior={() => setPaso(1)}
              previewUrl={previewUrl}
              onFileChange={handleFileChange}
              loadingSubmit={loadingSubmit}
              onOmitir={() => handleSubmit(onSubmit)()}
            />
          ) : (
            <Paso1DatosBasicos
              facultades={facultades}
              loadingFacultades={loadingFacultades}
              onContinuar={handleContinuarPaso1}
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
