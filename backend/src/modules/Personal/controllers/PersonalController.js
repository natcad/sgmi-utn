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
import { uploadImage } from "../services/cloudinary.service.js";
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
    // Parsear datos del FormData
    let bodyData = {};
    if (req.body.data) {
      try {
        bodyData = JSON.parse(req.body.data);
      } catch (e) {
        console.error("Error parseando req.body.data:", e);
        bodyData = req.body;
      }
    } else {
      bodyData = req.body;
    }

    const {
      email,
      nombre,
      apellido,
      rol,
      grupoId,
      usuarioId,
      horasSemanales,         
      emailInstitucional,     
      ObjectType,
      nivelDeFormacion,
      Investigador,
      EnFormacion,
      PerfilUsuario,
      ...otrosDatos
    } = bodyData;

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Email inválido recibido en el servidor" });
    }

    // --- Validar horasSemanales antes de ir al modelo ---
    if (horasSemanales == null) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "horasSemanales es obligatorio" });
    }

    // --- Validar nivelDeFormacion para Personal en Formación ---
    if (rol === "Personal en Formación") {
      const tipoFormacion = nivelDeFormacion || EnFormacion?.tipoFormacion;
      if (!tipoFormacion || tipoFormacion.trim() === "") {
        await t.rollback();
        return res
          .status(400)
          .json({ error: "El tipo de formación es requerido cuando el rol es Personal en Formación" });
      }
    }

    // --- Manejo de imagen (Cloudinary) igual que antes ---
    let fotoPerfilUrl = null;

    if (req.file && req.file.buffer) {
      try {
        const uploadResult = await uploadImage(
          req.file.buffer,
          "perfiles-usuarios"
        );
        fotoPerfilUrl = uploadResult.url;

        otrosDatos.PerfilUsuario = {
          ...(PerfilUsuario || {}),
          fotoPerfil: fotoPerfilUrl,
        };
      } catch (error) {
        console.error("Error subiendo imagen a Cloudinary:", error);
      }
    } else if (PerfilUsuario) {
      otrosDatos.PerfilUsuario = PerfilUsuario;
    }

    // --- Buscar o crear usuario ---
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

    if (usuario.rol === "admin") {
      await t.rollback();
      return res.status(400).json({
        message:
          "Un usuario administrador no puede ser integrante de un grupo.",
      });
    }

    // --- Verificar grupo ---
    const grupoCompleto = await GrupoInvestigacion.findByPk(grupoId, {
      transaction: t,
    });
    if (!grupoCompleto) {
      await t.rollback();
      return res.status(400).json({ error: "Grupo no encontrado" });
    }

    const personal = await PersonalService.crear(
      {
        usuarioId: usuario.id,
        grupoId,
        rol,
        emailInstitucional: emailInstitucional || email, 
        horasSemanales,                                  
        ObjectType,
        nivelDeFormacion,
        Investigador,
        EnFormacion,
        ...otrosDatos,
      },
      t
    );

    await personal.reload({
      include: [
        {
          model: Usuario,
          as: "Usuario",
          attributes: ["id", "email", "nombre", "apellido"],
        },
        {
          model: GrupoInvestigacion,
          as: "grupo",
          attributes: ["id", "nombre", "siglas"],
        },
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

    return res.status(201).json({ usuario, personal });
  } catch (err) {
    await t.rollback();
    console.error("Error en PersonalController.crear:", err);
    return res.status(500).json({ error: err.message });
  }
}
,

  async actualizar(req, res) {
    try {
      // Parsear datos del FormData
      let bodyData = req.body;
      if (req.body.data) {
        try {
          bodyData = JSON.parse(req.body.data);
        } catch (e) {
          bodyData = req.body;
        }
      }

      // Manejar eliminación de imagen
      if (bodyData.eliminarFotoPerfil) {
        if (!bodyData.PerfilUsuario) {
          bodyData.PerfilUsuario = {};
        }
        bodyData.PerfilUsuario.fotoPerfil = null;
        delete bodyData.eliminarFotoPerfil; // Limpiar el flag
      }

      // Manejar subida de imagen
      if (req.file && req.file.buffer) {
        try {
          const uploadResult = await uploadImage(
            req.file.buffer,
            "perfiles-usuarios"
          );
          const fotoPerfilUrl = uploadResult.url;
          
          // Agregar fotoPerfil a PerfilUsuario si no existe
          if (!bodyData.PerfilUsuario) {
            bodyData.PerfilUsuario = {};
          }
          bodyData.PerfilUsuario.fotoPerfil = fotoPerfilUrl;
        } catch (error) {
          console.error("Error subiendo imagen a Cloudinary:", error);
          // Continuar sin la imagen si falla
        }
      }

      const personal = await PersonalService.actualizar(
        req.params.id,
        bodyData
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
