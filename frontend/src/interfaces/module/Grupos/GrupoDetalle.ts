import { PersonalResponse } from "@/interfaces/module/Personal/Personal";
import { Facultad } from "./Facultad";
import { Grupo } from "./Grupos";

export interface GrupoDetalle extends Grupo {
  director: PersonalResponse | null;
  vicedirector: PersonalResponse | null;
  integrantes: PersonalResponse[];
  organigramaUrl?: string;
  organigramaPublicId?: string;
  facultadRegional: Facultad | null;
}