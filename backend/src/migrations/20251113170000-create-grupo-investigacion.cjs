"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("GrupoInvestigacion", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nombre: {
        type: Sequelize.STRING(45),
        allowNull: false,
      },
      correo: {
        type: Sequelize.STRING(45),
        unique: true,
      },
      objetivo: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      organigramaUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      organigramaPublicId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      presupuesto: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },
      siglas: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      creadorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      idFacultadRegional: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      idDirector: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      idVicedirector: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("GrupoInvestigacion");
  },
};