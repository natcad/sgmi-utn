import { Grupo } from "../Grupos/Grupos";

export interface Equipamiento {
  id: number;
  denominacion: string;
  descripcion: string;
  montoInvertido: number;
  fechaIncorporacion: Date | string;
  cantidad: number;
  grupoId: number | null;
  grupo?: Grupo | null;
}
