"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("MemoriaPersonal", {
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
        onDelete: "CASCADE", // si se borra la memoria, se borran sus filas hijas
      },

      idPersonal: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Personal",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      rolEnGrupo: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      horasSemanales: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },

      dedicacion: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      categoriaUTN: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      tipoFormacion: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      activoEseAnio: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // índice único idMemoria + idPersonal
    await queryInterface.addIndex("MemoriaPersonal", ["idMemoria", "idPersonal"], {
      unique: true,
      name: "uniq_memoria_personal",
    });

    await queryInterface.addIndex("MemoriaPersonal", ["idMemoria"]);
    await queryInterface.addIndex("MemoriaPersonal", ["idPersonal"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("MemoriaPersonal");
  },
};

