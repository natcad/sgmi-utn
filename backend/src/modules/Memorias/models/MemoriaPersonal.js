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
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    idPersonal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Personal",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },

    // ------- SNAPSHOT DE PERSONAL -------

    // cómo estaba clasificado ese año
    ObjectType: {
      type: DataTypes.STRING(100),

      allowNull: true,
    },

    horasSemanales: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    rol: {
      type: DataTypes.STRING(100),

      allowNull: true,
    },

    nivelDeFormacion: {
      type: DataTypes.STRING(100),

      allowNull: true,
    },

    // ------- SNAPSHOT DE INVESTIGADOR (si aplicaba) -------

    categoriaUTN: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    dedicacion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    idIncentivo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "ProgramaIncentivo",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },

    // ------- SNAPSHOT DE EN FORMACION (si aplicaba) -------

    tipoFormacion: {
      type: DataTypes.STRING(100),

      allowNull: true,
    },

    // ------- EXTRA PARA LA MEMORIA -------

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
      { fields: ["idMemoria"] },
      { fields: ["idPersonal"] },
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

  MemoriaPersonal.belongsTo(models.ProgramaIncentivo, {
    as: "programaIncentivo",
    foreignKey: "idIncentivo",
  });
};
