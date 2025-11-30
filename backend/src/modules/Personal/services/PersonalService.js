import { PersonalRepository } from "../repositories/PersonalRepository.js";
import { Usuario } from "../../Usuarios/models/Usuario.js";
import sequelize from "../../../config/database.js";
import db from "../../../models/db.js";

const {
  GrupoInvestigacion,
  Investigador,
  EnFormacion,
  FuenteFinanciamiento,
  ProgramaIncentivo,
} = db.models;

const includeAllRelations = [
  { model: Usuario, as: "Usuario", attributes: ["id", "nombre", "apellido", "email"] },
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

async crear(data, transaction = null) {
  const t = transaction || await sequelize.transaction();

  try {
    // Separar relaciones opcionales
    const { Usuario: usuarioData, Investigador: investigadorData, EnFormacion: enFormacionData, ...personalData } = data;

    // 1️⃣ Crear registro base de Personal
    const personal = await PersonalRepository.create(personalData, t);

    // 2️⃣ Actualizar usuario si viene
    if (usuarioData && personal.usuarioId) {
      await Usuario.update(
        {
          nombre: usuarioData.nombre,
          apellido: usuarioData.apellido,
          email: usuarioData.email,
        },
        { where: { id: personal.usuarioId }, transaction: t }
      );
    }

    // 3️⃣ Crear Investigador si hay datos
    if (investigadorData) {
      await Investigador.create(
        { ...investigadorData, personalId: personal.id },
        { transaction: t }
      );
    }

    // 4️⃣ Crear EnFormacion si hay datos
    if (enFormacionData) {
      const { fuentesDeFinanciamiento, ...enFormacionBase } = enFormacionData;

      const enFormacion = await EnFormacion.create(
        { ...enFormacionBase, personalId: personal.id },
        { transaction: t }
      );

      // 4️⃣a Crear fuentes de financiamiento si vienen
      if (fuentesDeFinanciamiento?.length) {
        await FuenteFinanciamiento.bulkCreate(
          fuentesDeFinanciamiento.map(f => ({ ...f, enFormacionId: enFormacion.id })),
          { transaction: t }
        );
      }
    }

    // 5️⃣ Confirmar la transacción si no se pasó externamente
    if (!transaction) await t.commit();

    // 6️⃣ Recuperar la instancia completa con todas las relaciones
    const personalCompleto = await PersonalRepository.findById(personal.id);

    return personalCompleto;

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

      const { Usuario: usuarioData, Investigador: investigadorData, EnFormacion: enFormacionData, ...personalData } = data;

      // Actualizamos usuario
      if (usuarioData && personal.usuarioId) {
        await Usuario.update(
          {
            nombre: usuarioData.nombre,
            apellido: usuarioData.apellido,
            email: usuarioData.email,
          },
          { where: { id: personal.usuarioId }, transaction: t }
        );
      }

      // Actualizamos personal
      await PersonalRepository.update(id, personalData);

      // Actualizamos Investigador
      if (investigadorData) {
        if (personal.Investigador) {
          await personal.Investigador.update(investigadorData, { transaction: t });
        } else {
          // Si no existía, creamos la relación
          await Investigador.create({ personalId: personal.id, ...investigadorData }, { transaction: t });
        }
      }

      // Actualizamos EnFormacion
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

      await t.commit();

      // Recargamos siempre todas las relaciones antes de devolver
      personal = await PersonalRepository.findById(id);
      return await personal.reload({ include: includeAllRelations });

    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async eliminar(id) {
    return await PersonalRepository.delete(id);
  },
};
