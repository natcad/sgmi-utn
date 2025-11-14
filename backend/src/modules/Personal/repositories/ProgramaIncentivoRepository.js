import { Investigador } from "../models/Investigador";
import { ProgramaIncentivo } from "../models/ProgramaIncentivo";
import { GrupoInvestigacion } from "../../Grupos/grupos.models.cjs";
import { Personal } from "../models/Personal";
import { Usuario } from "../../Usuarios/models/Usuario";
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
          as: "investigador",
          include: [
            {
              model: Personal,
              include: [
                {
                  model: Usuario,
                  as: "usuario",
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
          as: "investigador",
          include: [
            {
              model: Personal,
              include: [
                {
                  model: Usuario,
                  as: "usuario",
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
