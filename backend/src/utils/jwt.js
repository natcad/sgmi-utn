import jwt from "jsonwebtoken";
//permite generar un token de acceso para un usuario autenticado
//el token se lo envia al cliente para que lo use en futuras solicitudes
//le permite al usuario acceder a las peticiones protegidas
export const generarAccessToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
//permite generar un token de refresco para un usuario autenticado
//el token de refresco tiene una vida más larga y se usa para obtener nuevos tokens de acceso sin que el usuario tenga que autenticarse nuevamente
export const generarRefreshToken = (usuario) => {
  return jwt.sign({ id: usuario.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};
//permite generar un token para confirmar nuevo usuario
export const generarTokenConfirmacion = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};
//permite generar un token para restablecer la contraseña
export const generarResetToken = (email) => {  
    return jwt.sign(
        {email},
        process.env.JWT_SECRET,
        {expiresIn: "1h"}
    );
};


