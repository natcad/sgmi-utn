import express from "express";
import { PersonalController } from "../controllers/PersonalController.js";
import { CatalogosController } from "../controllers/CatalogosController.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";
import upload from "../../../middlewares/upload.middleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/catalogos", CatalogosController.getCatalogos);
router.get("/validar-correo", PersonalController.validarCorreo);
router.get("/", PersonalController.listar);
router.get("/:id",PersonalController.buscarPorId);
router.post("/", upload.single('fotoPerfil'), PersonalController.crear);
router.put("/:id", upload.single('fotoPerfil'), PersonalController.actualizar);
router.delete("/:id", PersonalController.eliminar)

export default router;