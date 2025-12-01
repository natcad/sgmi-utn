"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1) Hacer enFormacionId opcional
    await queryInterface.changeColumn("FuenteFinanciamiento", "enFormacionId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 2) Agregar grupoId
    await queryInterface.addColumn("FuenteFinanciamiento", "grupoId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 3) Agregar FK grupoId -> GrupoInvestigacion.id
    await queryInterface.addConstraint("FuenteFinanciamiento", {
      fields: ["grupoId"],
      type: "foreign key",
      name: "fk_fuente_grupo", // nombre de la FK
      references: {
        table: "GrupoInvestigacion",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // si se borra el grupo, la fuente queda sin grupo
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 1) Sacar la FK y la columna grupoId
    try {
      await queryInterface.removeConstraint(
        "FuenteFinanciamiento",
        "fk_fuente_grupo"
      );
    } catch (e) {
      console.warn("No se encontró constraint fk_fuente_grupo, se continúa igual");
    }

    await queryInterface.removeColumn("FuenteFinanciamiento", "grupoId");

    // 2) Volver a hacer enFormacionId obligatorio
    await queryInterface.changeColumn("FuenteFinanciamiento", "enFormacionId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
