import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";

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
      beforeCreate: async (enFormacion, options) => {
        const models = sequelize.models;

        const yaEnFormacion = await models.EnFormacion.findOne({
          where: { personalId: enFormacion.personalId },
        });
        if (yaEnFormacion) {
          throw new Error("Este usuario ya está registrado como En Formacion");
        }

        const yaInvestigador = await models.Investigador.findOne({
          where: { personalId: enFormacion.personalId },
        });
        if (yaInvestigador) {
          throw new Error("Este usuario ya está registrado como Investigador");
        }
      },
    },
  }
);
EnFormacion.associate = (models) => {
  EnFormacion.belongsTo(models.Personal, {
    foreignKey: "personalId",
    as:"Personal"
  });

  EnFormacion.hasMany(models.FuenteFinanciamiento, {
    foreignKey: "enFormacionId",
    as: "fuentesDeFinanciamiento",
  });
};

