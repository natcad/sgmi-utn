import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";

export const FuenteFinanciamiento = sequelize.define(
  "FuenteFinanciamiento",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    enFormacionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "EnFormacion",
        key: "id",
      },
    },
    grupoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "GrupoInvestigacion",
        key: "id",
      },
    },
    organismo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    monto: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "FuenteFinanciamiento",
    timestamps: true,
    validate: {
      tieneDestino() {
        if (!this.enFormacionId && !this.grupoId) {
          throw new Error(
            "La fuente de financiamiento debe estar asociada a un grupo o a un integrante en formación"
          );
        }
      },
    },
  }
);
FuenteFinanciamiento.associate = (models) => {
  FuenteFinanciamiento.belongsTo(models.EnFormacion, {
    foreignKey: "enFormacionId",
    as: "enFormacion",
  });
  FuenteFinanciamiento.belongsTo(models.GrupoInvestigacion, {
    foreignKey: "grupoId",
    as: "grupo",
  });
};
