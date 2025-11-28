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
    organigramaUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    organigramaPublicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    presupuesto: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    siglas: {
      type: DataTypes.STRING(45),
    },

    // Claves foráneas

    idFacultadRegional: {
      type: DataTypes.INTEGER,
      allowNull: true, // O false si es obligatoria
    },

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
  GrupoInvestigacion.belongsTo(models.Personal, {
    as: "director",
    foreignKey: "idDirector",
  });

  GrupoInvestigacion.belongsTo(models.Personal, {
    as: "vicedirector",
    foreignKey: "idVicedirector",
  });

  GrupoInvestigacion.belongsTo(models.FuenteFinanciamiento, {
    as: "fuenteFinanciamiento",
    foreignKey: "idFuenteDeFinanciamiento",
  });

  GrupoInvestigacion.belongsTo(models.FacultadRegional, {
    as: "faculRegional",
    foreignKey: "idFacultadRegional",
  });

  GrupoInvestigacion.hasMany(models.Personal, {
    as: "personal",
    foreignKey: "grupoId",
  });
};

// Tiene muchos Equipamientos
// GrupoInvestigacion.hasMany(models.Equipamiento, {
//   as: "equipamiento",
//   foreignKey: "GrupoInvestigacion_id",
// });

export default GrupoInvestigacion;
