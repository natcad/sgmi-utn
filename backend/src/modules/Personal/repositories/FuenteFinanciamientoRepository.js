import { Usuario } from "../../Usuarios/models/Usuario.js";
import sequelize from "../../../config/database.js";
import { EnFormacion } from "../models/EnFormacion.js";
import { FuenteFinanciamiento } from "../models/FuenteFinanciamiento.js";
import { Personal } from "../models/Personal.js";
import getGrupoInvestigacion from "../../Grupos/grupos.models.cjs";
const GrupoInvestigacion = getGrupoInvestigacion(sequelize);


export const FuenteFinanciamientoRepository = {
    async findAll(filters ={}) {
        const where= {};
        if (filters.enFormacionId){
            where.enFormacionId=filters.enFormacionId;
        }
        if (filters.organismo){
            where.organismo=filters.organismo;
        }

        return await FuenteFinanciamiento.findAll({
            where:where,
            include:[
              {model:EnFormacion, as: "en Formacion",
                include:[
                {model: Personal, include: [
                    {model:Usuario, as: "Usuario", attributes:["nombre", "apellido", "email"]},
                    {model: GrupoInvestigacion, as:"grupo"}
                ]}
              ],}   
            ]

        })
    },
    async findById(id){
        return await FuenteFinanciamiento.findByPk(id,{include:[
              {model:EnFormacion, as: "en Formacion",
                include:[
                {model: Personal, include: [
                    {model:Usuario, as: "Usuario", attributes:["nombre", "apellido", "email"]},
                    {model: GrupoInvestigacion, as:"grupo"}
                ]}
              ],}   
            ]

        })
    },
    async create(data){
        return await FuenteFinanciamiento.create(data);
      },
      async update(id,updates){
        const fuente = await FuenteFinanciamiento.findByPk(id);
        if(!fuente) throw new Error("Fuente de financiamiento no encontrado");
        return await fuente.update(updates);
      },
      async delete(id){
        const fuente = await FuenteFinanciamiento.findByPk(id);
        if(!fuente) throw new Error("Fuente de financiamiento no encontrado");
        return await fuente.destroy();
      }

}