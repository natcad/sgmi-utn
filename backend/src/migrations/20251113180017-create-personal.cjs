"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Personal", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Usuarios",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      emailInstitucional: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      horasSemanales: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      ObjectType: {
        type: Sequelize.ENUM("personal", "investigador", "en formación"),
        allowNull: false,
        defaultValue: "personal",
      },

      rol: {
        type: Sequelize.ENUM(
          "Investigador",
          "Personal Profesional",
          "Personal Técnico",
          "Personal Administrativo",
          "Personal de Apoyo",
          "Personal en Formación"
        ),
        allowNull: false,
      },

      nivelDeFormacion: {
        type: Sequelize.ENUM(
        "Doctorado",
          "Maestría/ Especialización",
          "Becario Graduado",
          "Becario Alumno",
          "Pasante",
          "Tesis"
        ),
        allowNull: true,
      },

      grupoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "GrupoInvestigacion",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Personal");
  },
};
