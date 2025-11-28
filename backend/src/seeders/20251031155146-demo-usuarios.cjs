'use strict';
const bcrypt = require('bcryptjs'); // <--- CAMBIO 1: Importamos bcrypt (como en tu original)

/** @type {import('sequelize-cli').Migration} */
module.exports = { // <--- CAMBIO 2: Usamos module.exports
  up: async (queryInterface, Sequelize) => {
    const passwordJavier = await bcrypt.hash('clave123', 10);
    const passwordMartina = await bcrypt.hash('clave123', 10);
    const passwordCarlos = await bcrypt.hash('clave123', 10);
    
    await queryInterface.bulkInsert('Usuarios', [

      { 
        nombre: 'Javier', 
        apellido: 'Gomez', 
        email: 'javier.gomez@utn.edu', 
        password: passwordJavier, 
        rol: 'integrante', 
        activo: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },

      { 
        nombre: 'Martina',
        apellido: 'Diaz', 
        email: 'martina.diaz@utn.edu', 
        password: passwordMartina, 
        rol: 'integrante', 
        activo: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },

      { 
        nombre: 'Carlos',
        apellido: 'Fuentes', 
        email: 'carlos.f@utn.edu', 
        password: passwordCarlos, 
        rol: 'integrante', 
        activo: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },

    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Usuarios', null, {});
  }
};