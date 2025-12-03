import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";

export const MemoriaPersonal = sequelize.define(
  "MemoriaPersonal",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    idMemoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Memorias",
        key: "id",
      },
    },

    idPersonal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Personal",
        key: "id",
      },
    },

    rolEnGrupo: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    horasSemanales: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },

    dedicacion: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    categoriaUTN: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    tipoFormacion: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "MemoriaPersonal",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["idMemoria", "idPersonal"],
      },
      {
        fields: ["idMemoria"],
      },
      {
        fields: ["idPersonal"],
      },
    ],
  }
);

MemoriaPersonal.associate = (models) => {
  MemoriaPersonal.belongsTo(models.Memoria, {
    as: "memoria",
    foreignKey: "idMemoria",
  });

  MemoriaPersonal.belongsTo(models.Personal, {
    as: "personal",
    foreignKey: "idPersonal",
  });
};
