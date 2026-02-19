import db from "../../../models/db.js";

const {
  Memoria,
  GrupoInvestigacion,
  Usuario,
  MemoriaPersonal,
  MemoriaEquipamiento,
  Personal,
  Equipamiento,
  Investigador,
  EnFormacion,
} = db.models;

export const MemoriaRepository = {
  async findById(id, { incluirDetalle = false } = {}) {
    const include = [];
    if (incluirDetalle) {
      include.push(
        { model: GrupoInvestigacion, as: "grupo" },
        { model: Usuario, as: "creador" },
        {
          model: MemoriaPersonal,
          as: "personal",
          include: [
            {
              model: Personal,
              as: "personal",
              include: [
                { model: Investigador, as: "Investigador" },
                { model: EnFormacion, as: "EnFormacion" },
                { model: Usuario, as: "Usuario" },
              ],
            },
          ],
        },
        {
          model: MemoriaEquipamiento,
          as: "equipamiento",
          include: [
            {
              model: Equipamiento,
              as: "equipamiento",
            },
          ],
        }
      );
    }
    return await Memoria.findByPk(id, { include });
  },
  async findAllByGrupo({ grupoId, anio, estado, incluirDetalle = false } = {}) {
    const where = {};

    if (grupoId !== undefined) where.grupoId = grupoId;
    if (anio !== undefined) where.anio = anio;
    if (estado !== undefined) where.estado = estado;

    const include = [];

    if (incluirDetalle) {
      include.push(
        { model: GrupoInvestigacion, as: "grupo" },
        { model: Usuario, as: "creador" }
      );
    }

    return await Memoria.findAll({
      where,
      include,
      order: [
        ["anio", "DESC"],
        ["version", "DESC"],
      ],
    });
  },
  async updateEstado(id, nuevoEstado, transaction) {
    const memoria = await Memoria.findByPk(id,{ transaction });
    if (!memoria) return null;
    return await memoria.update({ estado: nuevoEstado }, { transaction });
  },

  async create(data, transaction) {
    return await Memoria.create(data, { transaction });
  },

  async update(id, data, transaction) {
    const memoria = await Memoria.findByPk(id,{ transaction });
    if (!memoria) return null;
    return await memoria.update(data, { transaction });
  },

  async delete(id, transaction) {
    const memoria = await Memoria.findByPk(id,{ transaction });
    if (!memoria) return null;
    await memoria.destroy({ transaction });
    return true;
  },
};
