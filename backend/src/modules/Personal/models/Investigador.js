import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";

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
      beforeCreate: async (investigador, options) => {
        const models = sequelize.models;

        const yaExiste = await models.Investigador.findOne({
          where: { personalId: investigador.personalId },
        });

        if (yaExiste) {
          throw new Error("Este usuario ya está registrado como Investigador");
        }

        const yaEnFormacion = await models.EnFormacion.findOne({
          where: { personalId: investigador.personalId },
        });

        if (yaEnFormacion) {
          throw new Error("Este usuario ya está registrado como En Formación");
        }
      },
    },
  }
);
Investigador.associate = (models) => {
  Investigador.belongsTo(models.Personal, {
    foreignKey: "personalId",
    as: "Personal"
  });

  Investigador.belongsTo(models.ProgramaIncentivo, {
    foreignKey: "idIncentivo",
    as: "ProgramaIncentivo",
  });
};
