import { PersonalRepository } from "../repositories/PersonalRepository.js";
import { Usuario } from "../../Usuarios/models/Usuario.js";
import { PerfilUsuarioService } from "../../PerfilUsuario/services/PerfilUsuarioService.js";
import { PerfilUsuarioRepository } from "../../PerfilUsuario/repositories/PerfilUsuarioRepository.js";
import sequelize from "../../../config/database.js";
import db from "../../../models/db.js";

<<<<<<< HEAD
export const PersonalService ={
    async obtenerTodos(filters={}){
        return await PersonalRepository.findAll(filters);
    },
    async obternerPorUsuarioId(usuarioId){
        const personal=  await PersonalRepository.findByUsuarioId(usuarioId);
        if(!personal) throw new Error("Personal no encontrado");
        return personal;
    },
    async obtenerPorId(id){
        const personal=  await PersonalRepository.findById(id);
        if(!personal) throw new Error("Personal no encontrado");
        return personal;
    } ,
=======
const {
  Personal,
  GrupoInvestigacion,
  Investigador,
  EnFormacion,
  FuenteFinanciamiento,
  ProgramaIncentivo,
  PerfilUsuario,
} = db.models;
>>>>>>> origin/modulo-personal

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

    if (usuarioData && personal.usuarioId) {
      await Usuario.update(
        {
          nombre: usuarioData.nombre,
          apellido: usuarioData.apellido,
          email: usuarioData.email,
          personalId: personal.id, 
        },
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

    if (investigadorData) {
      await Investigador.create(
        { ...investigadorData, personalId: personal.id },
        { transaction: t }
      );
    }

    if (enFormacionData) {
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

      if (personal.usuarioId) {
        const datosUsuario = usuarioData || {};
        if (nombre || apellido || email) {
          datosUsuario.nombre = nombre || datosUsuario.nombre;
          datosUsuario.apellido = apellido || datosUsuario.apellido;
          datosUsuario.email = email || datosUsuario.email;
        }
        
        if (datosUsuario.nombre || datosUsuario.apellido || datosUsuario.email) {
          await Usuario.update(
            {
              nombre: datosUsuario.nombre,
              apellido: datosUsuario.apellido,
              email: datosUsuario.email,
              personalId: personal.id, 
            },
            { where: { id: personal.usuarioId }, transaction: t }
          );
        }
      }

      if (perfilUsuarioData && personal.usuarioId) {
        await PerfilUsuarioService.actualizarOCrearPorUsuarioId(
          personal.usuarioId,
          perfilUsuarioData,
          t
        );
      }

      await PersonalRepository.update(id, personalData, t);

      if (investigadorData) {
        if (personal.Investigador) {
          await personal.Investigador.update(investigadorData, { transaction: t });
        } else {
          await Investigador.create({ personalId: personal.id, ...investigadorData }, { transaction: t });
        }
      }

      if (enFormacionData) {
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
