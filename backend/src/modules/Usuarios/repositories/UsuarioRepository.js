import { Usuario } from "../models/Usuario.js";

export const UsuarioRepository = {
  //buscar todos los usuarios con filtros opcionales
  findAll: async (filters = {}) => {
    const where = {};
    if (filters.rol) {
      where.rol = filters.rol;
    }
    if (filters.activo !== undefined) {
      where.activo = filters.activo;
    }
    if (filters.search) {
      where[Sequelize.Op.or] = [
        { nombre: { [Sequelize.Op.iLike]: `%${filters.search}%` } },
        { apellido: { [Sequelize.Op.iLike]: `%${filters.search}%` } },
        { email: { [Sequelize.Op.iLike]: `%${filters.search}%` } },
      ];
    }
    return await Usuario.findAll({ where });
  },

  //buscar usuario por id
  findById: async (id) => {
    return await Usuario.findByPk(id);
  },
  //find user by email
  findByEmail: async (email) => {
    return await Usuario.unscoped().findOne({ where: { email } });
  },
  update: async (id, data) => {
    return await Usuario.update(data, { where: { id } });
  },
  delete: async (id) => {
    await Usuario.update({ activo: false }, { where: { id } });
    return await Usuario.findByPk(id);
  },
  restore: async (id) => {
    await Usuario.update({ activo: true }, { where: { id } });
    return await Usuario.findByPk(id);
  },
  findWithProfile: async (id) => {
    return await Usuario.findByPk(id, { include: ["perfilUsuario"] });
  },
   createUser: async (data,transaction=null) => {
        return await Usuario.create(data, transaction ? {transaction}: {});
    },
};
