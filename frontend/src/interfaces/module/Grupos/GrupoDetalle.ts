import { PersonalResponse } from "@/interfaces/module/Personal/Personal"; 

export interface GrupoDetalle {
  id: number;
  nombre: string;
  siglas: string;
  objetivo: string;
  director: { Usuario: { nombre: string; apellido: string } } | null;
  vicedirector: { Usuario: { nombre: string; apellido: string } } | null;
  integrantes: PersonalResponse[]; // La propiedad 'integrantes' debe existir
  organigramaUrl?: string;
  organigramaPublicId?:string;
}