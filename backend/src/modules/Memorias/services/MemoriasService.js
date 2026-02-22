// backend/src/modules/memorias/services/MemoriaService.js
import { MemoriaRepository } from "../repositories/MemoriasRepository.js";
import { MemoriaPersonalService } from "./MemoriaPersonalService.js";
import { MemoriaEquipamientoService } from "./MemoriaEquipamientoService.js";
import db from "../../../models/db.js"; 
const { Personal } = db.models; 


const esAdmin = (rol) => rol && ["admin"].includes(String(rol).toLowerCase());
async function assertEsIntegranteDelGrupo({ userId, grupoId, transaction }) {
  const integrante = await Personal.findOne({
    where: { usuarioId: userId, grupoId },
    transaction,
  });

  if (!integrante) {
    const err = new Error("No tenés permisos: no sos integrante del grupo");
    err.statusCode = 403;
    throw err;
  }

  return integrante;
}

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
   * Si incluirDatosPrevios es true, copia los datos activos de memorias de años anteriores.
   */
  async crearConSnapshot(
    { grupoId, anio, idCreador, titulo, resumen, incluirDatosPrevios = false },
    transaction,
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
      transaction,
    );

    // 2) Crear snapshot de PERSONAL del grupo para esta memoria
    await MemoriaPersonalService.crearSnapshotDesdeGrupo(
      {
        grupoId,
        idMemoria: memoria.id,
        incluirDatosPrevios,
        anioActual: anio,
      },
      transaction,
    );

    // 3) Crear snapshot de EQUIPAMIENTO del grupo para esta memoria
    await MemoriaEquipamientoService.crearSnapshotDesdeGrupo(
      {
        grupoId,
        idMemoria: memoria.id,
        incluirDatosPrevios,
        anioActual: anio,
      },
      transaction,
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

  async aprobar(id, { rol }, transaction) {           
    if (!esAdmin(rol)) {                               // ✅ antes tenías if (!esAdmin)
      const err = new Error("Solo los administradores pueden aprobar memorias");
      err.statusCode = 403;
      throw err;
    }
    return await MemoriaRepository.updateEstado(id, "Aprobada", transaction);
  },

  async rechazar(id, { rol }, transaction) {           
    if (!esAdmin(rol)) {
      const err = new Error("Solo los administradores pueden aprobar memorias");
      err.statusCode = 403;
      throw err;
    }
    return await MemoriaRepository.updateEstado(id, "Rechazada", transaction);
  },

  /**
   * Enviar / Reenviar memoria.
   * - Admin NO puede enviar.
   * - Solo integrantes del grupo pueden enviar.
   * - Solo estados permitidos: Borrador o Rechazada.
   * - Cambia estado a Enviada.
   */
  async enviar(id, { userId, rol }, transaction) {
    if (esAdmin(rol)) {
      const err = new Error("Los administradores no pueden enviar memorias");
      err.statusCode = 403;
      throw err;
    }

    const memoria = await MemoriaRepository.findById(id, {
      incluirDetalle: false,
      transaction,
    });

    if (!memoria) {
      const err = new Error("Memoria no encontrada");
      err.statusCode = 404;
      throw err;
    }

    // Permisos: debe ser integrante del grupo de la memoria
    await assertEsIntegranteDelGrupo({
      userId,
      grupoId: memoria.grupoId,
      transaction,
    });

    // Transición de estado
    if (memoria.estado !== "Borrador" && memoria.estado !== "Rechazada") {
      const err = new Error(
        `No se puede enviar una memoria en estado ${memoria.estado}`,
      );
      err.statusCode = 409;
      throw err;
    }

    return await MemoriaRepository.updateEstado(id, "Enviada", transaction);
  },
};
