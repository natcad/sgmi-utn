//AuthController.js
import { AuthService } from "../services/AuthService.js";

/*--------------LOGIN---------------*/
//controlador para manejar las solicitudes de login
//recibe email y password, llama al servicio de autenticación y devuelve los tokens generados
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const resultado = await AuthService.login(email, password);

    res.cookie("refreshToken", resultado.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res
      .status(200)
      .json({ accessToken: resultado.accessToken, usuario: resultado.usuario });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

/*-------------REGISTER---------------*/
//controlador para manejar las solicitudes de registro
//recibe los datos del usuario, llama al servicio de autenticación para crear el usuario
export const register = async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;
    const resultado = await AuthService.register(
      nombre,
      apellido,
      email,
      password
    );
    return res.status(201).json(resultado);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/*--------------CONFIRM USER----------- */
//controlador para manejar la confirmación de un nuevo usuario
//recibe el token de confirmación, llama al servicio de autenticación para activar el usuario
export const confirmUser = async (req, res) => {
  try {
    const { token } = req.params;
    const resultado = await AuthService.confirmUser(token);
    res.status(200).json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/*----------------- forgot password----------------- */
//controlador para manejar las solicitudes de reseteo de contraseña
//recibe el email del usuario, llama al servicio de autenticación para enviar el email de reseteo
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const resultado = await AuthService.forgotPassword(email);
    res.status(200).json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/*----------------- reset password----------------- */
//controlador para manejar las solicitudes de cambio de contraseña
//recibe el token de reseteo y la nueva contraseña, llama al servicio de autenticación para actualizar la contraseña
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const resultado = await AuthService.resetPassword(token, newPassword);
    res.status(200).json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ----------- change password-------------- */
//controlador para manejar las solicitudes de cambio de contraseña
//recibe el id del usuario autenticado, la contraseña actual y la nueva contraseña, llama al servicio de autenticación para actualizar la contraseña
export const changePassword = async (req, res) => {
  try {
    const email = req.user.email;
    const { currentPassword, newPassword } = req.body;
    const resultado = await AuthService.changePassword(
      email,
      currentPassword,
      newPassword
    );
    res.status(200).json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/*  RESEND CONFIRMATION */
export const resendConfirmation = async (req, res) => {
  try {
    const { email } = req.body;
    const resultado = await AuthService.resendConfirmation(email);
    res.status(200).json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/*--------------REFRESH TOKEN---------------*/
//controlador para manejar la solicitud de refresh token
//recibe el token de refresco, llama al servicio de autenticación para generar un nuevo token de acceso
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const resultado = await AuthService.refreshToken(refreshToken);
    res.status(200).json(resultado);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

/*--------------ME---------------*/
//controlador para obtener los datos del usuario autenticado
export const me = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await AuthService.getMe(userId);
    return res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: "Token invalido" });
  }
};
