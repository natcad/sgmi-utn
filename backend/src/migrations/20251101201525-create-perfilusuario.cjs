'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable('PerfilUsuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fechaNacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      fotoPerfil: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('PerfilUsuarios');
  }
};
