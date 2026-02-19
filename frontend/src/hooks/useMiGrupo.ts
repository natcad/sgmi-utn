"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMiGrupoApi, getGrupoDetalle } from "@/services/grupos.api";
import { GrupoDetalle } from "@/interfaces/module/Grupos/GrupoDetalle";

export const useMiGrupo = () => {
  const { usuario, cargandoUsuario } = useAuth();
  const [miGrupo, setMiGrupo] = useState<GrupoDetalle | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchMiGrupo = useCallback(async () => {
    if (!usuario) return;

    // if usuario.grupoId is available, fetch that group detail
    setLoading(true);
    setError(null);
    try {
      if (usuario.grupoId) {
        const detalle = await getGrupoDetalle(usuario.grupoId);
        setMiGrupo(detalle as GrupoDetalle);
      } else {
        const detalle = await getMiGrupoApi();
        setMiGrupo(detalle as GrupoDetalle);
      }
    } catch (err) {
      setMiGrupo(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (!cargandoUsuario && usuario) {
      fetchMiGrupo();
    }
  }, [cargandoUsuario, usuario, fetchMiGrupo]);

  return { miGrupo, loading, error, refresh: fetchMiGrupo };
};

export default useMiGrupo;
