import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";
import { Investigador } from "./Investigador.js";

export const EnFormacion = sequelize.define(
  "EnFormacion",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    personalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "Personal", key: "id" },
      onDelete: "CASCADE",
    },
    tipoFormacion: {
      type: DataTypes.ENUM(
        "Doctorado",
        "Maestría/ Especialización",
        "Becario Graduado",
        "Becario Alumno",
        "Pasante",
        "Tesis"
      ),
      allowNull: false,
    },
  },
  {
    tableName: "EnFormacion",
    timestamps: true,
    hooks: {
      beforeCreate: async (usuario) => {
        const yaEnFormacion = await EnFormacion.findOne({
          where: { personalId: usuario.personalId },
        });
        if (yaEnFormacion) {
          throw new Error("Este usuario ya está registrado como En Formacion");
        }

        const yaInvestigador = await Investigador.findOne({
          where: { personalId: usuario.personalId },
        });
        if (yaInvestigador) {
          throw new Error("Este usuario ya está registrado como Investigador");
        }
      },
    },
  }
);
