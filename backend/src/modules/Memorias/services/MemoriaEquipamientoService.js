// backend/src/modules/memorias/services/MemoriaEquipamientoService.js
import { Op } from "sequelize";
import db from "../../../models/db.js";

const { Equipamiento, MemoriaEquipamiento, Memoria } = db.models;

/**
 * Service encargado de generar y gestionar el snapshot de EQUIPAMIENTO
 * asociado a una Memoria (tabla MemoriaEquipamiento).
 */
export const MemoriaEquipamientoService = {
  /**
   * Crea el snapshot de EQUIPAMIENTO para una memoria dada,
   * tomando todo el equipamiento del grupo.
   * Si incluirDatosPrevios es true, también incluye equipamiento de años anteriores.
   *
   * @param {Object} params
   * @param {number} params.grupoId - ID del GrupoInvestigacion
   * @param {number} params.idMemoria - ID de la Memoria recién creada
   * @param {boolean} params.incluirDatosPrevios - si traer datos de años anteriores
   * @param {number} params.anioActual - año de la memoria actual
   * @param {object} transaction - transacción de Sequelize
   */
 async crearSnapshotDesdeGrupo(
  { grupoId, idMemoria, incluirDatosPrevios = false, anioActual },
  transaction,
) {
  if (!anioActual) {
    throw new Error("anioActual es obligatorio para crear snapshot de equipamiento");
  }

  const desde = new Date(`${anioActual}-01-01T00:00:00.000Z`);
  const hasta = new Date(`${anioActual + 1}-01-01T00:00:00.000Z`);

  const where = { grupoId };

  // REGLA:
  // true  => hasta fin del año (incluye previos)
  // false => solo del año
  if (incluirDatosPrevios) {
    // recomendación: por fechaIncorporacion (más correcto)
    where.fechaIncorporacion = { [Op.lt]: hasta };

    // si querés usar createdAt en lugar de fechaIncorporacion, cambiá la línea de arriba por:
    // where.createdAt = { [Op.lt]: hasta };
  } else {
    // recomendación: por fechaIncorporacion (más correcto)
    where.fechaIncorporacion = { [Op.gte]: desde, [Op.lt]: hasta };

    // si querés usar createdAt en lugar de fechaIncorporacion, cambiá la línea de arriba por:
    // where.createdAt = { [Op.gte]: desde, [Op.lt]: hasta };
  }

  console.log("[MemoriaEquipamientoService] Snapshot equipamiento", {
    grupoId,
    idMemoria,
    incluirDatosPrevios,
    anioActual,
    where,
  });

  const equipos = await Equipamiento.findAll({ where, transaction });

  console.log(`[MemoriaEquipamientoService] Registros a snapshot: ${equipos.length}`);

  const registros = equipos.map((e) => ({
    idMemoria,
    idEquipamiento: e.id,
    denominacion: e.denominacion,
    descripcion: e.descripcion,
    montoInvertido: e.montoInvertido,
    fechaIncorporacion: e.fechaIncorporacion,
    cantidad: e.cantidad ?? 1,
  }));

  if (registros.length) {
    await MemoriaEquipamiento.bulkCreate(registros, { transaction });
  }
},


  /**
   * Elimina todos los registros de MemoriaEquipamiento asociados a una memoria.
   * Útil si quisieras regenerar el snapshot.
   */
  async eliminarPorMemoria(idMemoria, transaction) {
    await MemoriaEquipamiento.destroy({
      where: { idMemoria },
      transaction,
    });
  },
};
