"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Memorias", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      idCreador: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Usuarios", // nombre de la tabla de usuarios
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      idGrupo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "GrupoInvestigacion",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      estado: {
        type: Sequelize.ENUM("Borrador", "Enviada", "Aprobada", "Rechazada"),
        allowNull: false,
        defaultValue: "Borrador",
      },

      fechaApertura: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      fechaCierre: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      anio: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      titulo: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },

      resumen: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      version: {
        type: Sequelize.INTEGER,
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // índice para búsquedas por grupo + año
    await queryInterface.addIndex("Memorias", ["idGrupo", "anio"]);
  },

  async down(queryInterface, Sequelize) {
    // en MySQL al dropear la tabla se va el ENUM
    await queryInterface.dropTable("Memorias");
  },
};
