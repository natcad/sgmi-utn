import express from "express";
import { PerfilUsuarioController } from "../controllers/PerfilUsuarioController.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

// Obtener todos los perfiles
router.get("/", PerfilUsuarioController.listar);

// Obtener perfil por ID
router.get("/:id", PerfilUsuarioController.buscarPorId);

// Obtener perfil por usuarioId
router.get("/usuario/:usuarioId", PerfilUsuarioController.buscarPorUsuarioId);

// Crear nuevo perfil
router.post("/", PerfilUsuarioController.crear);

// Actualizar perfil por ID
router.put("/:id", PerfilUsuarioController.actualizar);

// Actualizar o crear perfil por usuarioId (upsert)
router.put("/usuario/:usuarioId", PerfilUsuarioController.actualizarOCrearPorUsuarioId);

// Eliminar perfil
router.delete("/:id", PerfilUsuarioController.eliminar);

export default router;

