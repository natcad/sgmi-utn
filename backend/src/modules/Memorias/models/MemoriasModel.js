import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";

export const Memoria = sequelize.define(
  "Memoria",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idCreador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Usuario", key: "id" },
    },
    grupoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "GrupoInvestigacion", key: "id" },
    },
    estado: {
      type: DataTypes.ENUM("Borrador", "Enviada", "Aprobada", "Rechazada"),
      allowNull: false,
      defaultValue: "Borrador",
    },
    fechaApertura: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fechaCierre: { type: DataTypes.DATE, allowNull: true },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    resumen: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
        version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

  },
  { tableName: "Memorias", timestamps: true,   indexes: [
      {
        fields: ["grupoId", "anio"],
      } ]}
);

Memoria.associate = (models) => {
  Memoria.belongsTo(models.GrupoInvestigacion, {
    foreignKey: "grupoId",
    as: "grupo",
  });
  Memoria.belongsTo(models.Usuario, { as: "creador", foreignKey: "idCreador" });
    Memoria.hasMany(models.MemoriaPersonal, { as: "personal", foreignKey: "idMemoria" });
   Memoria.hasMany(models.MemoriaEquipamiento, { as: "equipamiento", foreignKey: "idMemoria" });

};

Memoria.addHook("beforeCreate", async (memoria, options) => {
  if (!memoria.grupoId || !memoria.anio) return;

  const ultima = await Memoria.findOne({
    where: {
      grupoId: memoria.grupoId,
      anio: memoria.anio,
    },
    order: [["version", "DESC"]],
  });

  memoria.version = ultima ? ultima.version + 1 : 1;
});
