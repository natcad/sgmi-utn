import express from "express";
import { EnFormacionController } from "../controllers/EnFormacionController.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", EnFormacionController.listar)
router.get("/:id",EnFormacionController.obtenerPorId);
router.post("/", EnFormacionController.crear);
router.put("/:id", EnFormacionController.actualizar);
router.delete("/:id", EnFormacionController.eliminar);

export default router;