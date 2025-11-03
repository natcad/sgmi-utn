//UsuarioController.js
import { UsuarioService } from "../services/UsuarioService.js";
export const UsuarioController = {
  // Obtener todos los usuarios con filtros opcionales
  getAll: async (req, res) => {
    try {
      const filters = {
        rol: req.query.rol,
        activo: req.query.activo
          ? true
          : req.query.activo === "false"
          ? false
          : undefined,
        search: req.query.search || undefined,
      };
      const usuarios = await UsuarioService.getAll(filters);
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Obtener un usuario por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = await UsuarioService.getById(id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Actualizar un usuario por ID
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const usuarioActualizado = await UsuarioService.update(id, data);
      res.json(usuarioActualizado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Eliminar (desactivar) un usuario por ID
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const usuarioEliminado = await UsuarioService.delete(id);
      res.json(usuarioEliminado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Restaurar (activar) un usuario por ID
  restore: async (req, res) => {
    try {
      const { id } = req.params;
      const usuarioRestaurado = await UsuarioService.restore(id);
      res.json(usuarioRestaurado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Obtener un usuario por email
  getByEmail: async (req, res) => {
    try {
      const { email } = req.params;
      const usuario = await UsuarioService.getByEmail(email);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener un usuario por ID con perfil asociado
  getWithProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = await UsuarioService.getWithProfile(id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
