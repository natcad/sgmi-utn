import express from "express";
import { InvestigadorController } from "../controllers/InvestigadorController.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", InvestigadorController.listarInvestigadores);
router.get("/:id",InvestigadorController.obtenerPorId);
router.post("/", InvestigadorController.crearInvestigador);
router.put("/:id", InvestigadorController.actualizar);
router.delete("/:id", InvestigadorController.eliminar);

export default router;