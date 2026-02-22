"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Tabla Memorias
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
          model: "Usuario",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT", // o CASCADE si preferís
      },

      grupoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "GrupoInvestigacion",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      estado: {
        type: Sequelize.ENUM("Borrador", "Enviada", "Aprobada", "Rechazada"),
        allowNull: false,
        defaultValue: "Borrador",
      },

      fechaApertura: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
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
        defaultValue: 1,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("Memorias", ["grupoId", "anio"]);

    // 2) Tabla MemoriaPersonal
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
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      idPersonal: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Personal",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },

      // SNAPSHOT PERSONAL
      ObjectType: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      horasSemanales: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      rol: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      nivelDeFormacion: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      // SNAPSHOT INVESTIGADOR
      categoriaUTN: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      dedicacion: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      idIncentivo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "ProgramaIncentivo",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },

      // SNAPSHOT EN FORMACION
      tipoFormacion: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      // EXTRA MEMORIA
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // índices MemoriaPersonal
    await queryInterface.addIndex("MemoriaPersonal", {
      fields: ["idMemoria", "idPersonal"],
      unique: true,
      name: "ux_memoria_personal_memoria_personal",
    });

    await queryInterface.addIndex("MemoriaPersonal", {
      fields: ["idMemoria"],
      name: "idx_memoria_personal_memoria",
    });

    await queryInterface.addIndex("MemoriaPersonal", {
      fields: ["idPersonal"],
      name: "idx_memoria_personal_personal",
    });

    // 3) Tabla MemoriaEquipamiento
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
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      idEquipamiento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Equipamiento",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },

      denominacion: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      montoInvertido: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      fechaIncorporacion: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // índices MemoriaEquipamiento
    await queryInterface.addIndex("MemoriaEquipamiento", {
      fields: ["idMemoria", "idEquipamiento"],
      unique: true,
      name: "ux_memoria_equipamiento_memoria_equipamiento",
    });

    await queryInterface.addIndex("MemoriaEquipamiento", {
      fields: ["idMemoria"],
      name: "idx_memoria_equipamiento_memoria",
    });

    await queryInterface.addIndex("MemoriaEquipamiento", {
      fields: ["idEquipamiento"],
      name: "idx_memoria_equipamiento_equipamiento",
    });
  },

  async down(queryInterface, Sequelize) {
    // Orden inverso por FKs
    await queryInterface.dropTable("MemoriaEquipamiento");
    await queryInterface.dropTable("MemoriaPersonal");
    await queryInterface.dropTable("Memorias");

    // Si estuvieras en Postgres, acá habría que dropear el tipo ENUM manualmente.
    // En MySQL no hace falta nada extra.
  },
};
