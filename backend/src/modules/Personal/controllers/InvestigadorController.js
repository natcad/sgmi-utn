import { InvestigadorService } from "../services/InvestigadorService.js";
import { Personal } from "../models/Personal.js";
///
export const InvestigadorController = {
  async crearInvestigador(req, res) {
    try {
      const datos = req.body;
      const nuevo = await InvestigadorService.crear(datos);
      await Personal.update(
        { objectType: "investigador" },
        { where: { id: datos.personalId } }
      );

      res.status(201).json(nuevo);
    } catch (error) {
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
