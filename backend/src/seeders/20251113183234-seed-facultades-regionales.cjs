// En: backend/src/seeders/XXXXXXXX-seed-facultades-regionales.cjs

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 'bulkInsert' inserta muchos datos de una sola vez
    await queryInterface.bulkInsert('FacultadRegional', [
      { nombre: 'Facultad Regional Buenos Aires', localidad: 'CABA' },
      { nombre: 'Facultad Regional Córdoba', localidad: 'Córdoba' },
      { nombre: 'Facultad Regional Rosario', localidad: 'Rosario' },
      { nombre: 'Facultad Regional La Plata', localidad: 'La Plata' },
      { nombre: 'Facultad Regional Avellaneda', localidad: 'Avellaneda' },
      { nombre: 'Facultad Regional Haedo', localidad: 'Haedo' },
      { nombre: 'Facultad Regional Santa Fe', localidad: 'Santa Fe' },
      { nombre: 'Facultad Regional Mendoza', localidad: 'Mendoza' },
      { nombre: 'Facultad Regional Tucumán', localidad: 'Tucumán' },
      { nombre: 'Facultad Regional Bahía Blanca', localidad: 'Bahía Blanca' },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Si deshacemos el seed, borramos todo el contenido de la tabla
    await queryInterface.bulkDelete('FacultadRegional', null, {});
  }
};