// backend/src/modules/memorias/routes/memorias.routes.js
import { Router } from "express";
import { MemoriaController } from "./controller/MemoriasController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

// GET /api/memorias?grupoId=&anio=&estado=&incluirDetalle=true
router.get("/", MemoriaController.listar);

// GET /api/memorias/:id?incluirDetalle=true
router.get("/:id", MemoriaController.obtenerPorId);

// POST /api/memorias
// body: { idGrupo, anio, titulo?, resumen? }
// router.post("/", authMiddleware, MemoriaController.crear);
router.post("/", MemoriaController.crear);

// PUT /api/memorias/:id
// body: { estado?, titulo?, resumen?, fechaCierre? }
// router.put("/:id", authMiddleware, MemoriaController.actualizar);
router.put("/:id", MemoriaController.actualizar);

// DELETE /api/memorias/:id
// router.delete("/:id", authMiddleware, MemoriaController.eliminar);
router.delete("/:id", MemoriaController.eliminar);

router.post("/:id/enviar-por-mail", authMiddleware, MemoriaController.enviarPorMail);

router.get("/grupos/:grupoId/exportar/excel", authMiddleware, MemoriaController.exportarExcelGrupoMemorias);

router.get("/:id/exportar/excel", authMiddleware, MemoriaController.exportarExcel);
export default router;
