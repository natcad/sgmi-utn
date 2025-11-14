import { Op } from "sequelize";
import { Personal } from "../models/Personal";
import { Usuario } from "../../Usuarios/models/Usuario";
import { GrupoInvestigacion } from "../../Grupos/grupos.models.cjs";

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
          as: "usuario",
          where: Object.keys(whereUsuario).length ? whereUsuario : undefined,
          attributes: ["nombre", "apellido", "email"],
        },
        { model: GrupoInvestigacion, as: "grupo" },
      ],
    });
  },
  async findById(id){
    return await Personal.findByPk(id,{
        include:[
            {model: Usuario, as: "usuario", attributes:["nombre", "apellido", "email"]},
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
