import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";
import { Usuario } from "./Usuario.js";

export const PerfilUsuario = sequelize.define("PerfilUsuario", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fechaNacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  fotoPerfil: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
