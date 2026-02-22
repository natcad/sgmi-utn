import { Router } from 'express';
import * as facultadController from './facultad.controller.js';
import {authMiddleware} from "../../middlewares/authMiddleware.js"
const router = Router();

router.use(authMiddleware);

// ✅ CORRECTO: Usa solo '/' porque el prefijo ya lo pusiste en index.js
router.get('/', facultadController.obtenerTodasLasFacultades); 

export default router;