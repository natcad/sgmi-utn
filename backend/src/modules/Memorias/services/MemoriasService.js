// backend/src/modules/memorias/services/MemoriaService.js
import { MemoriaRepository } from "../repositories/MemoriasRepository.js";
import { MemoriaPersonalService } from "./MemoriaPersonalService.js";
import { MemoriaEquipamientoService } from "./MemoriaEquipamientoService.js";

export const MemoriaService = {
  /**
   * Lista memorias filtrando por grupo / año / estado.
   * Envuelve al MemoriaRepository para mantener la lógica en un solo lugar.
   */
  async listar({ grupoId, anio, estado, incluirDetalle = false } = {}) {
    return await MemoriaRepository.findAllByGrupo({
      grupoId,
      anio,
      estado,
      incluirDetalle,
    });
  },

  /**
   * Obtiene una memoria por ID, con opción de incluir el detalle.
   */
  async obtenerPorId(id, { incluirDetalle = false } = {}) {
    return await MemoriaRepository.findById(id, { incluirDetalle });
  },

  /**
   * Crea una memoria y, opcionalmente, los snapshots de personal y equipamiento.
   * Se espera que la transacción venga creada desde el controller.
   */
  async crearConSnapshot(
    { grupoId, anio, idCreador, titulo, resumen },
    transaction
  ) {
    // 1) Crear la memoria (cabecera)
    const memoria = await MemoriaRepository.create(
      {
        grupoId,
        anio,
        idCreador,
        titulo,
        resumen,
        // estado, fechaApertura, version se resuelven con defaults / hooks del modelo
      },
      transaction
    );

    // 2) Crear snapshot de PERSONAL del grupo para esta memoria
    await MemoriaPersonalService.crearSnapshotDesdeGrupo(
      {
        grupoId,
        idMemoria: memoria.id,
      },
      transaction
    );

    // 3) Crear snapshot de EQUIPAMIENTO del grupo para esta memoria
    await MemoriaEquipamientoService.crearSnapshotDesdeGrupo(
      {
        grupoId,
        idMemoria: memoria.id,
      },
      transaction
    );

    return memoria;
  },

  /**
   * Actualiza campos de la memoria (estado, título, resumen, fechaCierre, etc.)
   */
  async actualizar(id, datos, transaction) {
    return await MemoriaRepository.update(id, datos, transaction);
  },

  /**
   * Elimina una memoria. Si la FK está en CASCADE, se borran también sus detalles.
   */
  async eliminar(id, transaction) {
    return await MemoriaRepository.delete(id, transaction);
  },
};
