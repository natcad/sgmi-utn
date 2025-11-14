import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";

export const Personal = sequelize.define(
  "Personal",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,

    },
    emailInstitucional: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    horasSemanales: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ObjectType: {
      type: DataTypes.ENUM("personal", "investigador", "en formación"),
      allowNull: false,
      defaultValue: "personal",
    },
    rol: {
      type: DataTypes.ENUM(
        "Investigador",
        "Personal Profesional",
        "Personal Técnico",
        "Personal Administrativo",
        "Personal de Apoyo",
        "Personal en Formación"
      ),
      allowNull: false,
    },
    nivelDeFormacion: {
      type: DataTypes.ENUM(
        "Doctorado",
        "Maestría/ Especialización",
        "de Grado Superior",
        "Pregrado"
      ),
      allowNull: false,
    },
    grupoId:{
        type:DataTypes.INTEGER,
        allowNull: false,
        references:{model:"GrupoInvestigacion", key:"id"},
        
    }
  },
  { tableName: "Personal", timestamps: true }
);
