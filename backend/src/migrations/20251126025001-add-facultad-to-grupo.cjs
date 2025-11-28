'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1) Agregar la columna
    await queryInterface.addColumn('GrupoInvestigacion', 'idFacultadRegional', {
      type: Sequelize.INTEGER,
      allowNull: true,         // o false si querés obligatoria
    });

    // 2) Agregar la foreign key
    await queryInterface.addConstraint('GrupoInvestigacion', {
      fields: ['idFacultadRegional'],
      type: 'foreign key',
      name: 'fk_grupo_facultad_regional',
      references: {
        table: 'FacultadRegional',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'GrupoInvestigacion',
      'fk_grupo_facultad_regional'
    );
    await queryInterface.removeColumn(
      'GrupoInvestigacion',
      'idFacultadRegional'
    );
  },
};
