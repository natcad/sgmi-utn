'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('GrupoInvestigacion', 'idFacultadRegional', {
      type: Sequelize.INTEGER,
      references: {
        model: 'FacultadRegional', // Nombre de la tabla a la que referencia
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true, // O false si es obligatoria
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('GrupoInvestigacion', 'idFacultadRegional');
  }
};
