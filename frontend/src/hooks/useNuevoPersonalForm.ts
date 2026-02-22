"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/services/api";
import { personalSchema, PersonalFormValues } from "@/schemas/Personal/personal.schema";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";
import { getGrupos, getMiGrupoApi } from "@/services/grupos.api";
import { MensajeModal } from "@/interfaces/MensajeModal";
import { useAuth } from "@/context/AuthContext";
import { mapPersonalToFormData } from "@/helpers/mapPersonalToFormData";
import { convertirHoras, buildPayload } from "@/interfaces/module/Personal/AddPersonal";
import { CatalogosPersonal, getCatalogosPersonal } from "@/services/personal.api";

interface UseNuevoPersonalFormOptions {
  modo?: "crear" | "editar";
  valoresIniciales?: Partial<PersonalFormValues>;
  idPersonal?: number;
  grupoId?: number;
}

export function useNuevoPersonalForm({
  modo = "crear",
  valoresIniciales,
  idPersonal,
  grupoId,
}: UseNuevoPersonalFormOptions = {}) {
  const router = useRouter();
  const { usuario } = useAuth();

  const [paso, setPaso] = useState(1);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [soloGrupo, setSoloGrupo] = useState<boolean>(false);
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [catalogos, setCatalogos] = useState<CatalogosPersonal | null>(null);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [mensaje, setMensaje] = useState<MensajeModal | null>(null);
  const [fotoPerfilPreview, setFotoPerfilPreview] = useState<string | null>(null);
  const [eliminarFotoPerfil, setEliminarFotoPerfil] = useState(false);

  const formMethods = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema) as Resolver<PersonalFormValues>,
    mode: "onSubmit", // Validar solo al enviar o cuando se llama trigger manualmente
    reValidateMode: "onSubmit", // Revalidar solo al enviar
    shouldFocusError: true, // Enfocar el primer campo con error
    shouldUnregister: false, // Mantener los valores de los campos al cambiar de paso
    criteriaMode: "all", // Mostrar todos los errores, no solo el primero
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      telefono: undefined,
      fechaNacimiento: undefined,
      fotoPerfil: undefined,
      grupoId: undefined as any,
      horasSemanales: 0,
      rol: "" as any,
      categoriaUTN: undefined,
      dedicacion: undefined,
      estadoIncentivo: undefined,
      fechaVencimientoIncentivo: undefined,
      tipoFormacion: undefined,
      fuenteOrganismo: undefined,
      fuenteMonto: undefined,
      ...valoresIniciales,
    },
  });

  const { trigger, setValue, getValues, reset, watch, clearErrors } = formMethods;

  // Ocultar el error del campo cuando el usuario empieza a escribir; vuelven a mostrarse al enviar
  useEffect(() => {
    const subscription = watch((_, { name }) => {
      if (name) clearErrors(name);
    });
    return () => subscription.unsubscribe();
  }, [watch, clearErrors]);

  // Cargar grupos
  useEffect(() => {
    const fetchGrupos = async () => {
      setLoadingGrupos(true);
      try {
        // If the logged user is an integrante, only load their grupo
        if (usuario && usuario.rol !== "admin") {
          try {
            const miGrupo = await getMiGrupoApi();
            if (miGrupo) {
              setGrupos([miGrupo]);
              setSoloGrupo(true);
              // prefill grupoId in the form
              setValue("grupoId", miGrupo.id);
            } else {
              setGrupos([]);
            }
          } catch (err) {
            console.error("Error al cargar mi grupo:", err);
            setGrupos([]);
          }
        } else {
          const res = await getGrupos();
          setGrupos(res || []);
          setSoloGrupo(false);
        }
      } catch (err) {
        console.error("Error al cargar grupos:", err);
        setMensaje({
          tipo: "error",
          mensaje: "Error al cargar los grupos.",
        });
      } finally {
        setLoadingGrupos(false);
      }
    };
    fetchGrupos();
  }, [usuario, setValue]);

  // Cargar catálogos (roles, categorías, dedicación, etc.) desde la DB
  useEffect(() => {
    const fetchCatalogos = async () => {
      setLoadingCatalogos(true);
      try {
        const data = await getCatalogosPersonal();
        setCatalogos(data);
      } catch (err) {
        console.error("Error al cargar catálogos:", err);
      } finally {
        setLoadingCatalogos(false);
      }
    };
    fetchCatalogos();
  }, []);

  // Cargar datos si es edición
  useEffect(() => {
    if (!idPersonal || modo !== "editar") return;

    const fetchPersonal = async () => {
      try {
        const res = await api.get(`/personal/${idPersonal}`);
        const mappedData = mapPersonalToFormData(res.data);

        const formValues: any = {
          ...mappedData,
          grupoId: mappedData.grupoId ? String(mappedData.grupoId) : "",
        };

        reset(formValues);

        if (mappedData.fotoPerfil) {
          setFotoPerfilPreview(mappedData.fotoPerfil);
        }
        setEliminarFotoPerfil(false);
      } catch (error) {
        console.error("Error cargando personal:", error);
        setMensaje({
          tipo: "error",
          mensaje: "Error al cargar los datos del personal.",
        });
      }
    };

    fetchPersonal();
  }, [idPersonal, modo, reset]);

  useEffect(() => {
    if (modo === "crear" && grupoId && grupos.length > 0) {
      setValue("grupoId", grupoId);
    }
  }, [modo, grupoId, grupos, setValue]);

  useEffect(() => {
    if (valoresIniciales) {
      reset((prev) => ({
        ...prev,
        ...valoresIniciales,
      }));
    }
  }, [valoresIniciales, reset]);

  const handleContinuar = async () => {
    const esValido = await trigger(
      ["nombre", "apellido", "email", "telefono", "fechaNacimiento"],
      { shouldFocus: true }
    );

    if (!esValido) {
      return;
    }

    setPaso(2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        setMensaje({
          tipo: "error",
          mensaje: "Por favor, selecciona un archivo de imagen",
        });
        return;
      }

      // Validar tamaño 
      if (file.size > 5 * 1024 * 1024) {
        setMensaje({
          tipo: "error",
          mensaje: "La imagen no debe superar los 5MB",
        });
        return;
      }

      setValue("fotoPerfilFile", file);
      setEliminarFotoPerfil(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPerfilPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setValue("fotoPerfilFile", undefined);
      setFotoPerfilPreview(null);
    }
  };

  const handleEliminarFoto = () => {
    setValue("fotoPerfilFile", undefined);
    setFotoPerfilPreview(null);
    setEliminarFotoPerfil(true);
    // Limpiar el input file
    const fileInput = document.querySelector(
      'input[name="fotoPerfil"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (values: PersonalFormValues) => {
    console.log("onSubmit llamado con valores:", values);
    console.log("Modo:", modo);
    console.log("idPersonal:", idPersonal);
    
    if (!usuario?.id) {
      console.error("Usuario no autenticado");
      setMensaje({
        tipo: "error",
        mensaje: "Usuario no autenticado",
      });
      return;
    }

    setLoadingSubmit(true);

    try {
      let incentivoId: number | null = null;

      // Si es Investigador, crear/obtener incentivo
      if (values.rol === "Investigador" && values.estadoIncentivo) {
        try {
          const incentivoRes = await api.post("/ProgramaIncentivo", {
            estado: values.estadoIncentivo,
            fechaVencimiento: values.fechaVencimientoIncentivo || null,
          });
          incentivoId = incentivoRes.data.id;
        } catch (error) {
          console.error("Error al crear incentivo:", error);
        }
      }


      const formDataForPayload = {
        ...values,
        fechaNacimiento: values.fechaNacimiento || undefined,
        fechaVencimientoIncentivo: values.fechaVencimientoIncentivo || undefined,
        incentivoId,
      };

      // Asegurar que grupoId sea número
      const grupoIdNum = typeof values.grupoId === "string" 
        ? Number(values.grupoId) 
        : values.grupoId;

      const payload = buildPayload(
        formDataForPayload as any,
        usuario.id,
        grupoIdNum
      );

      // Si es edición y se marca eliminar foto
      if (eliminarFotoPerfil && idPersonal) {
        payload.eliminarFotoPerfil = true;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("data", JSON.stringify(payload));

      // Agregar archivo de foto si existe
      const fotoFile = values.fotoPerfilFile as File | undefined;
      if (fotoFile) {
        formDataToSend.append("fotoPerfil", fotoFile);
      }

      // Enviar petición
      if (modo === "crear") {
        console.log("Creando personal...");
        await api.post("/personal", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Personal creado exitosamente");
        setMensaje({
          tipo: "exito",
          mensaje: "Personal agregado exitosamente.",
        });
      } else {
        if (!idPersonal) {
          console.error("Falta idPersonal para actualizar");
          throw new Error("Falta idPersonal para actualizar.");
        }
        console.log(`Actualizando personal con id: ${idPersonal}`);
        await api.put(`/personal/${idPersonal}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Personal actualizado exitosamente");
        setMensaje({
          tipo: "exito",
          mensaje: "Personal actualizado exitosamente.",
        });
      }

      setTimeout(() => {
        router.push("/personal");
      }, 2000);
    } catch (error) {
      console.error(
        modo === "crear"
          ? "Error al crear personal:"
          : "Error al actualizar personal:",
        error
      );

      let msgError =
        modo === "crear"
          ? "Ocurrió un error al crear el personal."
          : "Ocurrió un error al actualizar el personal.";

      interface ApiErrorResponse {
        message?: string;
        error?: string;
      }

      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        msgError = error.response?.data?.message || error.response?.data?.error || msgError;
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
    grupos,
    soloGrupo,
    loadingGrupos,
    catalogos,
    loadingCatalogos,
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
  };
}

