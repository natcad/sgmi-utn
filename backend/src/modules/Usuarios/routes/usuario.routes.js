import express from "express";
import { UsuarioController } from "../controllers/UsuarioController.js";

const router = express.Router();

// Ruta para obtener todos los usuarios con filtros opcionales
router.get("/", UsuarioController.getAll);  
// Ruta para obtener un usuario por ID
router.get("/:id", UsuarioController.getById);
// Ruta para actualizar un usuario por ID
router.put("/:id", UsuarioController.update);   
// Ruta para eliminar (desactivar) un usuario por ID
router.delete("/:id", UsuarioController.delete);    
// Ruta para restaurar (activar) un usuario por ID
router.post("/:id/restore", UsuarioController.restore);
export default router;