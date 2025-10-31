//auth.routes.js
import express from "express";
import {login, refreshToken, me} from "../controller/AuthController.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";


const router = express.Router();

// Ruta para login
router.post("/login", login);
// Ruta para refresh token
router.post("/refresh", refreshToken);
// Ruta para obtener datos del usuario autenticado
router.get("/me", authMiddleware, me);



export default router;