import { EnFormacionService } from "../services/EnFormacionService.js";
import { Personal } from "../models/Personal.js";
import sequelize from "../../../config/database.js";

export const EnFormacionController = {
  async crear(req, res) {
    const t = await sequelize.transaction();
    try {
      const datos = req.body;
      const nuevo = await EnFormacionService.crear(datos, t);
      const personal = await Personal.findByPk(datos.personalId, {
        transaction: t,
      });
      if (!personal) {
        throw new Error("El personalId no existe");
      }
      const updated = await Personal.update(
        { ObjectType: "en formacion" },
        { where: { id: datos.personalId }, transaction: t }
      );
      if (updated[0] === 0) {
        throw new Error("no se pudo actualizar el tipo de personal");
      }
      await t.commit();
      res.status(201).json(nuevo);
    } catch (error) {
      await t.rollback();
      res.status(500).json({ mensaje: error.message });
    }
  },
  async listar(req, res) {
    try {
      const enFormacion = await EnFormacionService.listar();
      res.status(200).json(enFormacion);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const id = req.params;
      const enFormacion = await EnFormacionService.obtenerPorId(id);
      if (!enFormacion)
        return res
          .status(404)
          .json({ mensaje: "Personal en Formacion no encontrado" });
      res.status(201).json(enFormacion);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
  async actualizar(req, res) {
    try {
      const id = req.params;
      const enFormacion = await EnFormacionService.actualizar(id, req.body);
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
