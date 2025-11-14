// En: backend/src/models/index.cjs
'use strict';

// --- 1. IMPORTA LOS MODELOS CON "require" ---

// Importa los modelos de Usuarios (Asegúrate que las rutas sean correctas)
const { Usuario } = require('../modules/Usuarios/models/Usuario.js');
const { PerfilUsuario } = require('../modules/Usuarios/models/PerfilUsuario.js');

// Importa los modelos de tu módulo (Asegúrate que terminen en .cjs)
const { GrupoInvestigacion } = require('../modules/Grupos/grupos.model.cjs');

// Importa los modelos que FALTAN (los que necesita tu migración)
// const { FacultadRegional } = require('../modules/Facultades/facultades.model.cjs'); // (Ejemplo)
// const { Personal } = require('../modules/Personal/personal.model.cjs'); // (Ejemplo)


// EXPORTA TODO CON "module.exports" ---
module.exports = { 
  Usuario,
  PerfilUsuario,
  GrupoInvestigacion,
  // FacultadRegional,
  // Personal,
  // ... (agrega aquí todos los demás modelos que tengas)
};