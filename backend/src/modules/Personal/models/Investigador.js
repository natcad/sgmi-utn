import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";
import { EnFormacion } from "./EnFormacion.js";

export const Investigador = sequelize.define(
  "Investigador",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    personalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "Personal", key: "id"},
      onDelete: "CASCADE",
    },
    categoriaUTN: {
      type: DataTypes.ENUM("A", "B", "C", "D", "E"),
      allowNull: false,
    },
    dedicacion: {
      type: DataTypes.ENUM("Simple", "Semiexclusiva", "Exclusiva"),
    },
    //PROGRAMA DE INCENTIVOS
    idIncentivo:{
        type: DataTypes.INTEGER,
        allowNull:true,
        references: {model: "ProgramaIncentivo", key: "id"}, 
        onDelete:"CASCADE"      
    }
  },
  {
    tableName: "Investigador",
    timestamps: true,
    hooks: {
      beforeCreate: async (usuario) => {
        const yaExiste = await Investigador.findOne({
          where: { personalId: usuario.personalId },
        });
        if (yaExiste) {
          throw new Error("Este usuario ya está registrado como Investigador");
        }
        const yaEnFormacion = await EnFormacion.findOne({
          where: { personalId: usuario.personalId },
        });
        if (yaEnFormacion) {
          throw new Error("Este usuario ya está registrado a En Formación");
        }
      },
    },
  }
);
