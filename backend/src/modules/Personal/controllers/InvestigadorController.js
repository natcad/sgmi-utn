import { InvestigadorService } from "../services/InvestigadorService.js";
import { Personal } from "../models/Personal.js";
import sequelize from "../../../config/database.js";

export const InvestigadorController = {
  async crearInvestigador(req, res) {
    const t = await sequelize.transaction();
    try {
      const datos = req.body;
      const nuevo = await InvestigadorService.crear(datos, t);
      const personal = await Personal.findByPk(datos.personalId, {
        transaction: t,
      });
      if (!personal) {
        throw new Error("El personalId no existe");
      }
      const updated = await Personal.update(
        { OjectType: "investigador" },
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
  async listarInvestigadores(req, res) {
    try {
      const {
        search,
        grupoId,
        nivelDeFormacion,
        rol,
        emailInstitucional,
        categoriaUTN,
        dedicacion,
      } = req.query;

      const filtros = {
        search,
        grupoId,
        nivelDeFormacion,
        rol,
        emailInstitucional,
        categoriaUTN,
        dedicacion,
      };
      const investigadores = await InvestigadorService.listar(filtros);
      res.status(200).json(investigadores);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const id = req.params;
      const investigador = await InvestigadorService.obtenerPorId(id);
      if (!investigador)
        return res.status(404).json({ mensaje: "Investigador no encontrado" });
      res.status(201).json(investigador);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
  async actualizar(req, res) {
    try {
      const id = req.params;
      const investigador = await InvestigadorService.actualizar(id, req.body);
      res.status(201).json(investigador);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
  async eliminar(req, res) {
    try {
      const id = req.params;
      await InvestigadorService.eliminar(id);
      res.status(204).send;
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  },
};
