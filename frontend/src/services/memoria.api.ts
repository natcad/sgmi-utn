// src/services/api/memorias.api.ts
import api from "@/services/api";

export async function exportarMemoriaExcel(id: number) {
  const res = await api.get(`/memorias/${id}/exportar/excel`, {
    responseType: "blob",
  });
  return res.data as Blob;
}

type ExportGrupoMemoriasParams = {
  from?: number;
  to?: number;
  estado?: string[]; // opcional
};

export async function exportarGrupoMemoriasExcel(grupoId: number, params: ExportGrupoMemoriasParams = {}) {
  const query: any = {};
  if (params.from) query.from = params.from;
  if (params.to) query.to = params.to;
  if (params.estado?.length) query.estado = params.estado.join(",");

  const res = await api.get(`/memorias/grupos/${grupoId}/exportar/excel`, {
    params: query,
    responseType: "blob",
  });
  return res.data as Blob;
}

export async function enviarMemoriaPorMail(id: number, emails: string[]) {
  const res = await api.post(`/memorias/${id}/enviar-por-mail`, { emails });
  return res.data;
}
