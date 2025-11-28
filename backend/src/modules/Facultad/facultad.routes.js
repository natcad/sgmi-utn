import { Router } from 'express';
import * as facultadController from './facultad.controller.js';

const router = Router();

// ✅ CORRECTO: Usa solo '/' porque el prefijo ya lo pusiste en index.js
router.get('/', facultadController.obtenerTodasLasFacultades); 

export default router;