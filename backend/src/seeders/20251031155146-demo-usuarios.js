'use strict';
import bcrypt from "bcryptjs";

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
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
      password: await bcrypt.hash('usuario123', 10),
      rol: 'integrante',
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('Usuarios', null, {});
}
