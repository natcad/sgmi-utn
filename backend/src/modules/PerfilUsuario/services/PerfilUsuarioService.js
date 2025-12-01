import { PerfilUsuarioRepository } from "../repositories/PerfilUsuarioRepository.js";
import sequelize from "../../../config/database.js";

export const PerfilUsuarioService = {
  // Obtener todos los perfiles con filtros opcionales
  obtenerTodos: async (filters = {}) => {
    return await PerfilUsuarioRepository.findAll(filters);
  },

  // Obtener perfil por ID
  obtenerPorId: async (id) => {
    const perfil = await PerfilUsuarioRepository.findById(id);
    if (!perfil) {
      throw new Error("Perfil de usuario no encontrado");
    }
    return perfil;
  },

  // Obtener perfil por usuarioId
  obtenerPorUsuarioId: async (usuarioId) => {
    const perfil = await PerfilUsuarioRepository.findByUsuarioId(usuarioId);
    if (!perfil) {
      throw new Error("Perfil de usuario no encontrado");
    }
    return perfil;
  },

  // Crear nuevo perfil
  crear: async (data, transaction = null) => {
    const t = transaction || await sequelize.transaction();
    try {
      // Verificar si ya existe un perfil para este usuario
      const perfilExistente = await PerfilUsuarioRepository.findByUsuarioId(data.usuarioId);
      if (perfilExistente) {
        throw new Error("Ya existe un perfil para este usuario");
      }

      const perfil = await PerfilUsuarioRepository.create(data, t);
      
      if (!transaction) await t.commit();
      
      // Recargar con relaciones
      return await PerfilUsuarioRepository.findById(perfil.id);
    } catch (error) {
      if (!transaction) await t.rollback();
      throw error;
    }
  },

  // Actualizar perfil
  actualizar: async (id, data, transaction = null) => {
    const t = transaction || await sequelize.transaction();
    try {
      const perfil = await PerfilUsuarioRepository.findById(id);
      if (!perfil) {
        throw new Error("Perfil de usuario no encontrado");
      }

      await PerfilUsuarioRepository.update(id, data, t);
      
      if (!transaction) await t.commit();
      
      // Recargar con relaciones
      return await PerfilUsuarioRepository.findById(id);
    } catch (error) {
      if (!transaction) await t.rollback();
      throw error;
    }
  },

  // Actualizar o crear perfil (upsert) por usuarioId
  actualizarOCrearPorUsuarioId: async (usuarioId, data, transaction = null) => {
    const t = transaction || await sequelize.transaction();
    try {
      const perfilExistente = await PerfilUsuarioRepository.findByUsuarioId(usuarioId);
      
      if (perfilExistente) {
        // Actualizar perfil existente
        await PerfilUsuarioRepository.update(perfilExistente.id, data, t);
        if (!transaction) await t.commit();
        return await PerfilUsuarioRepository.findById(perfilExistente.id);
      } else {
        // Crear nuevo perfil
        const nuevoPerfil = await PerfilUsuarioRepository.create(
          { ...data, usuarioId },
          t
        );
        if (!transaction) await t.commit();
        return await PerfilUsuarioRepository.findById(nuevoPerfil.id);
      }
    } catch (error) {
      if (!transaction) await t.rollback();
      throw error;
    }
  },

  // Eliminar perfil
  eliminar: async (id) => {
    const perfil = await PerfilUsuarioRepository.findById(id);
    if (!perfil) {
      throw new Error("Perfil de usuario no encontrado");
    }
    return await PerfilUsuarioRepository.delete(id);
  },
};

