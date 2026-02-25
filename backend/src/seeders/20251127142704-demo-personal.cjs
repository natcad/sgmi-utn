'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [users] = await queryInterface.sequelize.query(
      `SELECT id, email FROM Usuarios WHERE email IN ('admin@sgmi.utn.edu', 'laura@sgmi.utn.edu', 'javier.gomez@utn.edu', 'martina.diaz@utn.edu', 'carlos.f@utn.edu');`
    );

    const getUserByEmail = (email) => users.find(u => u.email === email);

    const adminUser = getUserByEmail('admin@sgmi.utn.edu');
    const lauraUser = getUserByEmail('laura@sgmi.utn.edu');
    const javierUser = getUserByEmail('javier.gomez@utn.edu');
    const martinaUser = getUserByEmail('martina.diaz@utn.edu');
    const carlosUser = getUserByEmail('carlos.f@utn.edu');

    if (!adminUser || !lauraUser || !javierUser || !martinaUser || !carlosUser) {
      throw new Error("No se encontraron todos los usuarios base para seedear Personal.");
    }

    const adminId = adminUser.id;
    const lauraId = lauraUser.id;
    const javierId = javierUser.id;
    const martinaId = martinaUser.id;
    const carlosId = carlosUser.id;

    const [grupos] = await queryInterface.sequelize.query(
      `SELECT id, siglas FROM GrupoInvestigacion WHERE siglas = 'GIDT-UTN' LIMIT 1;`
    );

    if (!grupos.length) {
      throw new Error("No existe un GrupoInvestigacion base. Ejecutá primero el seeder de grupos.");
    }

    const grupoId = grupos[0].id;

    await queryInterface.bulkInsert('Personal', [
      {
        usuarioId: adminId, 
        emailInstitucional: 'admin.direccion@sgmi.utn.edu.ar',
        horasSemanales: 40,
        rol: 'Investigador',
        ObjectType: 'investigador',
        nivelDeFormacion: 'Doctorado',
        grupoId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        usuarioId: lauraId,
        emailInstitucional: 'laura.adjunta@sgmi.utn.edu.ar',
        horasSemanales: 30,
        rol: 'Investigador',
        ObjectType: 'investigador',
        nivelDeFormacion: 'Maestría/ Especialización',
        grupoId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        usuarioId: javierId,
        emailInstitucional: 'javier.personal@utn.edu',
        horasSemanales: 40,
        rol: 'Personal Técnico',
        ObjectType: 'personal',
        nivelDeFormacion: 'Maestría/ Especialización',
        grupoId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        usuarioId: martinaId,
        emailInstitucional: 'martina.becaria@utn.edu',
        horasSemanales: 20,
        rol: 'Personal en Formación',
        ObjectType: 'en formación',
        nivelDeFormacion: 'Becario Alumno',
        grupoId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        usuarioId: carlosId,
        emailInstitucional: 'carlos.f@utn.edu',
        horasSemanales: 40,
        rol: 'Personal Profesional',
        ObjectType: 'personal',
        nivelDeFormacion: 'Doctorado',
        grupoId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Personal', {
      emailInstitucional: [
        'admin.direccion@sgmi.utn.edu.ar',
        'laura.adjunta@sgmi.utn.edu.ar',
        'javier.personal@utn.edu',
        'martina.becaria@utn.edu',
        'carlos.f@utn.edu',
      ],
    }, {});
  }
};