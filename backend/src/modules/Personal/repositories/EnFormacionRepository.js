import { Op } from "sequelize";
import sequelize from "../../../config/database.js";
import { EnFormacion } from "../models/EnFormacion.js";
import { Usuario } from "../../Usuarios/models/Usuario.js";
import { Personal } from "../models/Personal.js";
import { FuenteFinanciamiento } from "../models/FuenteFinanciamiento.js";
import getGrupoInvestigacion from "../../Grupos/grupos.models.cjs";
const GrupoInvestigacion = getGrupoInvestigacion(sequelize);

export const EnFormacionRepository = {
  async findAll(filters = {}) {
    const whereEnFormacion = {};
    const wherePersonal = {};
    const whereUsuario = {};

    if (filters.search) {
      whereUsuario[Op.or] = [
        { nombre: { [Op.line]: `%${filters.search}%` } },
        { apellido: { [Op.line]: `%${filters.search}%` } },
        { email: { [Op.line]: `%${filters.search}%` } },
      ];
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
      if (filters.tipoFormacion) {
        whereEnFormacion.tipoFormacion = filters.tipoFormacion;
      }

      return await EnFormacion.findAll({
        where: whereEnFormacion,
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
          {model:FuenteFinanciamiento,
            as: "fuenteFinanciamiento"
          }
        ],

      });
    }
  },
  async findById(id){
    return await EnFormacion.findByPk(id,{
        include:[
            {model:Personal,
                include:[
                    {model:Usuario, as: "Ususario", attributes:["nombre", "apellido", "email"]},
                    {model:GrupoInvestigacion, as:"grupo"}
                ]
            },
             {model:FuenteFinanciamiento,
            as: "FuenteFinanciamiento"
          }
        ]
    })
  },
  async create(data, transaction=null){
    return await EnFormacion.create(data,transaction ? {transaction} : {});
  },
  async update(id,updates){
      const enFormacion = await EnFormacion.findByPk(id);
      if(!enFormacion) throw new Error(" Personal en formacion no encontrado");
      return await enFormacion.update(updates);
    },
  
    async delete(id){
      const enFormacion = await EnFormacion.findByPk(id);
      if(!enFormacion) throw new Error("Personal en formacion no encontrado");
      return await enFormacion.destroy();
    }
};
