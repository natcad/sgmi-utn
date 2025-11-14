"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Investigador", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      personalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Personal",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      categoriaUTN: {
        type: Sequelize.ENUM("A", "B", "C", "D", "E"),
        allowNull: false,
      },

      dedicacion: {
        type: Sequelize.ENUM("Simple", "Semiexclusiva", "Exclusiva"),
        allowNull: true,
      },

      idIncentivo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "ProgramaIncentivo",
          key: "id",
        },
        onDelete: "CASCADE",
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
    await queryInterface.dropTable("Investigador");
  },
};
