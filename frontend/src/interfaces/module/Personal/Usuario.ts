export interface Usuario{
    id:number;
    nombre:string;
    apellido:string;
    email:string;
    password:string;
    rol:"admin" |"integrante";
    activo:boolean;
    createdAt: string;
   updatedAt: string;
}

export interface UsuarioBasic{
    nombre: string;
    apellido: string;
    email: string;
}