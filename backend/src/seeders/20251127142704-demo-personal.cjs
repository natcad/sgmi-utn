'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    // 1. OBTENER LOS IDs DE LOS USUARIOS CREADOS (La consulta debe incluir a los 5)
    // 🐛 CORRECCIÓN: Utilizamos la opción 'raw' para obtener el array plano de resultados directamente.
    const usersRaw = await queryInterface.sequelize.query(
      // Usamos el nombre de la tabla con mayúscula: Usuarios
      `SELECT id, email FROM Usuarios WHERE email IN ('admin@sgmi.utn.edu', 'laura@sgmi.utn.edu', 'javier.gomez@utn.edu', 'martina.diaz@utn.edu', 'carlos.f@utn.edu');`
    );
    
    // 🐛 CORRECCIÓN CRÍTICA: La lista de usuarios reales está en el índice 0 del resultado.
    const users = usersRaw[0]; 
    
    // 2. FUNCIÓN DE BÚSQUEDA Y ASIGNACIÓN (Defensiva)
    // Ahora users es un array plano y .find() funcionará.
    const getUserByEmail = (email) => users.find(u => u.email === email);
    
    const adminUser = getUserByEmail('admin@sgmi.utn.edu');
    const lauraUser = getUserByEmail('laura@sgmi.utn.edu');
    const javierUser = getUserByEmail('javier.gomez@utn.edu');
    const martinaUser = getUserByEmail('martina.diaz@utn.edu');
    const carlosUser = getUserByEmail('carlos.f@utn.edu');

    // 3. VERIFICACIÓN CRÍTICA (Evitar el error 'Cannot read properties of undefined')
    if (!adminUser || !lauraUser || !javierUser || !martinaUser || !carlosUser) {
        throw new Error("ERROR CRÍTICO: No se encontraron todos los usuarios base. Asegúrate de que el seeder de Usuarios ('demo-usuarios.cjs') se haya ejecutado y haya insertado los 5 emails.");
    }

    // 4. ASIGNACIÓN FINAL DE LAS VARIABLES
    const adminId = adminUser.id;
    const lauraId = lauraUser.id;
    const javierId = javierUser.id;
    const martinaId = martinaUser.id;
    const carlosId = carlosUser.id;


    // 5. INSERTAR REGISTROS EN PERSONAL USANDO LOS IDs OBTENIDOS
    await queryInterface.bulkInsert('Personal', [
      // 1. ADMINISTRADOR (Director / Investigador)
      {
        usuarioId: adminId, 
        emailInstitucional: 'admin.direccion@sgmi.utn.edu.ar',
        horasSemanales: 40,
        rol: 'Investigador', // Usamos un ENUM válido
        ObjectType: 'investigador',
        nivelDeFormacion: 'Doctorado',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 2. LAURA (Vicedirector / Investigador)
      {
        usuarioId: lauraId,
        emailInstitucional: 'laura.adjunta@sgmi.utn.edu.ar',
        horasSemanales: 30,
        rol: 'Investigador',
        ObjectType: 'investigador',
        nivelDeFormacion: 'Maestría/ Especialización',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 3. JAVIER GOMEZ (Personal Técnico)
      {
        usuarioId: javierId,
        emailInstitucional: 'javier.personal@utn.edu',
        horasSemanales: 40,
        rol: 'Personal Técnico',
        ObjectType: 'personal',
        nivelDeFormacion: 'Maestría/ Especialización',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 4. MARTINA DIAZ (Personal en Formación)
      {
        usuarioId: martinaId,
        emailInstitucional: 'martina.becaria@utn.edu',
        horasSemanales: 20,
        rol: 'Personal en Formación',
        ObjectType: 'en formación',
        nivelDeFormacion: 'Pregrado',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 5. CARLOS FUENTES (Personal Profesional)
      {
        usuarioId: carlosId,
        emailInstitucional: 'carlos.f@utn.edu',
        horasSemanales: 40,
        rol: 'Personal Profesional',
        ObjectType: 'personal',
        nivelDeFormacion: 'Doctorado',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Borrará los 5 registros de la tabla Personal
    await queryInterface.bulkDelete('Personal', null, {});
  }
};