import { Op } from "sequelize";
import sequelize from "../../../config/database.js";

import { Investigador } from "../models/Investigador.js";
import { Usuario } from "../../Usuarios/models/Usuario.js";
import { Personal } from "../models/Personal.js";
import { ProgramaIncentivo } from "../models/ProgramaIncentivo.js";
import getGrupoInvestigacion from "../../Grupos/grupos.models.cjs";
const GrupoInvestigacion = getGrupoInvestigacion(sequelize);

export const InvestigadorRepository = {
  async findAll(filters = {}) {
    const whereInvestigador = {};
    const wherePersonal = {};
    const whereUsuario = {};
    if (filters.search) {
      whereUsuario[Op.or] = [
        { nombre: { [Op.line]: `%${filters.search}%` } },
        { apellido: { [Op.line]: `%${filters.search}%` } },
        { email: { [Op.line]: `%${filters.search}%` } },
      ];
    }

    if (filters.grupoId) {
      wherePersonal.grupoId = filters.grupoId;
    }
    if (filters.nivelDeFormacion) {
      wherePersonal.nivelDeFormacion = filters.nivelDeFormacion;
    }
    if (filters.rol) {
      wherePersonal.rol = filters.rol;
    }
    if (filters.emailInstitucional) {
      wherePersonal.emailInstitucional = filters.emailInstitucional;
    }
    if (filters.categoriaUTN) {
      whereInvestigador.categoriaUTN = filters.categoriaUTN;
    }
    if (filters.dedicacion) {
      whereInvestigador.dedicacion = filters.dedicacion;
    }
    return await Investigador.findAll({
      where: whereInvestigador,
      include: [
        {
          model: Personal,
          where: wherePersonal,
          include: [
            {
              model: Usuario,
              as: "Usuario",
              where: Object.keys(whereUsuario).length
                ? whereUsuario
                : undefined,
              attributes: ["nombre", "apellido", "email"],
            },
            { model: GrupoInvestigacion, as: "grupo" },
          ],
        },
        { model: ProgramaIncentivo, as: "ProgramaIncentivo" },
      ],
    });
  },
  async findById(id) {
    return await Investigador.findByPk(id, {
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
        { model: ProgramaIncentivo, as: "ProgramaIncentivo" },
      ],
    });
  },
  async create(data) {
    return await Investigador.create(data);
  },
  async update(id, updates) {
    const investigador = await Investigador.findByPk(id);
    if (!investigador) throw new Error("investigador no encontrado");
    return await investigador.update(updates);
  },

  async delete(id) {
    const investigador = await Investigador.findByPk(id);
    if (!investigador) throw new Error("investigador no encontrado");
    return await investigador.destroy();
  },
};
