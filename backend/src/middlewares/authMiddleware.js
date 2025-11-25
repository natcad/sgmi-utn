//authMiddleware.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token requerido" });
    const token = authHeader.split(" ")[1];
    // Verificar el token si no existe devuelve error 401
    if (!token) return res.status(401).json({ error: "Formato Invalido" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Agregar los datos del usuario decodificados a la solicitud
        next(); // Continuar al siguiente middleware o ruta
    } catch (err) {
        return res.status(403).json({ error: "Token invalido o expirado" });
    }
};