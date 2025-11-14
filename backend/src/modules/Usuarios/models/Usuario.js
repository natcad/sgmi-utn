//Usuario.js
//importo herramientas de sequelize y la conexión a la base de datos
import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";
//importo bcryptjs para hashear contraseñas y jsonwebtoken para manejar tokens
import bcytpt from "bcryptjs";

// Modelo de Usuario
//representa la tabla "usuarios" en la base de datos
export const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    personalId:{
      type:DataTypes.INTEGER,
      allowNull:true,
      unique:true,
    },
    //rol del usuario: puede ser 'admin' o 'integrante'
    //si es admin, puede gestionar todos los aspectos del sistema
    //si es integrante, tiene permisos limitados, solo gestiona sus propio grupo
    rol: {
      type: DataTypes.ENUM("admin", "integrante"),
      allowNull: false,
      defaultValue: "integrante",
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,},
  },
  {
    tableName: "Usuarios",
    timestamps: true,
    // Excluir el campo password por defecto en las consultas
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    hooks: {
      // Antes de crear un usuario, hashear la contraseña
      beforeCreate: async (usuario) => {
        if (usuario.password) usuario.password = await bcytpt.hash(usuario.password, 10);
      },
        // Antes de actualizar un usuario, hashear la nueva contraseña si se proporciona    
        beforeUpdate: async (usuario) => {
            if (usuario.changed("password")&& usuario.password) usuario.password = await bcytpt.hash(usuario.password, 10);
        },
    },
  }
);
