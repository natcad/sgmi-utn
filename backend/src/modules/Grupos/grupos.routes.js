import express from "express";
const router = express.Router();

import upload from "../../middlewares/upload.middleware.js";
import * as gruposController from "./grupos.controller.js";
router.get("/", gruposController.obtenerTodosLosGrupos);

router.post("/", upload.single("organigrama"), gruposController.crearGrupo);
router.get("/validar-correo", gruposController.validarCorreoGrupo);


router.get("/:id/organigrama", gruposController.descargarOrganigrama);

router.get("/:id", gruposController.obtenerGrupoPorId);


router.put(
  "/:id",
  upload.single("organigrama"),
  gruposController.actualizarGrupo
);

router.delete("/:id", gruposController.eliminarGrupo);

export default router;
