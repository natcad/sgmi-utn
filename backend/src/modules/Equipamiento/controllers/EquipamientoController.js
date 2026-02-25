import { EquipamientoService } from "../services/EquipamientoService.js";
import db from "../../../models/db.js";

const { Personal, Usuario } = db.models;

export const EquipamientoController = {
  async listar(req, res) {
    try {
      const user = req.user;
      const filters = {
        search: req.query.search || undefined,
        grupoId: undefined,
      };
      if (user.rol !== "admin") {
        let resolvedGrupoId = user.grupoId;

        if (!resolvedGrupoId && user.personalId) {
          const personal = await Personal.findByPk(user.personalId);
          resolvedGrupoId = personal?.grupoId ?? undefined;
        }

        if (!resolvedGrupoId && user.id) {
          const personal = await Personal.findOne({
            where: { usuarioId: user.id },
          });
          resolvedGrupoId = personal?.grupoId ?? undefined;
        }

        if (!resolvedGrupoId && user.id) {
          const usuario = await Usuario.findByPk(user.id);
          if (usuario?.personalId) {
            const personal = await Personal.findByPk(usuario.personalId);
            resolvedGrupoId = personal?.grupoId ?? undefined;
          }
        }

        if (!resolvedGrupoId) {
          return res.status(200).json([]);
        }

        filters.grupoId = resolvedGrupoId;
      } else {
        if (req.query.grupoId) {
          filters.grupoId = Number(req.query.grupoId);
        }
      }
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
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const equipamientoActualizado = await EquipamientoService.actualizar(
        id,
        data
      );
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
  },
  async resumen(req, res) {
    try {
      // 1. Atrapamos el parámetro 'search' que manda el frontend
      const { search } = req.query;
      
      // 2. Se lo pasamos al Servicio de Equipamiento
      const data = await EquipamientoService.resumen(search);
      
      return res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
