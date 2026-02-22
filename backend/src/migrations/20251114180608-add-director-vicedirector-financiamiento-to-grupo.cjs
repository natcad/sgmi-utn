"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    // 1. Relación con Director
    await queryInterface.addConstraint("GrupoInvestigacion", {
      fields: ["idDirector"], // <--- OJO: "fields" (plural) y entre corchetes []
      type: "foreign key",
      name: "fk_grupo_director",
      references: {
        table: "Personal",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // 2. Relación con Vicedirector
    await queryInterface.addConstraint("GrupoInvestigacion", {
      fields: ["idVicedirector"], // <--- OJO: "fields" y []
      type: "foreign key",
      name: "fk_grupo_vicedirector",
      references: {
        table: "Personal",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // 3. Relación con Fuente de Financiamiento
    await queryInterface.addConstraint("GrupoInvestigacion", {
      fields: ["idFuenteDeFinanciamiento"], // <--- OJO: "fields" y []
      type: "foreign key",
      name: "fk_grupo_fuente",
      references: {
        table: "FuenteFinanciamiento", // Asegúrate que este nombre sea exacto al de la BD
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface) => {
    // Para revertir, quitamos las restricciones
    await queryInterface.removeConstraint("GrupoInvestigacion", "fk_grupo_director");
    await queryInterface.removeConstraint("GrupoInvestigacion", "fk_grupo_vicedirector");
    await queryInterface.removeConstraint("GrupoInvestigacion", "fk_grupo_fuente");
  },
};