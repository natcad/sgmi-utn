//UsuarioService.js
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import bcrypt from "bcryptjs";

export const UsuarioService = {
    getAll: async () => {
        return await UsuarioRepository.findAll();
    },
    getById: async (id) => {
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }      
        return await UsuarioRepository.findById(id);
    },
    create: async (data) => {
            const existing = await UsuarioRepository.findByEmail(data.email);
            if (existing) throw new Error("El email ya está registrado");
        //hashear la contraseña antes de guardar
        const hashedPassword = await bcrypt.hash(data.password, 10);
    const usuario = await UsuarioRepository.create({
      ...data,
      password: hashedPassword,
      rol: data.rol || "integrante",
    });
    return usuario;    
},
    update: async (id, data) => {
        const usuario = await UsuarioRepository.findById
        if (!usuario) throw new Error("Usuario no encontrado");

        if (data.password) {
            //hashear la nueva contraseña
            data.password = await bcrypt.hash(data.password, 10);
        }   
        return await UsuarioRepository.update(id, data);
    },
    delete: async (id) => {
        const usuario = await UsuarioRepository.findById(id);
        if (!usuario) throw new Error("Usuario no encontrado");
        return await UsuarioRepository.delete(id);
    },
};