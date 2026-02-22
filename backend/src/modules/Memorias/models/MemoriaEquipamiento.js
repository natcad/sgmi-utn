import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";

export const MemoriaEquipamiento = sequelize.define(
  "MemoriaEquipamiento",
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

    idEquipamiento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Equipamiento",
        key: "id",
      },
    },
    denominacion: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    montoInvertido: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    fechaIncorporacion: { type: DataTypes.DATEONLY, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "MemoriaEquipamiento",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["idMemoria", "idEquipamiento"],
      },
      {
        fields: ["idMemoria"],
      },
      {
        fields: ["idEquipamiento"],
      },
    ],
  }
);

MemoriaEquipamiento.associate = (models) => {
  MemoriaEquipamiento.belongsTo(models.Memoria, {
    as: "memoria",
    foreignKey: "idMemoria",
  });

  MemoriaEquipamiento.belongsTo(models.Equipamiento, {
    as: "equipamiento",
    foreignKey: "idEquipamiento",
  });
};
