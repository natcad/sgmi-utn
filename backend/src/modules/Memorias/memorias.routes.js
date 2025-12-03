// backend/src/modules/memorias/routes/memorias.routes.js
import { Router } from "express";
import { MemoriaController } from "../controllers/MemoriaController.js";
import { MemoriaPersonalController } from "../controllers/MemoriaPersonalController.js";
import { MemoriaEquipamientoController } from "../controllers/MemoriaEquipamientoController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

// -------- MEMORIAS --------

// GET /api/memorias?grupoId=&anio=&estado=&incluirDetalle=true
router.get("/", MemoriaController.listar);

// GET /api/memorias/:id?incluirDetalle=true
router.get("/:id", MemoriaController.obtenerPorId);

// POST /api/memorias
router.post("/", MemoriaController.crear);

// PUT /api/memorias/:id
router.put("/:id", MemoriaController.actualizar);

// DELETE /api/memorias/:id
router.delete("/:id", MemoriaController.eliminar);

// -------- PERSONAL DE LA MEMORIA --------

// GET /api/memorias/:idMemoria/personal
router.get(
  "/:idMemoria/personal",
  MemoriaPersonalController.listarPorMemoria
);

// POST /api/memorias/:idMemoria/personal
router.post(
  "/:idMemoria/personal",
  MemoriaPersonalController.agregar
);

// PUT /api/memorias/personal/:id
router.put(
  "/personal/:id",
  MemoriaPersonalController.actualizar
);

// DELETE /api/memorias/personal/:id
router.delete(
  "/personal/:id",
  MemoriaPersonalController.eliminar
);

// -------- EQUIPAMIENTO DE LA MEMORIA --------

// GET /api/memorias/:idMemoria/equipamiento
router.get(
  "/:idMemoria/equipamiento",
  MemoriaEquipamientoController.listarPorMemoria
);

// POST /api/memorias/:idMemoria/equipamiento
router.post(
  "/:idMemoria/equipamiento",
  MemoriaEquipamientoController.agregar
);

// PUT /api/memorias/equipamiento/:id
router.put(
  "/equipamiento/:id",
  MemoriaEquipamientoController.actualizar
);

// DELETE /api/memorias/equipamiento/:id
router.delete(
  "/equipamiento/:id",
  MemoriaEquipamientoController.eliminar
);

export default router;
