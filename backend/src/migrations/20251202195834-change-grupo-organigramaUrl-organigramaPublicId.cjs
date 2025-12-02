// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     // 1) Eliminar la columna vieja
//     await queryInterface.removeColumn("GrupoInvestigacion", "organigrama");

//     // 2) Agregar organigramaUrl
//     await queryInterface.addColumn("GrupoInvestigacion", "organigramaUrl", {
//       type: Sequelize.STRING,
//       allowNull: true,
//     });

//     // 3) Agregar organigramaPublicId
//     await queryInterface.addColumn(
//       "GrupoInvestigacion",
//       "organigramaPublicId",
//       {
//         type: Sequelize.STRING,
//         allowNull: true,
//       }
//     );
//   },

//   down: async (queryInterface, Sequelize) => {
//     // Revertir: borrar las columnas nuevas…
//     await queryInterface.removeColumn("GrupoInvestigacion", "organigramaUrl");
//     await queryInterface.removeColumn(
//       "GrupoInvestigacion",
//       "organigramaPublicId"
//     );

//     // …y volver a crear la columna vieja.
//     // Ajustá el type si antes no era STRING.
//     await queryInterface.addColumn("GrupoInvestigacion", "organigrama", {
//       type: Sequelize.STRING,
//       allowNull: true,
//     });
//   },
// };

