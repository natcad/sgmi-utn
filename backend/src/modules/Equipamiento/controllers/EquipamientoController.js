import { EquipamientoService } from "../services/EquipamientoService.js";

export const EquipamientoController = { 
    async listar(req, res) {
        try {
            const filters = {
                search: req.query.search || undefined,
                grupoId: req.query.grupoId || undefined,
            };
            const equipamientos = await EquipamientoService.listar(filters);
            return res.status(200).json(equipamientos);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const equipamiento = await EquipamientoService.obtenerPorId(id);
            return res.status(200).json(equipamiento);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }   
    },
    async crear(req, res) {
        try {
            const data = req.body;
            const nuevoEquipamiento = await EquipamientoService.crear(data);
            return res.status(201).json(nuevoEquipamiento);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }   
    },

    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const equipamientoActualizado = await EquipamientoService.actualizar(id, data);
            return res.status(200).json(equipamientoActualizado);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }   
    },  
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            const resultado = await EquipamientoService.eliminar(id);
            return res.status(200).json(resultado);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }   
    }
}