"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/services/api";
import { getFacultad } from "@/services/facultades.api";
import { grupoSchema, GrupoFormValues } from "@/schemas/Grupo/grupo.schema";
import { Facultad } from "@/interfaces/module/Grupos/Facultad";
import { MensajeModal } from "@/interfaces/MensajeModal";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";
export const SELECCIONAR_REGIONAL = "Seleccione una Regional";
export const SELECCIONAR_DIRECTOR = "Seleccione Director/a";
export const SELECCIONAR_VICEDIRECTOR = "Seleccione Vicedirector/a";
export const CARGANDO_PERSONAL = "Cargando personal...";
import { useAuth } from "@/context/AuthContext";
interface UseNuevoGrupoFormOptions {
  modo?: "crear" | "editar";
  valoresIniciales?: Partial<GrupoFormValues>;
  idGrupo?: number;
  integrantesGrupo?: PersonalResponse[];
  correoOriginal?: string;
}

export function useNuevoGrupoForm({
  modo = "crear",
  valoresIniciales,
  idGrupo,
  integrantesGrupo = [],
}: UseNuevoGrupoFormOptions = {}) {
  const router = useRouter();
  const { usuario } = useAuth();
  const [paso, setPaso] = useState(1);
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [loadingFacultades, setLoadingFacultades] = useState(true);
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
      ...valoresIniciales,
    },
  });
  const { trigger, setValue, setError, getValues, reset } = formMethods;
  useEffect(() => {
    if (valoresIniciales) {
      reset((prev) => ({
        ...prev,
        ...valoresIniciales,
      }));
    }
  }, [valoresIniciales, reset]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingFacultades(true);

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
    if (modo === "editar" && valoresIniciales?.correo === correo) {
      if (integrantesGrupo.length > 0) {
        setPaso(2);
        return;
      }
      await onSubmit(getValues());
      return;
    }
    try {
      const params: Record<string, string | number> = { correo };

      if (modo === "editar" && idGrupo) {
        params.idGrupo = idGrupo;
      }

      const res = await api.get("/grupos/validar-correo", {
        params,
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

    if (integrantesGrupo.length > 0) {
      setPaso(2);
    } else {
      await onSubmit(getValues());
    }
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
    if (modo === "crear") {
      const esValido = await trigger([
        "facultadRegional",
        "nombre",
        "correo",
        "siglas",
        "objetivo",
      ]);
      if (!esValido) return;

      const correo = values.correo;

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
          return;
        }
      } catch (error) {
        console.error("Error al validar correo de grupo:", error);
        return;
      }
    }

    setLoadingSubmit(true);
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("siglas", values.siglas.toUpperCase());
      formDataToSend.append("nombre", values.nombre);
      formDataToSend.append("correo", values.correo);
      formDataToSend.append("objetivo", values.objetivo);
      formDataToSend.append(
        "idFacultadRegional",
        values.facultadRegional || ""
      );
      if (values.director) {
        formDataToSend.append("idDirector", String(values.director));
      }
      if (values.vicedirector) {
        formDataToSend.append("idVicedirector", String(values.vicedirector));
      }

      if (modo === "editar" && integrantesGrupo.length > 0) {
        const current = (values.integrantesCE ?? []) as (number | string)[];

        const autoridadesIds = [values.director, values.vicedirector]
          .filter(Boolean)
          .map((id) => Number(id))
          .filter((id) => !Number.isNaN(id));
        const integrantesFinal = Array.from(
          new Set([...current.map(Number), ...autoridadesIds])
        );

        formDataToSend.append(
          "integrantesCE",
          JSON.stringify(integrantesFinal)
        );

        if (values.director) {
          formDataToSend.append("director", String(values.director));
        }
        if (values.vicedirector) {
          formDataToSend.append("vicedirector", String(values.vicedirector));
        }
      }

      const fileList = values.organigramaFile as FileList | undefined;
      if (fileList && fileList[0]) {
        formDataToSend.append("organigrama", fileList[0]);
      }

      if (modo === "crear") {
        const res = await api.post("/grupos", formDataToSend);
        const nuevoGrupo = res.data;

        setMensaje({
          tipo: "exito",
          mensaje: "Grupo de investigación creado exitosamente.",
        });
        if (usuario?.rol === "admin") {
          router.push("/grupos");
        } else {
          router.push(`/agregar-personal?grupoId=${nuevoGrupo.id}`);
        }
      } else {
        if (!idGrupo) throw new Error("Falta idGrupo para actualizar.");
        await api.put(`/grupos/${idGrupo}`, formDataToSend);
        setMensaje({
          tipo: "exito",
          mensaje: "Grupo de investigación actualizado exitosamente.",
        });
        setTimeout(() => {
          router.push("/grupos");
        }, 2000);
      }
    } catch (error) {
      console.error(
        modo === "crear"
          ? "Error al crear grupo:"
          : "Error al actualizar grupo:",
        error
      );
      let msgError =
        modo === "crear"
          ? "Ocurrió un error al crear el grupo."
          : "Ocurrió un error al actualizar el grupo.";

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
    loadingFacultades,
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
