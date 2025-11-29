"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import api from "@/services/api";
import { getPersonal } from "@/services/personal.api";
import { getFacultad } from "@/services/facultades.api";

import { grupoSchema, GrupoFormValues } from "@/schemas/Grupo/grupo.schema";
import { Facultad } from "@/interfaces/module/Grupos/Facultad";
import { MensajeModal } from "@/interfaces/MensajeModal";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";
export const SELECCIONAR_REGIONAL = "Seleccione una Regional";
export const SELECCIONAR_DIRECTOR = "Seleccione Director/a";
export const SELECCIONAR_VICEDIRECTOR = "Seleccione Vicedirector/a";
export const CARGANDO_PERSONAL = "Cargando personal...";

export function useNuevoGrupoForm() {
  const router = useRouter();

  const [paso, setPaso] = useState(1);
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [personal, setPersonal] = useState<PersonalResponse[]>([]);
  const [loadingFacultades, setLoadingFacultades] = useState(true);
  const [loadingPersonal, setLoadingPersonal] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [mensaje, setMensaje] = useState<MensajeModal | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const formMethods = useForm<GrupoFormValues>({
    resolver: zodResolver(grupoSchema),
    defaultValues: {
      facultadRegional: "",
      nombre: "",
      correo: "",
      siglas: "",
      objetivo: "",
      director: undefined,
      vicedirector: undefined,
      integrantesCE: [],
      organigramaFile: undefined,
    },
  });
  const { trigger, setValue, setError, getValues } = formMethods;

  useEffect(() => {
    const fetchData = async () => {
      setLoadingFacultades(true);
      setLoadingPersonal(true);

      try {
        const facultadesData = await getFacultad();
        setFacultades(facultadesData || []);
      } catch (err) {
        console.error(err);
        setMensaje({
          tipo: "error",
          mensaje: "Error al cargar las facultades regionales.",
        });
      } finally {
        setLoadingFacultades(false);
      }
      try {
        const personalData = await getPersonal();
        setPersonal(personalData || []);
      } catch (err) {
        console.error(err);
        setMensaje((prev) => ({
          tipo: "error",
          mensaje: (prev?.mensaje || "") + "Error al cargar el personal.",
        }));
      } finally {
        setLoadingPersonal(false);
      }
    };
    fetchData();
  }, []);

  const handleContinuar = async () => {
    const esValido = await trigger([
      "facultadRegional",
      "nombre",
      "correo",
      "siglas",
      "objetivo",
    ]);
    if (!esValido) {
      setPaso(1);
      return;
    }

    const correo = getValues("correo");

    try {
      const res = await api.get("/grupos/validar-correo", {
        params: { correo },
      });

      const disponible = res.data?.disponible;

      if (!disponible) {
        setError("correo", {
          type: "unique",
          message: "Ya existe un grupo con ese correo institucional.",
        });
        setPaso(1);
        return;
      }
    } catch (error) {
      console.error("Error al validar correo de grupo:", error);
      return;
    }

    setPaso(2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setValue("organigramaFile", files);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setValue("organigramaFile", undefined);
      setPreviewUrl(null);
    }
  };

  const onSubmit = async (values: GrupoFormValues) => {
    setLoadingSubmit(true);
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("siglas", values.siglas);
      formDataToSend.append("nombre", values.nombre);
      formDataToSend.append("idfacultadRegional", values.facultadRegional);
      formDataToSend.append("correo", values.correo);
      formDataToSend.append("objetivo", values.objetivo);

      if (values.director) {
        formDataToSend.append("director", String(values.director));
      }
      if (values.vicedirector) {
        formDataToSend.append("vicedirector", String(values.vicedirector));
      }
      const current = (values.integrantesCE ?? []) as number[];

      const autoridadesIds = [values.director, values.vicedirector]
        .filter(Boolean)
        .map((id) => Number(id))
        .filter((id) => !Number.isNaN(id));

      const integrantesFinal = Array.from(
        new Set([...current, ...autoridadesIds])
      );

      formDataToSend.append("integrantesCE", JSON.stringify(integrantesFinal));

      const fileList = values.organigramaFile as FileList | undefined;
      if (fileList && fileList[0]) {
        formDataToSend.append("organigrama", fileList[0]);
      }

      await api.post("/grupos", formDataToSend);

      setMensaje({
        tipo: "exito",
        mensaje: "Grupo de investigación creado exitosamente.",
      });

      setTimeout(() => {
        router.push("/grupos");
      }, 2000);
    } catch (error) {
      console.error("Error al crear grupo:", error);
      let msgError = "Ocurrió un error al crear el grupo.";
      interface ApiErrorResponse {
        message?: string;
      }

      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        msgError = error.response?.data?.message ?? msgError;
      }

      setMensaje({ tipo: "error", mensaje: msgError });
    } finally {
      setLoadingSubmit(false);
    }
  };
  const handleCloseModal = () => setMensaje(null);

  return {
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
  };
}
