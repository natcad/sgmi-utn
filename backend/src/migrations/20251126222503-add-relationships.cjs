'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    // 👇 BORRA TODO LO QUE TENGA QUE VER CON "GrupoInvestigacion" O "Director"
    // Porque eso ya se hizo en los archivos anteriores.

    // 👇 SOLO DEJA ESTO (La relación inversa de Personal -> Grupo)
    await queryInterface.addConstraint('Personal', {
      fields: ['grupoId'], 
      type: 'foreign key',
      name: 'fk_personal_grupo', 
      references: {
        table: 'GrupoInvestigacion',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Personal', 'fk_personal_grupo');
  }
};