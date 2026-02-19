"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import api from "@/services/api";
import { MemoriaResumen } from "@/interfaces/module/Memorias/MemoriaResumen";

interface UseMemoriasListParams {
  esAdmin: boolean | undefined;
  usuario: { id?: number; rol?: string } | null;
  cargandoUsuario: boolean;
}

export const useMemoriasList = ({
  esAdmin,
  usuario,
  cargandoUsuario,
}: UseMemoriasListParams) => {
  const [datos, setDatos] = useState<MemoriaResumen[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (cargandoUsuario || !usuario) return;

    async function fetchData() {
      try {
        setCargando(true);
        let data: MemoriaResumen[] = [];

        if (esAdmin) {
          // Admin: ve todas las memorias
          const res = await api.get<MemoriaResumen[]>("/memorias", {
            params: { incluirDetalle: true },
          });
          data = res.data;
        } else {
          // Integrante: solo memorias del grupo
          try {
            const resGrupo = await api.get("/grupos/mi-grupo");
            const miGrupoId = resGrupo.data.id;

            const resMemorias = await api.get<MemoriaResumen[]>("/memorias", {
              params: { grupoId: miGrupoId, incluirDetalle: false },
            });

            data = resMemorias.data;
          } catch (error) {
            console.log(
              "El usuario no tiene grupo asignado o hubo un error al obtener su grupo."
            );
            console.error(error);
            data = [];
          }
        }

        setDatos(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) return;
        console.error("Error al cargar memorias:", error);
      } finally {
        setCargando(false);
      }
    }

    fetchData();
  }, [usuario, cargandoUsuario, esAdmin]);

  return { datos, setDatos, cargando };
};
