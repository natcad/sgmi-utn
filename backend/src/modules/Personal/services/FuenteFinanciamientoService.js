import { FuenteFinanciamientoRepository } from "../repositories/FuenteFinanciamientoRepository";

export const FuenteFinanciamientoService ={
    async obtenerTodos(filters={}){
        return await FuenteFinanciamientoRepository.findAll(filters);
    },
    async obtenerPorId(id){
        const fuenteFinanciamiento=  await FuenteFinanciamientoRepository.findById(id);
        if(!fuenteFinanciamiento) throw new Error("Fuente de Financiamiento no encontrado");
        return fuenteFinanciamiento;
    } ,

    async crear(data){
        return await FuenteFinanciamientoRepository.create(data);
    },

    async actualizar(id,data){
        return await FuenteFinanciamientoRepository.update(id,data);
    }
,
    async eliminar(id){
        return await FuenteFinanciamientoRepository.delete(id);
    }

}