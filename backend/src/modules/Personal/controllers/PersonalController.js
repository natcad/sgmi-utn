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
          horasSemanales: p.horasSemanales,
        };
        
        if (p.ObjectType === "investigador" && p.Investigador) {
          return {
            ...base,
            categoriaUTN: p.Investigador.categoriaUTN,
            dedicacion: p.Investigador.dedicacion,
            ProgramaIncentivo: p.Investigador.ProgramaIncentivo || null,
          };
        } else if (p.ObjectType === "en formación" && p.EnFormacion) {
          return {
            ...base,
            tipoFormacion: p.EnFormacion.tipoFormacion,
            fuentesDeFinanciamiento: p.EnFormacion.fuentesDeFinanciamiento || [],
          };
        }
        
        return base;
      });
      res.status(200).json(resultado);
    } catch (err) {
      console.error("Error en listar:", err);
      res.status(500).json({ error: err.message || "Error interno del servidor" });
    }
  },
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const personal = await PersonalService.obtenerPorId(id);

      if (!personal) return res.status(404).json({ mensaje: "Personal no encontrado" });

      const base = {
        id: personal.id,
        Usuario: personal.Usuario,
        grupo: personal.grupo,
        rol: personal.rol,
        ObjectType: personal.ObjectType,
        horasSemanales: personal.horasSemanales,
      };

      let resultado = base;
      
      if (personal.ObjectType === "investigador" && personal.Investigador) {
        resultado = {
          ...base,
          categoriaUTN: personal.Investigador.categoriaUTN,
          dedicacion: personal.Investigador.dedicacion,
          ProgramaIncentivo: personal.Investigador.ProgramaIncentivo,
        };
      } else if (personal.ObjectType === "en formación" && personal.EnFormacion) {
        resultado = {
          ...base,
          tipoFormacion: personal.EnFormacion.tipoFormacion,
          fuentesDeFinanciamiento: personal.EnFormacion.fuentesDeFinanciamiento,
        };
      }

      res.status(200).json(resultado);
    } catch (err) {
      console.error("Error en buscarPorId:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
  async crear(req, res) {
    const t = await sequelize.transaction();
    try {
      const { email, nombre, apellido, rol, grupoId, usuarioId, ...otrosDatos } = req.body;
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
      const grupoCompleto = await GrupoInvestigacion.findByPk(grupoId, { transaction: t });
      if (!grupoCompleto) throw new Error("Grupo no encontrado");

      const personal = await PersonalService.crear(
        {
          usuarioId: usuario.id,
          grupoId: grupoCompleto.id,
          rol,
          emailInstitucional: email,
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
      if (err.errors) {
         console.log("ERRORES DE VALIDACIÓN:", err.errors.map(e => e.message));
      } else {
         console.log(err);
      }
      res.status(500).json({ error: err.message });
    }
  },
  async actualizar(req, res) {
    try {
      const personal = await PersonalService.actualizar(
        req.params.id,
        req.body
      );
      
      if (!personal) return res.status(404).json({ mensaje: "Personal no encontrado" });

      const base = {
        id: personal.id,
        Usuario: personal.Usuario,
        grupo: personal.grupo,
        rol: personal.rol,
        ObjectType: personal.ObjectType,
        horasSemanales: personal.horasSemanales,
      };

      let resultado = base;
      
      if (personal.ObjectType === "investigador" && personal.Investigador) {
        resultado = {
          ...base,
          categoriaUTN: personal.Investigador.categoriaUTN,
          dedicacion: personal.Investigador.dedicacion,
          ProgramaIncentivo: personal.Investigador.ProgramaIncentivo,
        };
      } else if (personal.ObjectType === "en formación" && personal.EnFormacion) {
        resultado = {
          ...base,
          tipoFormacion: personal.EnFormacion.tipoFormacion,
          fuentesDeFinanciamiento: personal.EnFormacion.fuentesDeFinanciamiento,
        };
      }

      res.status(200).json(resultado);
    } catch (err) {
      console.error("Error en actualizar:", err);
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
