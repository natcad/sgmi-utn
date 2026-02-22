// backend/src/modules/memorias/infrastructure/MemoriaPersonalRepository.js
import db from "../../../models/db.js";

const { MemoriaPersonal, Memoria, Personal } = db.models;

export const MemoriaPersonalRepository = {
  async findByMemoria(idMemoria) {
    return await MemoriaPersonal.findAll({
      where: { idMemoria },
      include: [
        {
          model: Personal,
          as: "personal",
        },
      ],
      order: [["id", "ASC"]],
    });
  },

  async addIntegrante(data, transaction) {
    return await MemoriaPersonal.create(data, { transaction });
  },

  async updateIntegrante(id, data, transaction) {
    const row = await MemoriaPersonal.findByPk(id);
    if (!row) return null;
    return await row.update(data, { transaction });
  },

  async removeIntegrante(id, transaction) {
    const row = await MemoriaPersonal.findByPk(id);
    if (!row) return null;
    await row.destroy({ transaction });
    return true;
  },

  async removeAllByMemoria(idMemoria, transaction) {
    await MemoriaPersonal.destroy({
      where: { idMemoria },
      transaction,
    });
  },
};
