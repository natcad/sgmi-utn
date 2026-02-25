"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		const columns = await queryInterface.describeTable("GrupoInvestigacion");

		if (columns.organigrama) {
			await queryInterface.removeColumn("GrupoInvestigacion", "organigrama");
		}

		if (!columns.organigramaUrl) {
			await queryInterface.addColumn("GrupoInvestigacion", "organigramaUrl", {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}

		if (!columns.organigramaPublicId) {
			await queryInterface.addColumn("GrupoInvestigacion", "organigramaPublicId", {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
	},

	async down(queryInterface, Sequelize) {
		const columns = await queryInterface.describeTable("GrupoInvestigacion");

		if (columns.organigramaUrl) {
			await queryInterface.removeColumn("GrupoInvestigacion", "organigramaUrl");
		}

		if (columns.organigramaPublicId) {
			await queryInterface.removeColumn("GrupoInvestigacion", "organigramaPublicId");
		}

		if (!columns.organigrama) {
			await queryInterface.addColumn("GrupoInvestigacion", "organigrama", {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
	},
};

