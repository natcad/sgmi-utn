import express from 'express';
const router = express.Router();

// Importamos el middleware de subida
import upload from '../../middlewares/upload.middleware.js';

// Importamos el controlador (con la sintaxis corregida)
// Usamos "import *" porque tu controlador exporta múltiples funciones
import * as gruposController from './grupos.controller.js';

// Importamos el middleware de autenticación
import { authMiddleware } from '../../middlewares/authMiddleware.js';

/*Rutas para el Módulo de Grupos*/

// Aplicamos el middleware de autenticación a TODAS las rutas de grupos
router.use(authMiddleware);

// --- Rutas CRUD (Corregidas) ---

// Obtiene todos los grupos de la tabla
router.get('/', gruposController.obtenerTodosLosGrupos);

// Crea un nuevo grupo - (Esta es la única ruta POST, ya incluye Multer)
router.post('/', upload.single('organigrama'), gruposController.crearGrupo);

//Obtiene un grupo específico por su ID
router.get('/:id', gruposController.obtenerGrupoPorId);

//Actualiza un grupo existente - (Esta es la única ruta PUT, ya incluye Multer)
router.put('/:id', upload.single('organigrama'), gruposController.actualizarGrupo);

//Elimina un grupo existente por su ID
router.delete('/:id', gruposController.eliminarGrupo);

// --- Rutas Específicas (Equipamiento) ---

//Obtiene todo el equipamiento de un grupo específico
router.get('/:id/equipamiento', gruposController.obtenerEquipamientoDeGrupo);

// ¡CAMBIO CLAVE! Exportamos como 'default' para que index.js pueda importarlo
export default router;