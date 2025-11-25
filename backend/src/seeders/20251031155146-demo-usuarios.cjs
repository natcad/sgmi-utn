'use strict';
const bcrypt = require('bcryptjs'); // <--- CAMBIO 1: Importamos bcrypt (como en tu original)

/** @type {import('sequelize-cli').Migration} */
module.exports = { // <--- CAMBIO 2: Usamos module.exports
  up: async (queryInterface, Sequelize) => {
    // Usamos bcrypt.hash (como en tu original)
    const passwordHash = await bcrypt.hash('admin123', 10); 
    
    await queryInterface.bulkInsert('Usuarios', [
      {
        nombre: 'Administrador',
        apellido: 'SGMI',
        email: 'admin@sgmi.utn.edu',
        password: passwordHash,
        rol: 'admin',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Laura',
        apellido: 'Perez',
        email: 'laura@sgmi.utn.edu',
        password: await bcrypt.hash('usuario123', 10), // Usamos bcrypt.hash
        rol: 'integrante',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Usuarios', null, {});
  }
};