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

export interface PerfilUsuario {
  telefono?: string | null;
  fechaNacimiento?: string | null;
  fotoPerfil?: string | null;
}

export interface UsuarioBasic{
    id: number;   
    nombre: string;
    apellido: string;
    email: string;
    PerfilUsuario?: PerfilUsuario;
}

export interface UsuarioData {
  nombre: string;
  apellido: string;
}