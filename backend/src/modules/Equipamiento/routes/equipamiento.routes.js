import express from "express";
import { EquipamientoController } from "../controllers/EquipamientoController.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";
import { requireAdmin } from "../../../middlewares/requireAdmin.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", EquipamientoController.listar);
router.get("/resumen", requireAdmin, EquipamientoController.resumen);

router.get("/:id", EquipamientoController.obtenerPorId);
router.post("/", EquipamientoController.crear);
router.put("/:id", EquipamientoController.actualizar);
router.delete("/:id", EquipamientoController.eliminar);

export default router;
