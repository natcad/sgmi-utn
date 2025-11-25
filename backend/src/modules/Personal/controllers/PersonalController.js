import { PersonalService } from "../services/PersonalService.js";
import { UsuarioService } from "../../Usuarios/services/UsuarioService.js";
import {
  enviarIngresoGrupo,
  enviarCorreoNotificacion,
} from "../../../utils/mailer.js";
import sequelize from "../../../config/database.js";
import { generarPasswordTemporal } from "../../../utils/password.js";
import { generarTokenConfirmacion } from "../../../utils/jwt.js";
import db from "../../../models/db.js"; // adaptá ruta si estás más profundo
const {
  Usuario,
  GrupoInvestigacion,
 } = db.models;

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
      const resultado = personal.map((p) => {
        const base = {
          id: p.id,
          Usuario: p.Usuario,
          grupo: p.grupo,
          rol: p.rol,
          ObjectType: p.ObjectType,
        };
        if (p.ObjectType === "investigador") {
          base.investigador = p.investigador;
        } else if (p.ObjectType === "en formacion") {
          base.enFormacion = p.enFormacion;
        }
        return base;
      });
      res.status(200).json(resultado);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async buscarPorId(req, res) {
    try {
      const id = req.params;
      const personal = await PersonalService.obtenerPorId(id);
      if (!personal)
        return res.status(404).json({ mensaje: "usuario no encontrado" });
      const resultado = personal.map((p) => {
        const base = {
          id: p.id,
          usuario: p.usuario,
          grupo: p.grupo,
          rol: p.rol,
          ObjectType: p.ObjectType,
        };
        if (p.ObjectType === "investigador") {
          base.investigador = p.investigador;
        } else if (p.ObjectType === "en formacion") {
          base.enFormacion = p.enFormacion;
        }
        return base;
      });
      res.status(200).json(resultado);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async crear(req, res) {
    const t = await sequelize.transaction();
    try {
      const { email, nombre, apellido, rol, grupo, ...otrosDatos } = req.body;
      let usuario = await Usuario.findOne({ where: { email }, transaction: t });
      let passwordTemporal,
        emailToken,
        esNuevo = false;

      if (!usuario) {
        passwordTemporal = generarPasswordTemporal();

        usuario = await UsuarioService.crear(
          {
            nombre,
            apellido,
            email,
            password: passwordTemporal,
            rol: "integrante",
            activo: false,
          },
          t
        );
        emailToken = generarTokenConfirmacion(usuario);
        esNuevo = true;
      }
      const grupoCompleto =
        typeof grupo === "object"
          ? grupo
          : await Grupo.findByPk(grupo, { transaction: t });
      if (!grupoCompleto) throw new Error("Grupo no encontrado");

      const personal = await PersonalService.crear(
        {
          usuarioId: usuario.id,
          grupoId: grupo.id,
          rol,
          ...otrosDatos,
        },
        t
      );
      await personal.reload({
        include: [
          { model: Usuario, as: "Usuario", attributes: ["id", "email", "nombre", "apellido"] },
          { model: GrupoInvestigacion, as: "grupo", attributes: ["id", "nombre", "siglas"] },
        ],
        transaction: t,
      });
      await t.commit();
      if (esNuevo) {
        await enviarCorreoNotificacion(
          email,
          passwordTemporal,
          nombre,
          apellido,
          grupoCompleto,
          emailToken
        );
      } else {
        await enviarIngresoGrupo(email, nombre, apellido, grupoCompleto);
      }

      res.status(201).json({ usuario, personal });
    } catch (err) {
      await t.rollback();

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
