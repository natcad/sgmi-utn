import { Op } from "sequelize";
import sequelize from "../../../config/database.js";
import db from "../../../models/db.js"; // adaptá ruta si estás más profundo
const {
  Personal,
  Usuario,
  Investigador,
  EnFormacion,
  GrupoInvestigacion,
  FuenteFinanciamiento,
  ProgramaIncentivo,
} = db.models;

export const PersonalRepository = {
  //busca con filtros tanto especificos de personal como los de usuario
  //trae los datos de personal como los datos relevantes de usuario
  async findAll(filters = {}) {
    const whereUsuario = {};
    const wherePersonal = {};
    if (filters.search) {
      whereUsuario[Op.or] = [
        { nombre: { [Op.like]: `%${filters.search}%` } },
        { apellido: { [Op.like]: `%${filters.search}%` } },
        { email: { [Op.like]: `%${filters.search}%` } },
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
    return await Personal.findAll({
      where: wherePersonal,
      include: [
        {
          model: Usuario,
          where: Object.keys(whereUsuario).length ? whereUsuario : undefined,
          attributes: ["nombre", "apellido", "email"],
          as:"Usuario"
        },
        { model: GrupoInvestigacion, as: "grupo" },
        {
          model: Investigador,
          as:"Investigador",
          required: false,
          include: [{ model: ProgramaIncentivo, as:"ProgramaIncentivo", required: false }],
        },
        {
          model: EnFormacion,
          as:"EnFormacion",
          required: false,
          include: [{ model: FuenteFinanciamiento, as:"fuentesDeFinanciamiento", required: false }],
        },
      ],
    });
  },
  async findById(id) {
    return await Personal.findByPk(id, {
      include: [
        {
          model: Usuario,
          as:"Usuario",
          attributes: ["nombre", "apellido", "email"],
        },
        { model: GrupoInvestigacion, as: "grupo" },
        {
          model: Investigador,
          as:"Investigador",
          required: false,
          include: [{ model: ProgramaIncentivo, as: "ProgramaIncentivo",required: false }],
        },
        {
          model: EnFormacion,
          as:"EnFormacion",
          required: false,
          include: [{ model: FuenteFinanciamiento, as: "fuentesDeFinanciamiento",required: false }],
        },
      ],
    });
  },
  async create(data, transaction=null) {
    return await Personal.create(data, transaction ? {transaction}:{});
  },
  async update(id, updates) {
    const personal = await Personal.findByPk(id);
    if (!personal) throw new Error("personal no encontrado");
    return await personal.update(updates);
  },

  async delete(id) {
    const personal = await Personal.findByPk(id);
    if (!personal) throw new Error("personal no encontrado");
    return await personal.destroy();
  },
};
