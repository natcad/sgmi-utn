// hooks/useGruposListado.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Table } from "@tanstack/react-table";

import api from "@/services/api";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";
import { obtenerColumnas } from "@/app/grupos/components/columnasGrupo";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import { useAuth } from "@/context/AuthContext";
import { getMiGrupoApi } from "@/services/grupos.api";

export const useGruposListado = () => {
  const router = useRouter();
  const { usuario } = useAuth();

  const [checkingRole, setCheckingRole] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [tieneGrupo, setTieneGrupo] = useState<boolean | null>(null);

  const [datos, setDatos] = useState<Grupo[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<Table<Grupo> | null>(null);
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState<MensajeModal | null>(null);
  const [grupoAEliminar, setGrupoAEliminar] = useState<number | null>(null);

  // ---------- REDIRECCIÓN SEGÚN ROL ----------
  useEffect(() => {
    const run = async () => {
      // Si todavía no tenemos usuario en contexto, esperamos
      if (!usuario) {
        return;
      }

      // Si es ADMIN → se queda en la página, ve el listado
      if (usuario.rol === "admin") {
        setEsAdmin(true);
        setCheckingRole(false);

        return;
      }
      //si es usuario comun y tiene grupo redirige a su grupo
      try {
        const grupo = await getMiGrupoApi();
        router.replace(`/grupos/${grupo.id}`);
      } catch (error: unknown) {
        let status: number | undefined;

        if (axios.isAxiosError(error)) {
          status = error.response?.status;
        }

        if (status === 404) {
          setTieneGrupo(false);
          setCheckingRole(false);
        } else {
          setModal({
            tipo: "error",
            mensaje: "No se pudo obtener tu grupo. Intentalo más tarde.",
          });
          setCheckingRole(false);
        }
      }
    };

    run();
  }, [usuario, router]);

  // ---------- FETCH ----------

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Grupo[]>("/grupos", {
        withCredentials: true,
      });
      setDatos(res.data);
    } catch (err) {
      console.error("Error al cargar grupos:", err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          return;
        }

        const data = err.response?.data as { message?: string } | undefined;
        const mensajeError =
          data?.message || "Error al cargar el listado de grupos.";

        setModal({
          tipo: "error",
          mensaje: mensajeError,
        });
      } else {
        setModal({
          tipo: "error",
          mensaje: "Ocurrió un error inesperado.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!checkingRole && esAdmin) {
      fetchData();
    }
  }, [checkingRole, esAdmin, fetchData]);

  // ---------- NAVEGACIÓN ----------
  const handleNuevoGrupo = useCallback(() => {
    router.push("/grupos/NuevoGrupo");
  }, [router]);

  const handleEditar = useCallback(
    (id: string | number) => {
      router.push(`/grupos/${id}/editar`);
    },
    [router]
  );
  const handleAgregarIntegrantes = (grupoId: number) => {
    if (grupoId) return;

    // Ajustá la ruta según cómo tengas definida la page:
    // Opción 1: con query param
    router.push(`/agregar-personal?grupoId=${grupoId}`);

    // Opción 2 (si usaras segmento dinámico):
    // router.push(`/personal/agregar-personal/${grupo.id}`);
  };


  // ---------- ELIMINACIÓN ----------
  const handleEliminar = useCallback((id: number) => {
    setGrupoAEliminar(id);
  }, []);

  const confirmarEliminacion = useCallback(async () => {
    if (!grupoAEliminar) return;

    try {
      await api.delete(`/grupos/${grupoAEliminar}`);
      setModal({
        tipo: "exito",
        mensaje: "Grupo eliminado correctamente.",
      });
      fetchData();
    } catch (error) {
      console.error("Error al eliminar grupo:", error);
      setModal({
        tipo: "error",
        mensaje: "Error al eliminar el grupo.",
      });
    } finally {
      setGrupoAEliminar(null);
    }
  }, [grupoAEliminar, fetchData]);

  const cancelarEliminacion = useCallback(() => {
    setGrupoAEliminar(null);
  }, []);

  // ---------- MODAL ----------
  const handleCloseModal = useCallback(() => setModal(null), []);

  // ---------- COLUMNAS TABLA ----------
  const columnas = useMemo(
    () => obtenerColumnas(handleEliminar, handleEditar),
    [handleEliminar, handleEditar]
  );

  // ---------- DERIVADOS ----------
  const hayResultados = table ? table.getRowModel().rows.length > 0 : true;

  return {
    // datos
    datos,
    loading,

    // filtro global
    globalFilter,
    setGlobalFilter,

    // tabla
    table,
    setTable,
    columnas,
    hayResultados,

    // navegación
    handleNuevoGrupo,
handleAgregarIntegrantes,
    // eliminación
    grupoAEliminar,
    confirmarEliminacion,
    cancelarEliminacion,

    // modal
    modal,
    handleCloseModal,
    checkingRole,
    esAdmin,
    tieneGrupo,
  };
};
