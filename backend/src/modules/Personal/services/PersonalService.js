import { PersonalRepository } from "../repositories/PersonalRepository.js";

export const PersonalService ={
    async obtenerTodos(filters={}){
        return await PersonalRepository.findAll(filters);
    },
    async obtenerPorId(id){
        const personal=  await PersonalRepository.findById(id);
        if(!personal) throw new Error("Personal no encontrado");
        return personal;
    } ,

    async crear(data){
        return await PersonalRepository.create(data);
    },

    async actualizar(id,data){
        return await PersonalRepository.update(id,data);
    }
,
    async eliminar(id){
        return await PersonalRepository.delete(id);
    }

}