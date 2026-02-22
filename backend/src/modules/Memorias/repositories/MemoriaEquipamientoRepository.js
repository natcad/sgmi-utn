// backend/src/modules/memorias/infrastructure/MemoriaEquipamientoRepository.js
import db from "../../../models/db.js";

const { MemoriaEquipamiento, Memoria, Equipamiento } = db.models;

export const MemoriaEquipamientoRepository = {
  async findByMemoria(idMemoria) {
    return await MemoriaEquipamiento.findAll({
      where: { idMemoria },
      include: [
        {
          model: Equipamiento,
          as: "equipamiento",
        },
      ],
      order: [["id", "ASC"]],
    });
  },

  async addEquipo(data, transaction) {
    return await MemoriaEquipamiento.create(data, { transaction });
  },

  async updateEquipo(id, data, transaction) {
    const row = await MemoriaEquipamiento.findByPk(id);
    if (!row) return null;
    return await row.update(data, { transaction });
  },

  async removeEquipo(id, transaction) {
    const row = await MemoriaEquipamiento.findByPk(id);
    if (!row) return null;
    await row.destroy({ transaction });
    return true;
  },

  async removeAllByMemoria(idMemoria, transaction) {
    await MemoriaEquipamiento.destroy({
      where: { idMemoria },
      transaction,
    });
  },
};
