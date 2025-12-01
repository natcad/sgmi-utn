import { FuenteFinanciamiento } from "./FuenteFinanciamiento";
import { Grupo } from "../Grupos/Grupos";
import { ProgramaIncentivo } from "./ProgramaIncentivo";
import { UsuarioBasic } from "./Usuario";

export interface Personal{
    id: number;
    Usuario: UsuarioBasic;
    grupo: Grupo;
    rol: "string";
    horasSemanales: number;
    legajo?: string;     
    tipoFormacion?: string;   
}

export interface PersonalBase extends Personal{
    ObjectType: "personal";
}

export interface Investigador extends Personal{
    categoriaUTN: string;
    dedicacion:string;
    ProgramaIncentivo: ProgramaIncentivo;
      ObjectType: "investigador";

}

export interface EnFormacion extends Personal{
    fuentesDeFinanciamiento: FuenteFinanciamiento[];
      ObjectType: "en formación";

}

export type PersonalResponse =
  | PersonalBase
  | Investigador
  | EnFormacion;