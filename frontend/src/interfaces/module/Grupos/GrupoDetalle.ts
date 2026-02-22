import { PersonalResponse } from "@/interfaces/module/Personal/Personal"; 
import { Facultad } from "./Facultad";
export interface GrupoDetalle {
  id: number;
  nombre: string;
  siglas: string;
  objetivo: string;
  director: PersonalResponse | null;
  vicedirector:PersonalResponse | null;
  integrantes: PersonalResponse[]; 
  organigramaUrl?: string;
  organigramaPublicId?:string;
  facultadRegional: Facultad  | null;
  correo:string;  
  idDirector:number | null;
  idVicedirector:number | null;
  idFacultadRegional: number|null;
}