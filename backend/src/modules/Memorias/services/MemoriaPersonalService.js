// backend/src/modules/memorias/services/MemoriaPersonalService.js
import db from "../../../models/db.js";

const {
  Personal,
  Investigador,
  EnFormacion,
  MemoriaPersonal,
} = db.models;

export const MemoriaPersonalService = {

  async crearSnapshotDesdeGrupo({ grupoId, idMemoria }, transaction) {
    // 1) Traer todo el personal del grupo con sus subtipos
    const personalDelGrupo = await Personal.findAll({
      where: { grupoId: grupoId },
      include: [
        { model: Investigador, as: "Investigador", required: false },
        { model: EnFormacion, as: "EnFormacion", required: false },
      ],
      transaction,
    });

    if (!personalDelGrupo.length) return;

    // 2) Mapear a registros de MemoriaPersonal (snapshot)
    const registros = personalDelGrupo.map((p) => ({
      idMemoria,
      idPersonal: p.id,

      // Snapshot de Personal
      ObjectType: p.ObjectType,
      horasSemanales: p.horasSemanales,
      rol: p.rol,
      nivelDeFormacion: p.nivelDeFormacion,

      // Snapshot de Investigador (si aplica)
      categoriaUTN: p.Investigador?.categoriaUTN ?? null,
      dedicacion: p.Investigador?.dedicacion ?? null,
      idIncentivo: p.Investigador?.idIncentivo ?? null,

      // Snapshot de EnFormacion (si aplica)
      tipoFormacion: p.EnFormacion?.tipoFormacion ?? null,

      observaciones: null,
    }));

    // 3) Crear en bloque
    await MemoriaPersonal.bulkCreate(registros, { transaction });
  },

 async eliminarPorMemoria(idMemoria, transaction) {
    await MemoriaPersonal.destroy({
      where: { idMemoria },
      transaction,
    });
  },
};