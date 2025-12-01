export interface Usuario{
    id:number;
    nombre:string;
    apellido:string;
    email:string;
    password:string;
    rol:"admin" |"integrante";
    activo:boolean;
    grupoId:number | null;
}

export interface UsuarioBasic{
    nombre: string;
    apellido: string;
    email: string;
}

export interface UsuarioData {
  nombre: string;
  apellido: string;
}