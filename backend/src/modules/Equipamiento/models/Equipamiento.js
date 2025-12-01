import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";
export const Equipamiento = sequelize.define(
    "Equipamiento",{
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    grupoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Grupos", key: "id" },
        onDelete: "CASCADE",
    },
    denominacion: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    montoInvertido: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    fechaIncorporacion: { type: DataTypes.DATEONLY, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false }
    },{tableName: "Equipamiento", timestamps: true}
);

Equipamiento.associate = (models) => {
    Equipamiento.belongsTo(models.GrupoInvestigacion, {
        foreignKey: "grupoId",
        as: "grupo",
    });
};
