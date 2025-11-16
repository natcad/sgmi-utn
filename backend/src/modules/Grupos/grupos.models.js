import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

export const GrupoInvestigacion = sequelize.define(
  "GrupoInvestigacion",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(45),
      unique: true,
    },
    objetivo: {
      type: DataTypes.STRING(45),
    },
    organigrama: {
      type: DataTypes.STRING, // ruta archivo excel/pdf
    },
    presupuesto: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    siglas: {
      type: DataTypes.STRING(45),
    },

    // Claves foráneas
    idDirector: {
      type: DataTypes.INTEGER,
    },
    idVicedirector: {
      type: DataTypes.INTEGER,
    },
    idFuenteDeFinanciamiento: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "GrupoInvestigacion",
    timestamps: false,
  }
);

// ===========================
//    ASOCIACIONES
// ===========================
GrupoInvestigacion.associate = (models) => {
  // Pertenece a Director
  GrupoInvestigacion.belongsTo(models.Personal, {
    as: "director",
    foreignKey: "idDirector",
  });

  // Pertenece a Vicedirector
  GrupoInvestigacion.belongsTo(models.Personal, {
    as: "vicedirector",
    foreignKey: "idVicedirector",
  });

  // Pertenece a Fuente de Financiamiento
  GrupoInvestigacion.belongsTo(models.FuenteFinanciamiento, {
    as: "fuenteFinanciamiento",
    foreignKey: "idFuenteDeFinanciamiento",
  });

  // Tiene muchos Personal
  GrupoInvestigacion.hasMany(models.Personal, {
    as: "personal",
    foreignKey: "grupoId",
  });

  // Tiene muchos Equipamientos
  // GrupoInvestigacion.hasMany(models.Equipamiento, {
  //   as: "equipamiento",
  //   foreignKey: "GrupoInvestigacion_id",
  // });
};

export default GrupoInvestigacion;
