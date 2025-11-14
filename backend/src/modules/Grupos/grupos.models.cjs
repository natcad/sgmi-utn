

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class GrupoInvestigacion extends Model {
    
    static associate(models) {

      // --- Relaciones "Pertenece a"  ---
      this.belongsTo(models.FacultadRegional, {
        as: 'facultadRegional',
        foreignKey: 'idFacultadRegional',
      });

      // Relaciones con Personal (Director/Vicedirector)
      this.belongsTo(models.Personal, {
        as: 'director',
        foreignKey: 'idDirector',
      });

      this.belongsTo(models.Personal, {
        as: 'vicedirector',
        foreignKey: 'idVicedirector',
      });

      this.belongsTo(models.FuenteDeFinanciamiento, {
        as: 'fuenteDeFinanciamiento',
        foreignKey: 'idFuenteDeFinanciamiento',
      });

      // --- Relaciones "Tiene muchos" ---

      //Un Grupo tiene muchos Personal
      this.hasMany(models.Personal, {
        as: 'personal',
        foreignKey: 'grupoId', // FK en la tabla Personal
      });

      //Un Grupo tiene muchos Equipamientos
      // this.hasMany(models.Equipamiento, {
      //   as: 'equipamiento',
      //   foreignKey: 'GrupoInvestigacion_id', // FK en la tabla Equipamiento
      // });
    }
  }

  // init() define las columnas de la tabla
  GrupoInvestigacion.init({
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
      type: DataTypes.STRING, // Ruta al archivo Excel/PDF
    },
    siglas: {
      type: DataTypes.STRING(45),
    },
    // Llaves foráneas
    idFacultadRegional: DataTypes.INTEGER,
    idDirector: DataTypes.INTEGER,
    idVicedirector: DataTypes.INTEGER,
    idFuenteDeFinanciamiento: DataTypes.INTEGER,

  }, {
    sequelize,
    modelName: 'GrupoInvestigacion',
    tableName: 'GrupoInvestigacion',
    timestamps: false,
  });

  return GrupoInvestigacion;
};