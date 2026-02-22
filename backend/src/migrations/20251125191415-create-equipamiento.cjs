"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Equipamiento", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },

            grupoId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "GrupoInvestigacion",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            denominacion: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            descripcion: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            montoInvertido: {
                type: Sequelize.DECIMAL(10,2),
                allowNull: false,
            },

            fechaIncorporacion: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },

            cantidad: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn("NOW"),
            },

            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn("NOW"),
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("Equipamiento");
    }
};
