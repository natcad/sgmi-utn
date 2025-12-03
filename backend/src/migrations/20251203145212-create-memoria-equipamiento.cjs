"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("MemoriaEquipamiento", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      idMemoria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Memorias",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      idEquipamiento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Equipamiento",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      estadoEnEseAnio: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      esAltaDelAnio: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      usoPrincipal: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      ubicacionEnEseAnio: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },

      valorReferencial: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },

      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // índice único idMemoria + idEquipamiento
    await queryInterface.addIndex(
      "MemoriaEquipamiento",
      ["idMemoria", "idEquipamiento"],
      {
        unique: true,
        name: "uniq_memoria_equipamiento",
      }
    );

    await queryInterface.addIndex("MemoriaEquipamiento", ["idMemoria"]);
    await queryInterface.addIndex("MemoriaEquipamiento", ["idEquipamiento"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("MemoriaEquipamiento");
  },
};
