//AuthService.js
// Servicio de autenticación
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRepository } from "../repositories/AuthRepository.js";
import {
  generarAccessToken,
  generarRefreshToken,
  generarResetToken,
  generarTokenConfirmacion,
} from "../../../utils/jwt.js";
import { sendConfirmationMail, sendResetPasswordMail } from "../../../utils/mailer.js";


export class AuthService {
  /*-------------------LOGIN----------------------*/
  //inicia sesion y devuelve tokens
  static async login(email, password) {
    //buscar el usuario por email
    const usuario = await AuthRepository.findByEmail(email);
    //si no existe o no está activo, error
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    if (!usuario.activo) {
      throw new Error("Usuario inactivo. Contacte al administrador.");
    }
    //verificar la contraseña
    const passwordValido =
      usuario.password === password ||
      (await bcrypt.compare(password, usuario.password));
    //si la contraseña no es válida, error
    if (!passwordValido) {
      throw new Error("Contraseña incorrecta");
    }
    //generar tokens
    const accessToken = generarAccessToken(usuario);
    const refreshToken = generarRefreshToken(usuario);
    //devolver usuario y tokens
    return {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
      accessToken,
      refreshToken,
    };
  }

  /*-------------------REFRESH TOKEN----------------------*/
  //refresca el token de acceso usando el token de refresco
  static async refreshToken(token) {
    try {
      //verificar el token de refresco
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      //buscar el usuario asociado al token
      const usuario = await AuthRepository.findById(decoded.id);
      //si el usuario no existe o no está activo, error
      if (!usuario || !usuario.activo) {
        throw new Error("Usuario no encontrado o inactivo");
      }
      //generar nuevos tokens
      const nuevoAccessToken = generarAccessToken(usuario);
      const nuevoRefreshToken = generarRefreshToken(usuario);
      //devolver los nuevos tokens
      return {
        accessToken: nuevoAccessToken,
        refreshToken: nuevoRefreshToken,
      };
    } catch (err) {
      //si el token es inválido o expirado, error
      throw new Error("Token de refresco inválido o expirado");
    }
  }
  /*-------------------VERIFICAR TOKEN----------------------*/
  //verificar token de acceso
  static async verificarToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error("Token de acceso inválido o expirado");
    }
  }
  /*-------------------REGISTER----------------------*/
  //registrar nuevo usuario
  static async register(nombre, apellido, email, password) {
    //verificar si el email ya está registrado
    const existingUser = await AuthRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("El email ya está registrado");
    }
    //hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    //crear el usuario inactivo hasta que confirme su email
    const nuevoUsuario = await AuthRepository.createUser({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      activo: false,
      rol: "integrante",
    });

    //TOken de confirmación de email
    const emailToken = generarTokenConfirmacion(nuevoUsuario);

    //Enviar email de confirmación (lógica de envío de email no implementada aquí)
    sendConfirmationMail(email, emailToken);
    return {
      message: "Usuario registrado. Por favor, confirme su email.",
      userId: nuevoUsuario.id,
    };
  }

  /*-------------------ACTIVAR USUARIO----------------------*/
  static async confirmUser(token) {
    try {
      //verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //buscar el usuario por email
      const { email } = decoded;
      const usuario = await AuthRepository.findByEmail(email);
      //si no existe o ya está activo, error
      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }
      if (usuario.activo) {
        throw new Error("Usuario ya activado");
      }

      //activar el usuario
      await AuthRepository.activateUser(email);
      return { message: "Usuario activado correctamente" };
    } catch (err) {
      throw new Error("Error al activar el usuario, Token inválido o expirado");
    }
  }
  /*-------------------FORGOT PASSWORD----------------------*/
  static async forgotPassword(email) {
    //buscar el usuario por email
    const usuario = await AuthRepository.findByEmail(email);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    if (!usuario.activo) {
      throw new Error("Usuario inactivo. Contacte al administrador.");
    }
    //generar token de reseteo de contraseña
    const resetToken = generarResetToken(email);
    //Enviar email con el token de reseteo (lógica de envío de email no implementada aquí)
    sendResetPasswordMail(email, resetToken);
    return { message: "Se ha enviado un email para resetear la contraseña" };
  }
  /*-------------------RESET PASSWORD----------------------*/
  static async resetPassword(token, newPassword) {
    try {
      //verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      const { email } = decoded;
      console.log(email);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      //actualizar la contraseña del usuario
      await AuthRepository.updatePassword(email, hashedPassword);
      return { message: "Contraseña reseteada correctamente" };
    } catch (err) {
      console.error(err);
      throw new Error("Token inválido o expirado");
    }
  }

  /*-------------------CHANGE PASSWORD----------------------*/
  static async changePassword(email, currentPassword, newPassword) {
    //buscar el usuario por email
    const usuario = await AuthRepository.findByEmail(email);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    //verificar la contraseña actual
    const passwordValido = await bcrypt.compare(
      currentPassword,
      usuario.password
    );
    if (!passwordValido) {
      throw new Error("Contraseña actual incorrecta");
    }
    //hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    //actualizar la contraseña
    await AuthRepository.updatePassword(email, hashedPassword);
    return { message: "Contraseña cambiada correctamente" };
  }

  /*-------------------GET ME----------------------*/
  //obtener datos del usuario autenticado
  static async getMe(userId) {
    const usuario = await AuthRepository.findById(userId);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    const { password, ...userSinPassword } = usuario.toJSON();
    return userSinPassword;
  }

  /*-------------------resend confirmation email----------------------*/
  static async resendConfirmationEmail(email) {
    //buscar el usuario por email
    const usuario = await AuthRepository.findByEmail(email);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    if (usuario.activo) {
      throw new Error("El usuario ya está activado");
    }
    //generar nuevo token de confirmación de email
    const emailToken = generarResetToken(email);
    //Enviar email de confirmación (lógica de envío de email no implementada aquí)
    sendConfirmationMail(email, emailToken);
    return { message: "Se ha reenviado el email de confirmación" };
  }
}
