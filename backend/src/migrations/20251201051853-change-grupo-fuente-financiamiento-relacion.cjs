"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("FuenteFinanciamiento", "enFormacionId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    const grupoColumns = await queryInterface.describeTable("GrupoInvestigacion");

    if (grupoColumns.idFuenteDeFinanciamiento) {
      try {
        await queryInterface.removeConstraint("GrupoInvestigacion", "fk_grupo_fuente");
      } catch (e) {}

      await queryInterface.removeColumn("GrupoInvestigacion", "idFuenteDeFinanciamiento");
    }

    const fuenteColumns = await queryInterface.describeTable("FuenteFinanciamiento");
    if (!fuenteColumns.grupoId) {
      await queryInterface.addColumn("FuenteFinanciamiento", "grupoId", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    try {
      await queryInterface.addConstraint("FuenteFinanciamiento", {
        fields: ["grupoId"],
        type: "foreign key",
        name: "fk_fuente_grupo",
        references: {
          table: "GrupoInvestigacion",
          field: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    } catch (e) {}
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeConstraint("FuenteFinanciamiento", "fk_fuente_grupo");
    } catch (e) {}

    const fuenteColumns = await queryInterface.describeTable("FuenteFinanciamiento");
    if (fuenteColumns.grupoId) {
      await queryInterface.removeColumn("FuenteFinanciamiento", "grupoId");
    }

    await queryInterface.changeColumn("FuenteFinanciamiento", "enFormacionId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    const grupoColumns = await queryInterface.describeTable("GrupoInvestigacion");
    if (!grupoColumns.idFuenteDeFinanciamiento) {
      await queryInterface.addColumn("GrupoInvestigacion", "idFuenteDeFinanciamiento", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });

      await queryInterface.addConstraint("GrupoInvestigacion", {
        fields: ["idFuenteDeFinanciamiento"],
        type: "foreign key",
        name: "fk_grupo_fuente",
        references: {
          table: "FuenteFinanciamiento",
          field: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  },
};
