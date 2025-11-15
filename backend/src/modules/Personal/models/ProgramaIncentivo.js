import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js"

export const ProgramaIncentivo = sequelize.define("ProgramaIncentivo", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey:true,
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
