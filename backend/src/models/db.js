import sequelize from '../config/database.js';
import { Sequelize } from 'sequelize';

// Importación de modelos (ajustá rutas si cambian)
import { Usuario } from '../modules/Usuarios/models/Usuario.js';
import { Personal } from '../modules/Personal/models/Personal.js';
import { EnFormacion } from '../modules/Personal/models/EnFormacion.js';
import { Investigador } from '../modules/Personal/models/Investigador.js';
import { FuenteFinanciamiento } from '../modules/Personal/models/FuenteFinanciamiento.js';
import { ProgramaIncentivo } from '../modules/Personal/models/ProgramaIncentivo.js';
import { GrupoInvestigacion } from '../modules/Grupos/grupos.models.js';
// import { Equipamiento } from '../modules/Equipamiento/models/Equipamiento.js'; // si lo usás

// Objeto de exportación
const models = {
  Usuario,
  Personal,
  EnFormacion,
  Investigador,
  FuenteFinanciamiento,
  ProgramaIncentivo,
  GrupoInvestigacion,
  // Equipamiento,
};

// Ejecutar asociaciones si están definidas
for (const modelName of Object.keys(models)) {
  const model = models[modelName];
  if (typeof model.associate === "function") {
    model.associate(models);
  }
}


export default {
  sequelize,
  Sequelize,
  models,
};
