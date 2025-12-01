import { FuenteFinanciamiento } from "./FuenteFinanciamiento";
import { Grupo } from "../Grupos/Grupos";
import { ProgramaIncentivo } from "./ProgramaIncentivo";
import { UsuarioBasic } from "./Usuario";

<<<<<<< HEAD
export interface Personal{
    id: number;
    usuarioId:number;
    nivelDeFormacion:string;
    horasSemanales:number;
    emailInstitucional: string;
    Usuario: UsuarioBasic;
    grupo: Grupo;
    rol: "string";
<<<<<<< HEAD
=======
export interface Personal {
  id: number;
  Usuario: UsuarioBasic;
  grupo: Grupo;
  rol: "string";
>>>>>>> modulo-equipamiento
=======
    horasSemanales: number;
    legajo?: string;     
    tipoFormacion?: string;   
>>>>>>> origin/modulo-personal
}

export interface PersonalBase extends Personal {
  ObjectType: "personal";
}

<<<<<<< HEAD
export interface Investigador extends Personal {
  categoriaUTN: string;
  dedicacion: string;
  horasSemanales: number;
  ProgramaIncentivo: ProgramaIncentivo;
  ObjectType: "investigador";
}

export interface EnFormacion extends Personal {
  tipoFormacion: string;
  fuentesDeFinanciamiento: FuenteFinanciamiento;
  ObjectType: "en formacion";
=======
export interface Investigador extends Personal{
    categoriaUTN: string;
    dedicacion:string;
    ProgramaIncentivo: ProgramaIncentivo;
      ObjectType: "investigador";

}

export interface EnFormacion extends Personal{
    fuentesDeFinanciamiento: FuenteFinanciamiento[];
      ObjectType: "en formación";

>>>>>>> origin/modulo-personal
}

export type PersonalResponse = PersonalBase | Investigador | EnFormacion;
