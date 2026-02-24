import { PersonalRepository } from "../repositories/PersonalRepository.js";
import { Usuario } from "../../Usuarios/models/Usuario.js";
import { PerfilUsuarioService } from "../../PerfilUsuario/services/PerfilUsuarioService.js";
import { PerfilUsuarioRepository } from "../../PerfilUsuario/repositories/PerfilUsuarioRepository.js";
import sequelize from "../../../config/database.js";
import db from "../../../models/db.js";

const {
  Personal,
  GrupoInvestigacion,
  Investigador,
  EnFormacion,
  FuenteFinanciamiento,
  ProgramaIncentivo,
  PerfilUsuario,
} = db.models;

const includeAllRelations = [
  {
    model: Usuario,
    as: "Usuario",
    attributes: ["id", "nombre", "apellido", "email"],
    include: [
      {
        model: PerfilUsuario,
        as: "PerfilUsuario",
        required: false,
      },
    ],
  },
  { model: GrupoInvestigacion, as: "grupo" },
  {
    model: Investigador,
    as: "Investigador",
    required: false,
    include: [{ model: ProgramaIncentivo, as: "ProgramaIncentivo", required: false }],
  },
  {
    model: EnFormacion,
    as: "EnFormacion",
    required: false,
    include: [{ model: FuenteFinanciamiento, as: "fuentesDeFinanciamiento", required: false }],
  },
];

