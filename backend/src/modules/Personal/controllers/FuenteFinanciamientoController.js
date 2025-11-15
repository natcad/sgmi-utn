import { FuenteFinanciamientoService } from "../services/FuenteFinanciamientoService.js";
//
export const FuenteFinanciamientoController = {
  async crear(req, res) {
    try {
      const datos = req.body;
      const nuevo = await FuenteFinanciamientoService.crear(datos);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
  async listar(req,res){
    try {
        const fuenteDeFinanciamiento =await FuenteFinanciamientoService.listar();
        res.status(200).json(fuenteDeFinanciamiento);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
  },

   async obtenerPorId(req, res) {
    try {
      const id = req.params;
      const fuenteDeFinanciamiento = await FuenteFinanciamientoService.obtenerPorId(id);
      if(!fuenteDeFinanciamiento) return res.status(404).json({mensaje:"Fuente de Financiamiento no encontrada"});
      res.status(201).json(fuenteDeFinanciamiento);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
   async actualizar(req, res) {
    try {
      const id = req.params;
      const fuenteDeFinanciamiento = await FuenteFinanciamientoService.actualizar(id,req.body);
      res.status(201).json(fuenteDeFinanciamiento);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
    async eliminar(req, res) {
    try {
      const id = req.params;
      await FuenteFinanciamientoService.eliminar(id);
      res.status(204).send;
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
  

};
