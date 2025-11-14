"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("FuenteFinanciamiento", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      enFormacionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "EnFormacion", // nombre de la tabla, no del modelo
          key: "id",
        },
        onDelete: "CASCADE",
      },

      organismo: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      monto: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("FuenteFinanciamiento");
  },
};
