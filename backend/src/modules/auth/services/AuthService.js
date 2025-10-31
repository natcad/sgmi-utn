//AuthService.js
// Servicio de autenticación
import { Usuario } from "../../Usuarios/models/Usuario.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//permite generar un token de acceso para un usuario autenticado
//el token se lo envia al cliente para que lo use en futuras solicitudes
//le permite al usuario acceder a las peticiones protegidas
const generarAccessToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
//permite generar un token de refresco para un usuario autenticado
//el token de refresco tiene una vida más larga y se usa para obtener nuevos tokens de acceso sin que el usuario tenga que autenticarse nuevamente
const generarRefreshToken = (usuario) => {
  return jwt.sign({ id: usuario.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export class AuthService {
  //inicia sesion y devuelve tokens
  static async login(email, password) {
    const usuario = await Usuario.unscoped().findOne({ where: { email } });
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    if (!usuario.activo) {
      throw new Error("Usuario inactivo. Contacte al administrador.");
    }
    const passwordValido = usuario.password === password || await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      throw new Error("Contraseña incorrecta");
    }
    const accessToken = generarAccessToken(usuario);
    const refreshToken = generarRefreshToken(usuario);
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
  //refresca el token de acceso usando el token de refresco
  static async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const usuario = await Usuario.findByPk(decoded.id);
        if (!usuario||!usuario.activo ) {
            throw new Error("Usuario no encontrado o inactivo");
        }
        const nuevoAccessToken = generarAccessToken(usuario);
        const nuevoRefreshToken = generarRefreshToken(usuario);
        return {
            accessToken: nuevoAccessToken,
            refreshToken: nuevoRefreshToken,
        };
    } catch (err) {
      throw new Error("Token de refresco inválido o expirado");
    }  
    }

    //verificar token de acceso
    static async verificarToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            throw new Error("Token de acceso inválido o expirado");
        }
    }
}
//FALTA REGISTER, FORGOT PASSWORD, RESET PASSWORD, CHANGE PASSWORD, 
//SENDCONFIRMATION VERIFYEMAIL, RESEND CONFIRMATION EMAIL
//GETME UPDATEME
