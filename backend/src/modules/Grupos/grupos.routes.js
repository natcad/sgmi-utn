import express from "express";
const router = express.Router();
import upload from "../../middlewares/upload.middleware.js";
import * as gruposController from "./grupos.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
router.get("/", authMiddleware, gruposController.obtenerTodosLosGrupos);

router.post(
  "/",authMiddleware, 
  upload.single("organigrama"),
  gruposController.crearGrupo
);
router.get("/validar-correo", authMiddleware,  gruposController.validarCorreoGrupo);
router.get("/mi-grupo",authMiddleware,  gruposController.getMiGrupo);

router.get("/:id/organigrama", authMiddleware, gruposController.descargarOrganigrama);

router.get("/:id",authMiddleware,  gruposController.obtenerGrupoPorId);

router.put(
  "/:id",authMiddleware, 
  upload.single("organigrama"),
  gruposController.actualizarGrupo
);

router.delete("/:id", authMiddleware, gruposController.eliminarGrupo);

export default router;
