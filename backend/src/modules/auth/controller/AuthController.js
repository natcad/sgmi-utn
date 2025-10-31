//AuthController.js
import { AuthService } from "../services/AuthService.js";

//controlador para manejar las solicitudes de login 
//recibe email y password, llama al servicio de autenticación y devuelve los tokens generados
export const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        const resultado = await AuthService.login (email, password);
        res.json (resultado);
    }catch (err){
        res.status (401).json ({ error: err.message });
    }
};

//controlador para manejar la solicitud de refresh token
//recibe el token de refresco, llama al servicio de autenticación para generar un nuevo token de acceso
export const refreshToken = async (req, res) => {
    try{
        const { refreshToken } = req.body;
        const resultado = await AuthService.refreshToken(refreshToken);
        res.json (resultado);
    } catch (err){
        res.status (403).json ({ error: err.message });
    }
};  
//controlador para obtener los datos del usuario autenticado
export const me = async (req, res) => {
    try {
        const usuario = req.user; // El middleware de autenticación debe haber agregado el usuario a la solicitud
        res.json({ usuario });
    } catch (err) {
        res.status(401).json({ error: "Token invalido" });
    }
};