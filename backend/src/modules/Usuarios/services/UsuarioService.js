//UsuarioService.js
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";

export const UsuarioService = {
  /*------ GETALL  ------*/
  //buscar todos los usuarios con filtros opcionales
  getAll: async (filters = {}) => {
    return await UsuarioRepository.findAll(filters);
  },
  /*------ GETBYID  ------*/
  //buscar usuario por id
  getById: async (id) => {
    const usuario = await UsuarioRepository.findById(id);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    return usuario;
  },
  /*------ UPDATE  ------*/
  //actualizar usuario
  update: async (id, data) => {
    const usuario = await UsuarioRepository.findById;
    if (!usuario) throw new Error("Usuario no encontrado");
    return await UsuarioRepository.update(id, data);
  },
  /*------ DELETE  ------*/
  //eliminar (desactivar) usuario
  delete: async (id) => {
    const usuario = await UsuarioRepository.findById(id);
    if (!usuario) throw new Error("Usuario no encontrado");
    return await UsuarioRepository.delete(id);
  },
  /*------ RESTORE  ------*/
  //restaurar (activar) usuario
  restore: async (id) => {
    const usuario = await UsuarioRepository.findById(id);
    if (!usuario) throw new Error("Usuario no encontrado");
    return await UsuarioRepository.restore(id);
  },
  /*------ GETBYEMAIL  ------*/
  //buscar usuario por email
  getByEmail: async (email) => {
    const usuario = await UsuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
  },

  /*------ crearIntegranteYNotificar({nombre,apellid,email,grupo})  ------*/
  async crear(data, transaction = null) {
  return await UsuarioRepository.createUser(data, transaction);
}}
