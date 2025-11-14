// En: backend/src/migrations/FECHA-create-grupo-investigacion.js

'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // crear la tabla
    await queryInterface.createTable('GrupoInvestigacion', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(45),
        allowNull: false
      },
      correo: {
        type: Sequelize.STRING(45),
        unique: true
      },
      objetivo: {
        type: Sequelize.STRING(45)
      },
      // guarda la ruta del archivo (Excel, PDF, etc.)
      organigrama: {
        type: Sequelize.STRING, // VARCHAR(255) 
        allowNull: true 
      },
      siglas: {
        type: Sequelize.STRING(45)
      },

      // --- Llaves Foráneas ---
      // idFacultadRegional: {
      //   type: Sequelize.INTEGER,
      //   references: {
      //     model: 'FacultadRegional', // Nombre de la tabla
      //     key: 'id',
      //   },
      //   onUpdate: 'CASCADE',
      //   onDelete: 'SET NULL',
      // },
      // idDirector: {
      //   type: Sequelize.INTEGER,
      //   references: {
      //     model: 'Personal', // Nombre de la tabla
      //     key: 'id',
      //   },
      //   onUpdate: 'CASCADE',
      //   onDelete: 'SET NULL',
      // },
      // idVicedirector: {
      //   type: Sequelize.INTEGER,
      //   references: {
      //     model: 'Personal', // Nombre de la tabla
      //     key: 'id',
      //   },
      //   onUpdate: 'CASCADE',
      //   onDelete: 'SET NULL',
      // },
      // idFuenteDeFinanciamiento: {
      //   type: Sequelize.INTEGER,
      //   references: {
      //     model: 'FuenteDeFinanciamiento', // Nombre de la tabla
      //     key: 'id',
      //   },
      //   onUpdate: 'CASCADE',
      //   onDelete: 'SET NULL',
      // }
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Comando para REVERTIR (borrar la tabla)
    await queryInterface.dropTable('GrupoInvestigacion');
  }
};