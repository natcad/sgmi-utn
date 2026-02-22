// backend/src/modules/memorias/services/MemoriaPersonalService.js
import { Op } from "sequelize";
import db from "../../../models/db.js";

const {
  Personal,
  Investigador,
  EnFormacion,
  MemoriaPersonal,
  Memoria,
} = db.models;

export const MemoriaPersonalService = {

 async crearSnapshotDesdeGrupo(
  { grupoId, idMemoria, incluirDatosPrevios = false, anioActual },
  transaction
) {
  if (!anioActual) throw new Error("anioActual es obligatorio para snapshot de personal");

  const desde = new Date(`${anioActual}-01-01T00:00:00.000Z`);
  const hasta = new Date(`${anioActual + 1}-01-01T00:00:00.000Z`);

  const where = { grupoId };

  // REGLA:
  // true  => hasta fin del año (incluye previos)
  // false => solo del año
  if (incluirDatosPrevios) {
    where.createdAt = { [Op.lt]: hasta };
  } else {
    where.createdAt = { [Op.gte]: desde, [Op.lt]: hasta };
  }

  console.log("[MemoriaPersonalService] Snapshot personal", {
    grupoId,
    idMemoria,
    incluirDatosPrevios,
    anioActual,
    where,
  });

  const personal = await Personal.findAll({
    where,
    include: [
      { model: Investigador, as: "Investigador", required: false },
      { model: EnFormacion, as: "EnFormacion", required: false },
    ],
    transaction,
  });

  const registros = personal.map((p) => ({
    idMemoria,
    idPersonal: p.id,
    ObjectType: p.ObjectType,
    horasSemanales: p.horasSemanales,
    rol: p.rol,
    nivelDeFormacion: p.nivelDeFormacion,
    categoriaUTN: p.Investigador?.categoriaUTN ?? null,
    dedicacion: p.Investigador?.dedicacion ?? null,
    idIncentivo: p.Investigador?.idIncentivo ?? null,
    tipoFormacion: p.EnFormacion?.tipoFormacion ?? null,
    observaciones: null,
  }));

  if (registros.length) {
    await MemoriaPersonal.bulkCreate(registros, { transaction });
  }
},


 async eliminarPorMemoria(idMemoria, transaction) {
    await MemoriaPersonal.destroy({
      where: { idMemoria },
      transaction,
    });
  },
};