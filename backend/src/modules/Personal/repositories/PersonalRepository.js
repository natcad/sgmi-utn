import { Op } from "sequelize";
import sequelize from "../../../config/database.js";
import { Personal } from "../models/Personal.js";
import { Usuario } from "../../Usuarios/models/Usuario.js";
import { Investigador } from "../models/Investigador.js";
import { EnFormacion } from "../models/EnFormacion.js";
import getGrupoInvestigacion from "../../Grupos/grupos.models.cjs";
const GrupoInvestigacion = getGrupoInvestigacion(sequelize);

export const PersonalRepository = {
  //busca con filtros tanto especificos de personal como los de usuario
  //trae los datos de personal como los datos relevantes de usuario
  async findAll(filters = {}) {
    const whereUsuario = {};
    const wherePersonal = {};
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
    return await Personal.findAll({
      where: wherePersonal,
      include: [
        {
          model: Usuario,
          as: "Usuario",
          where: Object.keys(whereUsuario).length ? whereUsuario : undefined,
          attributes: ["nombre", "apellido", "email"],
        },
        { model: GrupoInvestigacion, as: "grupo" },
        { model: Investigador, as: "Investigador", required: false },
      { model: EnFormacion, as: "EnFormacion", required: false },
      ],
    });
  },
  async findById(id){
    return await Personal.findByPk(id,{
        include:[
            {model: Usuario, as: "Usuario", attributes:["nombre", "apellido", "email"]},
            {model: GrupoInvestigacion, as: "grupo"}
        ]
    })
  },
  async create(data){
    return await Personal.create(data);
  },
  async update(id,updates){
    const personal = await Personal.findByPk(id);
    if(!personal) throw new Error("personal no encontrado");
    return await personal.update(updates);
  },

  async delete(id){
    const personal = await Personal.findByPk(id);
    if(!personal) throw new Error("personal no encontrado");
    return await personal.destroy();
  }

};
