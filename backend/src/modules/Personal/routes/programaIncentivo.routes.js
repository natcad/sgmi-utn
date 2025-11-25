import express from "express";
import { ProgramaIncentivoController } from "../controllers/ProgramaIncentivoController.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", ProgramaIncentivoController.listar)
router.get("/:id",ProgramaIncentivoController.obtenerPorId);
router.post("/", ProgramaIncentivoController.crear);
router.put("/:id", ProgramaIncentivoController.actualizar);
router.delete("/:id", ProgramaIncentivoController.eliminar);

export default router;