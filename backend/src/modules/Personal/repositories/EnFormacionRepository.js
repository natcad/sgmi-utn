import { Op } from "sequelize";

import db from "../../../models/db.js"; // adaptá ruta si estás más profundo
const {
  Personal,
  Usuario,
  EnFormacion,
  GrupoInvestigacion,
  FuenteFinanciamiento,
} = db.models;

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
            as:"Personal",
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
            as: "fuentesDeFinanciamiento"
          }
        ],

      });
    }
  },
  async findById(id){
    return await EnFormacion.findByPk(id,{
        include:[
            {model:Personal,
              as:"Personal",
                include:[
                    {model:Usuario, as: "Ususario", attributes:["nombre", "apellido", "email"]},
                    {model:GrupoInvestigacion, as:"grupo"}
                ]
            },
             {model:FuenteFinanciamiento,
            as: "FuentesDeFinanciamiento"
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
