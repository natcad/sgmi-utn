export interface MemoriaResumen {
  id: number;
  anio: number;
  estado: "Borrador" | "Enviada" | "Pendiente de revisión" | "Aprobada" | "Rechazada";
  version: number;
  titulo: string | null;
  resumen?: string | null;
  grupoId: number;
  createdAt: string;
  grupo?: {
    id: number;
    nombre: string;
  };
}
