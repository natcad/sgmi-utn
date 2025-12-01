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
<<<<<<< HEAD
}

export interface UsuarioData {
  nombre: string;
  apellido: string;
=======
    PerfilUsuario?: PerfilUsuario;
>>>>>>> origin/modulo-personal
}