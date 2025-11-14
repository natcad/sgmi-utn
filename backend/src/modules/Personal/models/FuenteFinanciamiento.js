import { DataTypes } from "sequelize";
import sequelize from "../../../config/database";

export const FuenteFinanciamiento = sequelize.define("FuenteFinanciamiento", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
  },
  enFormacionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "EnFormacion",
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
},{
    tableName: "FuenteFinanciamiento",
    timestamps: true,});
