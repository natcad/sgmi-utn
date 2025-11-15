import { PersonalService } from "../services/PersonalService.js";
import { UsuarioService } from "../../Usuarios/services/UsuarioService.js";
import { enviarIngresoGrupo } from "../../../utils/mailer.js";
import { Usuario } from "../../Usuarios/models/Usuario.js";
export const PersonalController = {
  async listar(req, res) {
    try {
      const filters = {
        search: req.query.search || undefined,
        grupoId: req.query.grupoId || undefined,
        nivelDeFormacion: req.query.nivelDeFormacion || undefined,
        rol: req.query.rol || undefined,
        emailInstitucional: req.query.emailInstitucional || undefined,
      };
      const personal = await PersonalService.obtenerTodos(filters);
      res.status(200).json(personal);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async buscarPorId(req, res) {
    try {
      const id = req.params;
      const usuario = await PersonalService.obtenerPorId(id);
      if (!usuario)
        return res.status(404).json({ mensaje: "Investigador no encontrado" });
      res.status(200).json(usuario);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async crear(req, res) {
    const { email, nombre, apellido, rol, grupo, ...otrosDatos } = req.body;
    let usuario = await Usuario.findOne({ where: { email } });
    try {
      if (usuario) {
        await enviarIngresoGrupo(email, grupo);
      } else {
        usuario = await UsuarioService.crearIntegranteYNotificar({
          nombre,
          apellido,
          email,
          grupo,
        });
      }
      const personal = await PersonalService.crear({
        usuarioId: usuario.id,
        grupoId: grupo.id,
        rol,
        ...otrosDatos,
      });
      res.status(201).json(personal);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async actualizar(req, res) {
    try {
      const personal = await PersonalService.actualizar(
        req.params.id,
        req.body
      );
      res.status(200).json(personal);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async eliminar(req, res) {
    try {
      const eliminado = await PersonalService.eliminar(req.params.id);
      res.status(200).json(eliminado);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
