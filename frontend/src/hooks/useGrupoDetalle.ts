// hooks/useGrupoDetalle.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

import { GrupoDetalle } from "@/interfaces/module/Grupos/GrupoDetalle";
import { MensajeModal } from "@/interfaces/MensajeModal";
import {
  actualizarGrupoApi,
  getGrupoDetalle,
  getOrganigramaUrl,
  eliminarGrupoApi,
} from "@/services/grupos.api";

export const useGrupoDetalle = () => {
  const params = useParams();
  const idGrupo = params?.id as string | undefined;
  const router = useRouter();

  const [grupo, setGrupo] = useState<GrupoDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState<MensajeModal>();
  const [editandoObjetivo, setEditandoObjetivo] = useState(false);
  const [objetivoTemp, setObjetivoTemp] = useState("");
  const [guardandoObjetivo, setGuardandoObjetivo] = useState(false);

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [eliminandoGrupo, setEliminandoGrupo] = useState(false);

  // ---------- FETCH ----------

  const cargarDatos = useCallback(async () => {
    if (!idGrupo) return;
    try {
      setLoading(true);
      const detalle = await getGrupoDetalle(idGrupo);
      setGrupo(detalle);
    } catch (error) {
      console.error("Error al cargar detalle del grupo:", error);
      setModal({
        tipo: "error",
        mensaje: "No se pudo cargar la información del grupo.",
      });
    } finally {
      setLoading(false);
    }
  }, [idGrupo]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ---------- HANDLERS ----------

  const handleDescargarOrganigrama = () => {
    if (!idGrupo || !grupo) return;
    if (grupo.organigramaUrl && grupo.organigramaPublicId) {
      window.location.href = getOrganigramaUrl(idGrupo);
    }
  };

  const handleNotFinished = () => {
    setModal({
      tipo: "sorry",
      mensaje: "Ups, todavía estamos trabajando en esto.",
    });
  };

  const handleVerEquipamiento = () => {
    if (!idGrupo) return;
    router.push(`/equipamiento/${idGrupo}`);
  };

  const handleEditarObjetivo = () => {
    if (!grupo) return;
    setObjetivoTemp(grupo.objetivo || "");
    setEditandoObjetivo(true);
  };

  const handleCancelarObjetivo = () => {
    setEditandoObjetivo(false);
  };

  const handleGuardarObjetivo = async () => {
    if (!idGrupo) return;

    try {
      setGuardandoObjetivo(true);
      const grupoActualizado = await actualizarGrupoApi(idGrupo, {
        objetivo: objetivoTemp,
      });
      setGrupo(grupoActualizado);
      setEditandoObjetivo(false);
    } catch (error) {
      console.error("Error al actualizar objetivo:", error);
      setModal({
        tipo: "error",
        mensaje: "No se pudo guardar el objetivo. Intentalo nuevamente.",
      });
    } finally {
      setGuardandoObjetivo(false);
    }
  };

  const handleModificarGrupo = () => {
    if (!idGrupo) return;
    router.push(`/grupos/${idGrupo}/editar`);
  };

  const handleVerFinanciamientos = () => {
    setModal({
      tipo: "sorry",
      mensaje: "Ups, todavía estamos trabajando en esto.",
    });
  };

  const handleCargarAutoridades = () => {
    if (!idGrupo) return;
    router.push(`/grupos/${idGrupo}/editar?paso=2`);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuAbierto((prev) => !prev);
  };

  const handleEliminarGrupo = () => {
    setMostrarModalEliminar(true);
    setMenuAbierto(false);
  };

  const handleCancelarEliminarGrupo = () => {
    if (eliminandoGrupo) return;
    setMostrarModalEliminar(false);
  };

  const handleConfirmarEliminarGrupo = async () => {
    if (!idGrupo) return;

    try {
      setEliminandoGrupo(true);
      await eliminarGrupoApi(idGrupo);

      setModal({
        tipo: "exito",
        mensaje: "Grupo eliminado correctamente.",
      });

      router.push("/grupos");
    } catch (error) {
      console.error("Error al eliminar grupo:", error);

      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          "No se pudo eliminar el grupo. Intentalo nuevamente.";
        setModal({ tipo: "error", mensaje: msg });
      } else {
        setModal({
          tipo: "error",
          mensaje: "Ocurrió un error inesperado al eliminar el grupo.",
        });
      }
    } finally {
      setEliminandoGrupo(false);
      setMostrarModalEliminar(false);
    }
  };

  const handleCloseModal = () => setModal(undefined);

  return {
    // datos
    idGrupo,
    grupo,
    loading,

    // modal general
    modal,
    handleCloseModal,

    // objetivo
    editandoObjetivo,
    objetivoTemp,
    setObjetivoTemp,
    guardandoObjetivo,
    handleEditarObjetivo,
    handleCancelarObjetivo,
    handleGuardarObjetivo,

    // menú + eliminación
    menuAbierto,
    toggleMenu,
    mostrarModalEliminar,
    eliminandoGrupo,
    handleEliminarGrupo,
    handleCancelarEliminarGrupo,
    handleConfirmarEliminarGrupo,

    // navegación / acciones varias
    handleDescargarOrganigrama,
    handleNotFinished,
    handleVerEquipamiento,
    handleModificarGrupo,
    handleVerFinanciamientos,
    handleCargarAutoridades,
  };
};
