import { InvestigadorRepository } from "../repositories/InvestigadorRepository.js";

export const InvestigadorService ={
    async listar(filters={}){
        return await InvestigadorRepository.findAll(filters);
    },
    async obtenerPorId(id){
        const investigador=  await InvestigadorRepository.findById(id);
        if(!investigador) throw new Error("Investigador no encontrado");
        return investigador;
    } ,

    async crear(data, transaction=null){
        return await InvestigadorRepository.create(data, transaction);
    },

    async actualizar(id,data){
        return await InvestigadorRepository.update(id,data);
    }
,
    async eliminar(id){
        return await InvestigadorRepository.delete(id);
    }

}