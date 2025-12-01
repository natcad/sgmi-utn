import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";

export const PerfilUsuario = sequelize.define(
  "PerfilUsuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Usuarios",
        key: "id",
      },
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
  },
  {
    tableName: "PerfilUsuarios",
    timestamps: true,
  }
);

PerfilUsuario.associate = (models) => {
  PerfilUsuario.belongsTo(models.Usuario, {
    foreignKey: "usuarioId",
    onDelete: "CASCADE",
    as: "Usuario",
  });
};

