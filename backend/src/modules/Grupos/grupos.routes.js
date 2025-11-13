

const express = require('express');
const router = express.Router();

//Importamos el middleware de subida
const upload = require('../../middlewares/upload.middleware');

// Importamos el controlador 
const gruposController = require('./grupos.controller');

// Importamos el middleware de autenticación que ya tienes
const authMiddleware = require('../../middlewares/authMiddleware');

/*Rutas para el Módulo de Grupos*/

// Aplicamos el middleware de autenticación a TODAS las rutas de grupos
router.use(authMiddleware);

// --- Rutas CRUD ---

// Obtiene todos los grupos de la tabla
router.get('/', gruposController.obtenerTodosLosGrupos);

// Crea un nuevo grupo - Alta de Grupo
router.post('/', gruposController.crearGrupo);

// Le decimos a Multer: "Espera un solo archivo en el campo 'organigrama'"
router.post('/', upload.single('organigrama'), gruposController.crearGrupo);

//Obtiene un grupo específico por su ID
router.get('/:id', gruposController.obtenerGrupoPorId);

//Actualiza un grupo existente por su ID
router.put('/:id', gruposController.actualizarGrupo);
// También lo aplicamos al actualizar, por si cambian el archivo
router.put('/:id', upload.single('organigrama'), gruposController.actualizarGrupo);

//Elimina un grupo existente por su ID
router.delete('/:id', gruposController.eliminarGrupo);

// --- Rutas Específicas (Equipamiento) ---

//Obtiene todo el equipamiento de un grupo específico
router.get('/:id/equipamiento', gruposController.obtenerEquipamientoDeGrupo);


module.exports = router;