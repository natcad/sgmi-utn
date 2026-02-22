// hooks/useGruposListado.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Table } from "@tanstack/react-table";

import api from "@/services/api";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";
import { obtenerColumnas } from "@/app/Grupos/components/columnasGrupo";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import { useAuth } from "@/context/AuthContext";
import { getGrupos, getMiGrupoApi } from "@/services/grupos.api";

export const useGruposListado = () => {
  const router = useRouter();
  const { usuario, cargandoUsuario } = useAuth();

  

  //datos
  const [datos, setDatos] = useState<Grupo[]>([]);
  const [tieneGrupo, setTieneGrupo] = useState<boolean | null>(null);
  const [idMiGrupo, setIdMiGrupo] = useState<number | null>(null); // Guardamos el ID aquí

  //UI
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<MensajeModal | null>(null);
  const [grupoAEliminar, setGrupoAEliminar] = useState<number | null>(null);

  //tabla
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<Table<Grupo> | null>(null);

  // ---------- FETCH ----------

  const fetchData = useCallback(async () => {
    if (!usuario) return;

    if (usuario.rol !== "admin" && usuario.grupoId) {
      setIdMiGrupo(usuario.grupoId);
      setTieneGrupo(true);
      return;
    }

    setLoading(true);
    try {
      // si es admin:
      if (usuario.rol === "admin") {
        const grupos = await getGrupos();
        setDatos(grupos);
      } else {
        const miGrupo = await getMiGrupoApi();
        setIdMiGrupo(miGrupo.id);
        setTieneGrupo(true);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        if (usuario.rol !== "admin") {
          setTieneGrupo(false);
        }
        console.error("Error al cargar grupos:", err);
      } else {
        console.error("Error cargando datos:", err);
        setModal({
          tipo: "error",
          mensaje: "Error al cargar el listado de grupos.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (!cargandoUsuario && usuario) {
      fetchData();
    }
  }, [cargandoUsuario,usuario, fetchData]);


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

    router.push(`/personal/agregar-personal?grupoId=${grupoId}`);
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
    loading: loading || cargandoUsuario,
    usuario,
    idMiGrupo,
    tieneGrupo,
    
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
    //helpers
    checkingRole:loading || cargandoUsuario,
    esAdmin: usuario?.rol ==='admin',
  };
};
