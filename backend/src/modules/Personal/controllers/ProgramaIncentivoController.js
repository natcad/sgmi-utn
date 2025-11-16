import { ProgramaIncentivoService } from "../services/ProgramaIncentivoService.js";

export const ProgramaIncentivoController = {
  async crear(req, res) {
    try {
      const datos = req.body;
      const nuevo = await ProgramaIncentivoService.crear(datos);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
  async listar(req,res){
    try {
        const programaIncentivo =await ProgramaIncentivoService.listar();
        res.status(200).json(programaIncentivo);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
  },

   async obtenerPorId(req, res) {
    try {
      const id = req.params;
      const programaIncentivo = await ProgramaIncentivoService.obtenerPorId(id);
      if(!programaIncentivo) return res.status(404).json({mensaje:"Programa de incentivo no encontrado"});
      res.status(201).json(programaIncentivo);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
   async actualizar(req, res) {
    try {
      const id = req.params;
      const programaIncentivo = await ProgramaIncentivoService.actualizar(id,req.body);
      res.status(201).json(programaIncentivo);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
    async eliminar(req, res) {
    try {
      const id = req.params;
      await ProgramaIncentivoService.eliminar(id);
      res.status(204).send;
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
  

};
