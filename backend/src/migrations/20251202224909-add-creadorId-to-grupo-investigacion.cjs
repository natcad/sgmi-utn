"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("GrupoInvestigacion");

    if (!columns.creadorId) {
      await queryInterface.addColumn("GrupoInvestigacion", "creadorId", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });
      return;
    }

    await queryInterface.changeColumn("GrupoInvestigacion", "creadorId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Usuarios",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable("GrupoInvestigacion");
    if (columns.creadorId) {
      await queryInterface.removeColumn("GrupoInvestigacion", "creadorId");
    }
  },
};