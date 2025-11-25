import { FuenteFinanciamiento } from "./FuenteFinanciamiento";
import { Grupo } from "../Grupos/Grupos";
import { ProgramaIncentivo } from "./ProgramaIncentivo";
import { UsuarioBasic } from "./Usuario";

export interface Personal{
    id: number;
    Usuario: UsuarioBasic;
    grupo: Grupo;
    rol: "string";
}

export interface PersonalBase extends Personal{
    ObjectType: "personal";
}

export interface Investigador extends Personal{
    categoriaUTN: string;
    dedicacion:string;
    horasSemanales: number;
    ProgramaIncentivo: ProgramaIncentivo;
      ObjectType: "investigador";

}

export interface EnFormacion extends Personal{
    tipoFormacion: string;
    fuentesDeFinanciamiento: FuenteFinanciamiento;
      ObjectType: "en formacion";

}

export type PersonalResponse =
  | PersonalBase
  | Investigador
  | EnFormacion;