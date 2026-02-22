import { DirectorData } from "@/interfaces/module/Grupos/DirectorData";

export const obtenerNombreCompleto = (persona: DirectorData | null ): string=>{
    if(!persona) return "Sin asignar";
    if(persona.Usuario){
        const{nombre,apellido}= persona.Usuario;
        return `${nombre} ${apellido}`;
    }

    if (persona.nombre && persona.apellido){
   return `${persona.nombre} ${persona.apellido}`;
        
    }
    return "Datos incompletos";
}