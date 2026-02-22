import express from "express";
import { FuenteFinanciamientoController } from "../controllers/FuenteFinanciamientoController.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", FuenteFinanciamientoController.listar)
router.get("/:id",FuenteFinanciamientoController.obtenerPorId);
router.post("/", FuenteFinanciamientoController.crear);
router.put("/:id", FuenteFinanciamientoController.actualizar);
router.delete("/:id", FuenteFinanciamientoController.eliminar);

export default router;