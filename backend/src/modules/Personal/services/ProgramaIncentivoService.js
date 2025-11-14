import { ProgramaIncentivoRespository } from "../repositories/ProgramaIncentivoRespository";
import { ProgramaIncentivoRespository } from "../repositories/ProgramaIncentivoRepository";

export const ProgramaIncentivoService ={
    async obtenerTodos(filters={}){
        return await ProgramaIncentivoRespository.findAll(filters);
    },
    async obtenerPorId(id){
        const programaIncentivo=  await ProgramaIncentivoRespository.findById(id);
        if(!programaIncentivo) throw new Error("Programa de Incentivo no encontrado");
        return programaIncentivo;
    } ,

    async crear(data){
        return await ProgramaIncentivoRespository.create(data);
    },

    async actualizar(id,data){
        return await ProgramaIncentivoRespository.update(id,data);
    }
,
    async eliminar(id){
        return await ProgramaIncentivoRespository.delete(id);
    }

}