import { EnFormacionRepository } from "../repositories/EnFormacionRepository.js";

export const EnFormacionService ={
    async obtenerTodos(filters={}){
        return await EnFormacionRepository.findAll(filters);
    },
    async obtenerPorId(id){
        const enFormacion=  await EnFormacionRepository.findById(id);
        if(!enFormacion) throw new Error("Personal en Formacion no encontrado");
        return enFormacion;
    } ,

    async crear(data, transaction = null){
        return await EnFormacionRepository.create(data,transaction);
    },

    async actualizar(id,data){
        return await EnFormacionRepository.update(id,data);
    }
,
    async eliminar(id){
        return await EnFormacionRepository.delete(id);
    }

}