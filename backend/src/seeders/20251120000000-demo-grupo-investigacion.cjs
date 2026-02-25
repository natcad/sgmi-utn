"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const [usuarios] = await queryInterface.sequelize.query(
      `SELECT id, email FROM Usuarios WHERE email = 'admin@sgmi.utn.edu' LIMIT 1;`
    );

    if (!usuarios.length) {
      throw new Error("No existe usuario admin para crear GrupoInvestigacion.");
    }

    const creadorId = usuarios[0].id;

    const [facultades] = await queryInterface.sequelize.query(
      `SELECT id FROM FacultadRegional ORDER BY id ASC LIMIT 1;`
    );

    if (!facultades.length) {
      throw new Error("No existen facultades para crear GrupoInvestigacion.");
    }

    await queryInterface.bulkInsert("GrupoInvestigacion", [
      {
        nombre: "Grupo de Investigación y Desarrollo Tecnológico",
        correo: "grupo.gidt@utn.edu.ar",
        objetivo: "Investigar y desarrollar soluciones tecnológicas aplicadas.",
        organigramaUrl: null,
        organigramaPublicId: null,
        presupuesto: 0,
        siglas: "GIDT-UTN",
        creadorId,
        idFacultadRegional: facultades[0].id,
        idDirector: null,
        idVicedirector: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "GrupoInvestigacion",
      {
        siglas: "GIDT-UTN",
      },
      {}
    );
  },
};
