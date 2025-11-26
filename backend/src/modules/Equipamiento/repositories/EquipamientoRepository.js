import { Op } from "sequelize";
import db from "../../../models/db.js";

const { Equipamiento, GrupoInvestigacion } = db.models;

export const EquipamientoRepository = {
  async findAll(filters = {}) {
    const whereEquipamiento = {};
    if (filters.grupoId !== undefined) {
      whereEquipamiento.grupoId = filters.grupoId;
    }
    if (filters.search) {
      whereEquipamiento[Op.or] = [
        { denominacion: { [Op.like]: `%${filters.search}%` } },
        { descripcion: { [Op.like]: `%${filters.search}%` } },
        { fechaIncorporacion: { [Op.like]: `%${filters.search}%` } },
      ];
    }
    return await Equipamiento.findAll({
      where: whereEquipamiento,
      include: [{ model: GrupoInvestigacion, as: "grupo" }],
      order: [["fechaIncorporacion", "DESC"]],
    });
  },

  async findById(id) {
    return await Equipamiento.findByPk(id, {
      include: [{ model: GrupoInvestigacion, as: "grupo" }],
    });
  },

  async create(equipamientoData) {
    return await Equipamiento.create(equipamientoData);
  },

  async update(id, equipamientoData) {
    const equipamiento = await Equipamiento.findByPk(id);
    if (!equipamiento) {
      throw new Error("Equipamiento no encontrado");
    }
    return await equipamiento.update(equipamientoData);
  },

  async delete(id) {
    const equipamiento = await Equipamiento.findByPk(id);
    if (!equipamiento) {
      throw new Error("Equipamiento no encontrado");
    }
    return await equipamiento.destroy();
  },
};
