import { PerfilUsuarioService } from "../services/PerfilUsuarioService.js";

export const PerfilUsuarioController = {
  // Obtener todos los perfiles con filtros opcionales
  listar: async (req, res) => {
    try {
      const filters = {
        usuarioId: req.query.usuarioId || undefined,
      };
      const perfiles = await PerfilUsuarioService.obtenerTodos(filters);
      res.status(200).json(perfiles);
    } catch (error) {
      console.error("Error en listar:", error);
      res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
  },

  // Obtener perfil por ID
  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const perfil = await PerfilUsuarioService.obtenerPorId(id);
      res.status(200).json(perfil);
    } catch (error) {
      console.error("Error en buscarPorId:", error);
      if (error.message === "Perfil de usuario no encontrado") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
  },

  // Obtener perfil por usuarioId
  buscarPorUsuarioId: async (req, res) => {
    try {
      const { usuarioId } = req.params;
      const perfil = await PerfilUsuarioService.obtenerPorUsuarioId(usuarioId);
      res.status(200).json(perfil);
    } catch (error) {
      console.error("Error en buscarPorUsuarioId:", error);
      if (error.message === "Perfil de usuario no encontrado") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
  },

  // Crear nuevo perfil
  crear: async (req, res) => {
    try {
      const perfil = await PerfilUsuarioService.crear(req.body);
      res.status(201).json(perfil);
    } catch (error) {
      console.error("Error en crear:", error);
      if (error.message === "Ya existe un perfil para este usuario") {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
  },

  // Actualizar perfil
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const perfil = await PerfilUsuarioService.actualizar(id, req.body);
      res.status(200).json(perfil);
    } catch (error) {
      console.error("Error en actualizar:", error);
      if (error.message === "Perfil de usuario no encontrado") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
  },

  // Actualizar o crear perfil por usuarioId
  actualizarOCrearPorUsuarioId: async (req, res) => {
    try {
      const { usuarioId } = req.params;
      const perfil = await PerfilUsuarioService.actualizarOCrearPorUsuarioId(
        usuarioId,
        req.body
      );
      res.status(200).json(perfil);
    } catch (error) {
      console.error("Error en actualizarOCrearPorUsuarioId:", error);
      res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
  },

  // Eliminar perfil
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      await PerfilUsuarioService.eliminar(id);
      res.status(200).json({ message: "Perfil eliminado correctamente" });
    } catch (error) {
      console.error("Error en eliminar:", error);
      if (error.message === "Perfil de usuario no encontrado") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
  },
};