export const PersonalService = {
  async obtenerTodos(filters = {}) {
    return await PersonalRepository.findAll(filters);
  },

  async obtenerPorId(id) {
    return await PersonalRepository.findById(id);
  },

async crear(data, transaction = null) {
  const t = transaction || await sequelize.transaction();

  try {
    const { Usuario: usuarioData, Investigador: investigadorData, EnFormacion: enFormacionData, PerfilUsuario: perfilUsuarioData, ...personalData } = data;

    const personal = await PersonalRepository.create(personalData, t);

    // Siempre actualizar personalId en Usuario cuando se crea un Personal
    if (personal.usuarioId) {
      const updateData = { personalId: personal.id };
      
      // Si hay usuarioData, también actualizar nombre, apellido, email
      if (usuarioData) {
        if (usuarioData.nombre) updateData.nombre = usuarioData.nombre;
        if (usuarioData.apellido) updateData.apellido = usuarioData.apellido;
        if (usuarioData.email) updateData.email = usuarioData.email;
      }
      
      await Usuario.update(
        updateData,
        { where: { id: personal.usuarioId }, transaction: t }
      );
    }

    // Crear o actualizar PerfilUsuario si hay datos
    if (perfilUsuarioData && personal.usuarioId) {
      await PerfilUsuarioService.actualizarOCrearPorUsuarioId(
        personal.usuarioId,
        perfilUsuarioData,
        t
      );
    }

    if (investigadorData) {
      await Investigador.create(
        { ...investigadorData, personalId: personal.id },
        { transaction: t }
      );
    }

    if (enFormacionData) {
      // Validar que tipoFormacion sea requerido
      if (!enFormacionData.tipoFormacion) {
        throw new Error("El tipo de formación es requerido para Personal en Formación");
      }

      const { fuentesDeFinanciamiento, ...enFormacionBase } = enFormacionData;

      const enFormacion = await EnFormacion.create(
        { ...enFormacionBase, personalId: personal.id },
        { transaction: t }
      );

      if (fuentesDeFinanciamiento?.length) {
        await FuenteFinanciamiento.bulkCreate(
          fuentesDeFinanciamiento.map(f => ({ ...f, enFormacionId: enFormacion.id })),
          { transaction: t }
        );
      }
    }

    const personalCompleto = await Personal.findByPk(personal.id, {
      include: [
        {
          model: Usuario,
          as: "Usuario",
          attributes: ["id", "nombre", "apellido", "email"],
          include: [
            {
              model: PerfilUsuario,
              as: "PerfilUsuario",
              required: false,
            },
          ],
        },
        { model: GrupoInvestigacion, as: "grupo" },
        {
          model: Investigador,
          as: "Investigador",
          required: false,
          include: [{ model: ProgramaIncentivo, as: "ProgramaIncentivo", required: false }],
        },
        {
          model: EnFormacion,
          as: "EnFormacion",
          required: false,
          include: [{ model: FuenteFinanciamiento, as: "fuentesDeFinanciamiento", required: false }],
        },
      ],
      transaction: t,
    });

    if (!transaction) await t.commit();

    return personalCompleto || personal;

  } catch (error) {
    if (!transaction) await t.rollback();
    throw error;
  }
},


  async actualizar(id, data) {
    const t = await sequelize.transaction();

    try {
      const personal = await PersonalRepository.findById(id, { transaction: t });
      if (!personal) throw new Error("Personal no encontrado");

      const { Usuario: usuarioData, Investigador: investigadorData, EnFormacion: enFormacionData, PerfilUsuario: perfilUsuarioData, usuarioId, nombre, apellido, email, ...personalData } = data;

      // Siempre actualizar personalId en Usuario
      if (personal.usuarioId) {
        const updateData = { personalId: personal.id };
        const datosUsuario = usuarioData || {};
        
        if (nombre || apellido || email) {
          datosUsuario.nombre = nombre || datosUsuario.nombre;
          datosUsuario.apellido = apellido || datosUsuario.apellido;
          datosUsuario.email = email || datosUsuario.email;
        }
        
        // Agregar campos de usuario si están presentes
        if (datosUsuario.nombre) updateData.nombre = datosUsuario.nombre;
        if (datosUsuario.apellido) updateData.apellido = datosUsuario.apellido;
        if (datosUsuario.email) updateData.email = datosUsuario.email;
        
        // Actualizar siempre para asegurar que personalId esté correcto
        await Usuario.update(
          updateData,
          { where: { id: personal.usuarioId }, transaction: t }
        );
      }

      if (perfilUsuarioData && personal.usuarioId) {
        await PerfilUsuarioService.actualizarOCrearPorUsuarioId(
          personal.usuarioId,
          perfilUsuarioData,
          t
        );
      }

      // Detectar cambio de ObjectType
      const objectTypeAnterior = personal.ObjectType;
      const objectTypeNuevo = personalData.ObjectType;
      const rolNuevo = personalData.rol;

      // Si el rol no es "Personal en Formación", limpiar nivelDeFormacion
      if (rolNuevo && rolNuevo !== "Personal en Formación") {
        personalData.nivelDeFormacion = null;
      }

      // Si cambia de "en formación" a otro tipo, eliminar EnFormacion
      if (objectTypeAnterior === "en formación" && objectTypeNuevo && objectTypeNuevo !== "en formación") {
        if (personal.EnFormacion) {
          // Eliminar fuentes de financiamiento primero
          await FuenteFinanciamiento.destroy({ 
            where: { enFormacionId: personal.EnFormacion.id }, 
            transaction: t 
          });
          // Eliminar EnFormacion
          await personal.EnFormacion.destroy({ transaction: t });
        }
      }

      // Si cambia de "investigador" a otro tipo, eliminar Investigador
      if (objectTypeAnterior === "investigador" && objectTypeNuevo && objectTypeNuevo !== "investigador") {
        if (personal.Investigador) {
          await personal.Investigador.destroy({ transaction: t });
        }
      }

      // Si cambia a "investigador" y había EnFormacion, eliminar primero
      if (objectTypeNuevo === "investigador" && personal.EnFormacion) {
        await FuenteFinanciamiento.destroy({ 
          where: { enFormacionId: personal.EnFormacion.id }, 
          transaction: t 
        });
        await personal.EnFormacion.destroy({ transaction: t });
      }

      // Si cambia a "en formación" y había Investigador, eliminar primero
      if (objectTypeNuevo === "en formación" && personal.Investigador) {
        await personal.Investigador.destroy({ transaction: t });
      }

      await PersonalRepository.update(id, personalData, t);

      // Recargar personal para tener las relaciones actualizadas
      await personal.reload({
        include: [
          { model: Investigador, as: "Investigador", required: false },
          { model: EnFormacion, as: "EnFormacion", required: false }
        ],
        transaction: t
      });

      if (investigadorData && objectTypeNuevo === "investigador") {
        if (personal.Investigador) {
          await personal.Investigador.update(investigadorData, { transaction: t });
        } else {
          await Investigador.create({ personalId: personal.id, ...investigadorData }, { transaction: t });
        }
      }

      if (enFormacionData && objectTypeNuevo === "en formación") {
        // Validar que tipoFormacion sea requerido
        if (!enFormacionData.tipoFormacion) {
          throw new Error("El tipo de formación es requerido para Personal en Formación");
        }

        if (personal.EnFormacion) {
          const { fuentesDeFinanciamiento, ...enFormacionDataSinFuentes } = enFormacionData;
          await personal.EnFormacion.update(enFormacionDataSinFuentes, { transaction: t });

          if (fuentesDeFinanciamiento && Array.isArray(fuentesDeFinanciamiento)) {
            await FuenteFinanciamiento.destroy({ where: { enFormacionId: personal.EnFormacion.id }, transaction: t });
            if (fuentesDeFinanciamiento.length > 0) {
              await FuenteFinanciamiento.bulkCreate(
                fuentesDeFinanciamiento.map(f => ({ ...f, enFormacionId: personal.EnFormacion.id })),
                { transaction: t }
              );
            }
          }
        } else {
          const { fuentesDeFinanciamiento, ...enFormacionDataSinFuentes } = enFormacionData;
          const nuevaEnFormacion = await EnFormacion.create({ personalId: personal.id, ...enFormacionDataSinFuentes }, { transaction: t });
          if (fuentesDeFinanciamiento && fuentesDeFinanciamiento.length > 0) {
            await FuenteFinanciamiento.bulkCreate(
              fuentesDeFinanciamiento.map(f => ({ ...f, enFormacionId: nuevaEnFormacion.id })),
              { transaction: t }
            );
          }
        }
      }

      // Recargamos siempre todas las relaciones antes de confirmar
      const personalActualizado = await Personal.findByPk(id, {
        include: [
          {
            model: Usuario,
            as: "Usuario",
            attributes: ["id", "nombre", "apellido", "email"],
            include: [
              {
                model: PerfilUsuario,
                as: "PerfilUsuario",
                required: false,
              },
            ],
          },
          { model: GrupoInvestigacion, as: "grupo" },
          {
            model: Investigador,
            as: "Investigador",
            required: false,
            include: [{ model: ProgramaIncentivo, as: "ProgramaIncentivo", required: false }],
          },
          {
            model: EnFormacion,
            as: "EnFormacion",
            required: false,
            include: [{ model: FuenteFinanciamiento, as: "fuentesDeFinanciamiento", required: false }],
          },
        ],
        transaction: t,
      });

      await t.commit();

      return personalActualizado || personal;

    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      throw error;
    }
  },

  async eliminar(id) {
    const t = await sequelize.transaction();
    
    try {
      // Buscar el personal antes de eliminarlo para obtener el usuarioId
      const personal = await PersonalRepository.findById(id, { transaction: t });
      if (!personal) {
        throw new Error("Personal no encontrado");
      }

      // Si tiene usuarioId, eliminar el PerfilUsuario asociado
      if (personal.usuarioId) {
        const perfilUsuario = await PerfilUsuarioRepository.findByUsuarioId(personal.usuarioId);
        if (perfilUsuario) {
          await PerfilUsuarioRepository.delete(perfilUsuario.id, t);
        }
      }

      await PersonalRepository.delete(id, t);
      
      await t.commit();
      return personal;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },
};
