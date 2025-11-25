import express from "express";
import { PersonalController } from "../controllers/PersonalController.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", PersonalController.listar);
router.get("/:id",PersonalController.buscarPorId);
router.post("/", PersonalController.crear);
router.put("/:id", PersonalController.actualizar);
router.delete("/:id", PersonalController.eliminar)

export default router;