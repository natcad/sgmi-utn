import { EnFormacionService } from "../services/EnFormacionService.js";
//
export const EnFormacionController = {
  async crear(req, res) {
    try {
      const datos = req.body;
      const nuevo = await EnFormacionService.crear(datos);
      await Personal.update(
              { objectType: "en formacion" },
              { where: { id: datos.personalId } }
            );
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
  async listar(req,res){
    try {
        const enFormacion =await EnFormacionService.listar();
        res.status(200).json(enFormacion);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
  },

   async obtenerPorId(req, res) {
    try {
      const id = req.params;
      const enFormacion = await EnFormacionService.obtenerPorId(id);
      if(!enFormacion) return res.status(404).json({mensaje:"Personal en Formacion no encontrado"});
      res.status(201).json(enFormacion);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
   async actualizar(req, res) {
    try {
      const id = req.params;
      const enFormacion = await EnFormacionService.actualizar(id,req.body);
      res.status(201).json(enFormacion);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
    async eliminar(req, res) {
    try {
      const id = req.params;
      await EnFormacionService.eliminar(id);
      res.status(204).send;
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
  

};
