import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js"// Importamos la instancia de Sequelize desde db.js

export const FacultadRegional = sequelize.define(
  "FacultadRegional",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    localidad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "FacultadRegional", // Nombre exacto de la tabla en la BD
    timestamps: false, // Si tu tabla no usa createdAt/updatedAt
  }
);

export default FacultadRegional;