export interface GrupoResumen {
  id: number;
  nombre: string;
}

export interface CreadorResumen {
  id: number;
  nombre: string;
  apellido: string;
  email?: string;
}

export interface UsuarioEmbedded {
  id: number;
  nombre: string;
  apellido: string;
  email?: string;
}

export interface PersonalEmbedded {
  id: number;
  Usuario?: UsuarioEmbedded;
}

export interface MemoriaPersonalItem {
  id: number;
  idMemoria: number;
  idPersonal: number;
  ObjectType: string | null;
  horasSemanales: number | null;
  rol: string | null;
  nivelDeFormacion: string | null;
  categoriaUTN: string | null;
  dedicacion: string | null;
  tipoFormacion: string | null;
  observaciones?: string | null;
  personal?: PersonalEmbedded;
}

export interface MemoriaEquipamientoItem {
  id: number;
  idMemoria: number;
  idEquipamiento: number;
  denominacion: string;
  descripcion: string | null;
  montoInvertido: string;
  fechaIncorporacion: string;
  cantidad: number;
}

export interface MemoriaDetalleResponse {
  id: number;
  anio: number;
  estado: "Borrador" | "Enviada" | "Aprobada" | "Rechazada";
  version: number;
  titulo: string | null;
  resumen: string | null;
  grupoId: number;
  grupo?: GrupoResumen;
  creador?: CreadorResumen;
  personal?: MemoriaPersonalItem[];
  equipamiento?: MemoriaEquipamientoItem[];
}
