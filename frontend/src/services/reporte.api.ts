// src/services/api/reporte.api.ts
import api from "@/services/api";

type ExportResumenGruposParams = {
  grupoIds?: number[];          // opcional
  from?: number;                // año desde
  to?: number;                  // año hasta
  estado?: string[];            // ["Enviada", "Aprobada"]
};

export async function exportarResumenGruposExcel(params: ExportResumenGruposParams = {}) {
  const query: any = {};

  if (params.grupoIds?.length) query.grupoIds = params.grupoIds.join(",");
  if (params.from) query.from = params.from;
  if (params.to) query.to = params.to;
  if (params.estado?.length) query.estado = params.estado.join(",");

  const res = await api.get("/reportes/resumen-grupos/exportar/excel", {
    params: query,
    responseType: "blob",
  });

  return res.data as Blob;
}

export async function exportarEstadoActualGrupoExcel(grupoId: number) {
  const res = await api.get(`/reportes/grupos/${grupoId}/estado-actual/exportar/excel`, {
    responseType: "blob",
  });

  return res.data as Blob;
}

/**
 * Helper para descargar un Blob como archivo
 */
export function descargarBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
