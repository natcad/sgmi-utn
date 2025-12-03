// backend/src/modules/memorias/services/MemoriaEquipamientoService.js
import db from "../../../models/db.js";

const {
  Equipamiento,
  MemoriaEquipamiento,
} = db.models;

/**
 * Service encargado de generar y gestionar el snapshot de EQUIPAMIENTO
 * asociado a una Memoria (tabla MemoriaEquipamiento).
 */
export const MemoriaEquipamientoService = {
  /**
   * Crea el snapshot de EQUIPAMIENTO para una memoria dada,
   * tomando todo el equipamiento del grupo.
   *
   * @param {Object} params
   * @param {number} params.grupoId - ID del GrupoInvestigacion
   * @param {number} params.idMemoria - ID de la Memoria recién creada
   * @param {object} transaction - transacción de Sequelize
   */
  async crearSnapshotDesdeGrupo({ grupoId, idMemoria }, transaction) {
    // 1) Traer todo el equipamiento del grupo
    const equipos = await Equipamiento.findAll({
      where: { grupoId: grupoId }, // ajustá si tu FK se llama distinto
      transaction,
    });

    if (!equipos.length) return;

    // 2) Mapear a registros de MemoriaEquipamiento (snapshot)
    const registros = equipos.map((e) => ({
      idMemoria,
      idEquipamiento: e.id,

      // Estos campos deben existir en tu modelo Equipamiento.
      // Si tenés otros nombres (ej: "costo" en vez de "montoInvertido"),
      // mapealos acá a mano.
      denominacion: e.denominacion,
      descripcion: e.descripcion,
      montoInvertido: e.montoInvertido,          // o e.costo, si así se llama
      fechaIncorporacion: e.fechaIncorporacion,
      cantidad: e.cantidad ?? 1,
    }));

    // 3) Crear en bloque
    await MemoriaEquipamiento.bulkCreate(registros, { transaction });
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
