"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("GrupoInvestigacion", "idDirector", {
      type: Sequelize.INTEGER,
      references: {
        model: "Personal",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("GrupoInvestigacion", "idVicedirector", {
      type: Sequelize.INTEGER,
      references: {
        model: "Personal",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("GrupoInvestigacion", "idFuenteDeFinanciamiento", {
      type: Sequelize.INTEGER,
      references: {
        model: "FuenteFinanciamiento",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("GrupoInvestigacion", "idDirector");
    await queryInterface.removeColumn("GrupoInvestigacion", "idVicedirector");
    await queryInterface.removeColumn("GrupoInvestigacion", "idFuenteDeFinanciamiento");
  },
};
