"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint("GrupoInvestigacion", {
      fields: ["idDirector"],
      type: "foreign key",
      name: "fk_grupo_director",
      references: {
        table: "Personal",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("GrupoInvestigacion", {
      fields: ["idVicedirector"],
      type: "foreign key",
      name: "fk_grupo_vicedirector",
      references: {
        table: "Personal",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("GrupoInvestigacion", {
      fields: ["idFacultadRegional"],
      type: "foreign key",
      name: "fk_grupo_facultad",
      references: {
        table: "FacultadRegional",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("GrupoInvestigacion", "fk_grupo_director");
    await queryInterface.removeConstraint("GrupoInvestigacion", "fk_grupo_vicedirector");
    await queryInterface.removeConstraint("GrupoInvestigacion", "fk_grupo_facultad");
  },
};