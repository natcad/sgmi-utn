'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('GrupoInvestigacion', {
      fields: ['idFacultadRegional'], // <--- IMPORTANTE: "fields" (plural) y con corchetes []
      type: 'foreign key',
      name: 'fk_grupo_facultad_regional', // Un nombre único para la restricción
      references: {
        table: 'FacultadRegional',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('GrupoInvestigacion', 'fk_grupo_facultad_regional');
  }
};