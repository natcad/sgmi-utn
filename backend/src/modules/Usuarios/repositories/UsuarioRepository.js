// import {Usuario} from "../models/Usuario.js";

// export const UsuarioRepository = {
//     //buscar todos los usuarios
//     findAll: async () => {
//         return await Usuario.findAll();
//     },
//     //buscar usuario por email
//     findByEmail: async (email) => {
//         return await Usuario.unscoped().findOne({ where: { email } });
//     },
//     //buscar usuario por id
//     findById: async (id) => {
//         return await Usuario.findByPk(id);
//     },
//     //crear nuevo usuario
//     create: async (data) => {
//         return await Usuario.create(data);
//     },
//     //actualizar usuario
//     update: async (id, data) => {
//         const usuario = await Usuario.findByPk(id);
//         if (!usuario) {
//             throw new Error("Usuario no encontrado");
//         }
//         return await usuario.update(data);
//     },
//     //eliminar usuario
//     delete: async (id) => {
//         const usuario = await Usuario.findByPk(id);
//         if (!usuario) {
//             throw new Error("Usuario no encontrado");
//         }
//         return await usuario.destroy();
//     },    
// };