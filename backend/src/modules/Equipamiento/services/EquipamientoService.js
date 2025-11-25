import { EquipamientoRepository } from "../repositories/EquipamientoRepository.js";
import db from "../../../models/db.js";
const { GrupoInvestigacion } = db.models;

 export const EquipamientoService = {
    async listar(filters={}) {
        return await EquipamientoRepository.findAll(filters);
    },
    async obtenerPorId(id) {
        const equipamiento = await EquipamientoRepository.findById(id);
        if (!equipamiento) throw new Error("Equipamiento no encontrado");
        return equipamiento;
    },
    async crear(data) {
        const grupo = await GrupoInvestigacion.findByPk(data.grupoId);
        if (!grupo) throw new Error("Grupo de investigación no encontrado");
        return await EquipamientoRepository.create(data);
    },
    async actualizar(id, data) {
        const equipamiento = await EquipamientoRepository.findById(id);
        if (!equipamiento) throw new Error("Equipamiento no encontrado");
        if (data.grupoId) {
            const grupo = await GrupoInvestigacion.findByPk(data.grupoId);
            if (!grupo) throw new Error("Grupo de investigación no encontrado");

        }
        return await equipamiento.update(id, data);
    },
    async eliminar(id) {
        const equipamiento = await EquipamientoRepository.findById(id);
        if (!equipamiento) throw new Error("Equipamiento no encontrado");
        await EquipamientoRepository.delete(id);
        return { message: "Equipamiento eliminado correctamente" }; 
    }
 }