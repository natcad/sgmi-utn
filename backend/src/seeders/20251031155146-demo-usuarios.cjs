'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const password = await bcrypt.hash('clave123', 10);
    
    await queryInterface.bulkInsert('Usuarios', [
      { 
        nombre: 'Admin', 
        apellido: 'SGMI', 
        email: 'admin@sgmi.utn.edu', 
        password, 
        rol: 'admin', 
        activo: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },

      { 
        nombre: 'Laura',
        apellido: 'Perez', 
        email: 'laura@sgmi.utn.edu', 
        password, 
        rol: 'integrante', 
        activo: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },

      { 
        nombre: 'Javier', 
        apellido: 'Gomez', 
        email: 'javier.gomez@utn.edu', 
        password, 
        rol: 'integrante', 
        activo: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },

      { 
        nombre: 'Martina',
        apellido: 'Diaz', 
        email: 'martina.diaz@utn.edu', 
        password, 
        rol: 'integrante', 
        activo: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },

      { 
        nombre: 'Carlos',
        apellido: 'Fuentes', 
        email: 'carlos.f@utn.edu', 
        password, 
        rol: 'integrante', 
        activo: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },

    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Usuarios', {
      email: [
        'admin@sgmi.utn.edu',
        'laura@sgmi.utn.edu',
        'javier.gomez@utn.edu',
        'martina.diaz@utn.edu',
        'carlos.f@utn.edu',
      ],
    }, {});
  }
};