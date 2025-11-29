import { UsuarioData } from "../Personal/Usuario";
export interface DirectorData {
  Usuario?: UsuarioData; // Caso: viene anidado
  nombre?: string;       // Caso: viene plano
  apellido?: string;
}


