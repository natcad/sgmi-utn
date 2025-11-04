//auth.routes.js
import express from "express";
import {
  login,
  refreshToken,
  me,
  register,
  confirmUser,
  forgotPassword,
  resetPassword,
  changePassword,
  resendConfirmation,
  logout
} from "../controller/AuthController.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// Ruta para login
router.post("/login", login);
// Ruta para refresh token
router.post("/refresh", refreshToken);
//ruta para registro
router.post("/register", register);
//ruta para confirmar nuevo usuario
router.get("/confirm/:token", confirmUser);
//ruta para reenviar email de confirmación
router.post("/forgot-password", forgotPassword);
//ruta para resetear la contraseña    
router.post("/reset-password/:token", resetPassword);
//ruta para reenviar email de confirmación
router.post("/resend-confirmation", resendConfirmation);
router.post("/logout",logout);

// Ruta protegida para obtener datos del usuario autenticado
// Ruta para obtener datos del usuario autenticado
router.get("/me", authMiddleware, me);
// Ruta para cambiar la contraseña
router.post("/change-password", authMiddleware, changePassword);

export default router;
