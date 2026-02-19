import { Router } from "express";
import { ReporteController } from "../Reportes/ReporteController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
const router = Router();

// Admin: resumen de grupos (todos o seleccionados)
router.get(
  "/resumen-grupos/exportar/excel",
  authMiddleware,
  ReporteController.exportarResumenGruposExcel
);

// Admin: estado actual de un grupo (sin memoria)
router.get(
  "/grupos/:grupoId/estado-actual/exportar/excel",
  authMiddleware,
  ReporteController.exportarEstadoActualGrupoExcel
);

export default router;
