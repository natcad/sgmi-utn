import { DataTypes } from "sequelize";
import sequelize from "../../../config/database";

export const ProgramaIncentivo = sequelize.define("ProgramaIncentivo", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull:false,
  },
  fechaVencimiento: {
    type: DataTypes.DATE,
    allowNull:false
  }
},{
    tableName: "ProgramaIncentivo",
    timestamps: true,});
