"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar la columna creadorId
    await queryInterface.addColumn("GrupoInvestigacion", "creadorId", {
      type: Sequelize.INTEGER,
      allowNull: true, // Importante: true para que los grupos viejos no den error
      references: {
        model: "Usuarios", // ⚠️ OJO: Asegúrate que tu tabla en la BD se llame 'Usuarios' (o 'Users')
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir: borrar la columna
    await queryInterface.removeColumn("GrupoInvestigacion", "creadorId");
  },
};