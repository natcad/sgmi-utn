import { useEffect, useState } from "react";
import axios from "axios";

import api from "@/services/api";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import { MemoriaDetalleResponse } from "@/interfaces/module/Memorias/MemoriaDetalle";

export const useMemoriaDetalle = (id?: string) => {
  const [memoria, setMemoria] = useState<MemoriaDetalleResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState<MensajeModal | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchMemoria = async () => {
      try {
        const res = await api.get<MemoriaDetalleResponse>(`/memorias/${id}`, {
          params: { incluirDetalle: true },
        });
        setMemoria(res.data);
      } catch (error) {
        console.error("Error al obtener la memoria:", error);
        let mensaje =
          "Ocurrió un error al cargar la memoria. Por favor, intente nuevamente.";
        if (axios.isAxiosError(error) && error.response?.data?.message) {
          mensaje = error.response.data.message;
        }
        setModal({ tipo: "error", mensaje });
      } finally {
        setCargando(false);
      }
    };

    fetchMemoria();
  }, [id]);

  return { memoria, cargando, modal, setModal };
};
