import db from "../../../models/db.js";
const { PerfilUsuario, Usuario } = db.models;

export const PerfilUsuarioRepository = {
  // Buscar todos los perfiles de usuario
  findAll: async (filters = {}) => {
    const where = {};
    if (filters.usuarioId) {
      where.usuarioId = filters.usuarioId;
    }
    return await PerfilUsuario.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: "Usuario",
          attributes: ["id", "nombre", "apellido", "email"],
        },
      ],
    });
  },

  // Buscar perfil por ID
  findById: async (id) => {
    return await PerfilUsuario.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "Usuario",
          attributes: ["id", "nombre", "apellido", "email"],
        },
      ],
    });
  },

  // Buscar perfil por usuarioId
  findByUsuarioId: async (usuarioId) => {
    return await PerfilUsuario.findOne({
      where: { usuarioId },
      include: [
        {
          model: Usuario,
          as: "Usuario",
          attributes: ["id", "nombre", "apellido", "email"],
        },
      ],
    });
  },

  // Crear nuevo perfil
  create: async (data, transaction = null) => {
    return await PerfilUsuario.create(data, transaction ? { transaction } : {});
  },

  // Actualizar perfil
  update: async (id, updates, transaction = null) => {
    const perfil = await PerfilUsuario.findByPk(id, {
      transaction,
    });
    if (!perfil) throw new Error("Perfil de usuario no encontrado");
    return await perfil.update(updates, transaction ? { transaction } : {});
  },

  // Eliminar perfil
  delete: async (id, transaction = null) => {
    const perfil = await PerfilUsuario.findByPk(id, transaction ? { transaction } : {});
    if (!perfil) throw new Error("Perfil de usuario no encontrado");
    return await perfil.destroy(transaction ? { transaction } : {});
  },
};

