
import db from "../../../models/db.js";

const { Investigador, ProgramaIncentivo, Personal, Usuario, GrupoInvestigacion } = db.models;

export const ProgramaIncentivoRespository = {

  async findAll(filter = {}) {
    const where = {};
    if (filter.estado) {
      where.estado = filter.estado;
    }
    return await ProgramaIncentivo.findAll({
      where: where,
      include: [
        {
          model: Investigador,
          as: "Investigador",
          include: [
            {
              model: Personal,
              include: [
                {
                  model: Usuario,
                  as: "Usuario",
                  attributes: ["nombre", "apellido", "email"],
                },
                { model: GrupoInvestigacion, as: "grupo" },
              ],
            },
          ],
        },
      ],
    });
  },
  async findById(id) {
    return await ProgramaIncentivo.findByPk(id, {
      include: [
        {
          model: Investigador,
          as: "Investigador",
          include: [
            {
              model: Personal,
              include: [
                {
                  model: Usuario,
                  as: "Usuario",
                  attributes: ["nombre", "apellido", "email"],
                },
                { model: GrupoInvestigacion, as: "grupo" },
              ],
            },
          ],
        },
      ],
    });
  },
  async create(data){
    return await ProgramaIncentivo.create(data);
  },
  async update(id,updates){
    const programa = await ProgramaIncentivo.findByPk(id);
    if(!programa) throw new Error("Programa de incentivo no encontrado");
    return await programa.update(updates);
  },
  async delete(id){
    const programa = await ProgramaIncentivo.findByPk(id);
    if(!programa) throw new Error("Programa de incentivo no encontrado");
    return await programa.destroy();
  }
};
