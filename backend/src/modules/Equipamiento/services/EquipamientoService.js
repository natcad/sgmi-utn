import { EquipamientoRepository } from "../repositories/EquipamientoRepository.js";
import { Op } from "sequelize";
import db from "../../../models/db.js";
const { GrupoInvestigacion, Equipamiento } = db.models;

function buildValidationError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

async function validateCreatePayload(data) {
  const denominacion = normalizeString(data.denominacion);
  const descripcion = normalizeString(data.descripcion);
  const montoInvertido = Number(data.montoInvertido);
  const cantidad = Number(data.cantidad);
  const fechaIncorporacion = normalizeString(data.fechaIncorporacion);
  const grupoId = Number(data.grupoId);

  if (!Number.isInteger(grupoId) || grupoId <= 0) {
    throw buildValidationError("Debe indicar un grupo válido para asociar el equipamiento.");
  }

  if (!denominacion || denominacion.length < 3 || denominacion.length > 100) {
    throw buildValidationError("La denominación debe tener entre 3 y 100 caracteres.");
  }

  if (!descripcion || descripcion.length < 10 || descripcion.length > 300) {
    throw buildValidationError("La descripción debe tener entre 10 y 300 caracteres.");
  }

  if (!Number.isFinite(montoInvertido) || montoInvertido < 0) {
    throw buildValidationError("El monto invertido debe ser un número válido mayor o igual a 0.");
  }

  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    throw buildValidationError("La cantidad debe ser un número entero mayor a 0.");
  }

  if (!isValidDateOnly(fechaIncorporacion)) {
    throw buildValidationError("La fecha de incorporación no es válida.");
  }

  const today = new Date().toISOString().split("T")[0];
  if (fechaIncorporacion > today) {
    throw buildValidationError("La fecha de incorporación no puede ser futura.");
  }

  return {
    ...data,
    denominacion,
    descripcion,
    montoInvertido,
    cantidad,
    fechaIncorporacion,
    grupoId,
  };
}

export const EquipamientoService = {
  async listar(filters = {}) {
    return await EquipamientoRepository.findAll(filters);
  },
  async obtenerPorId(id) {
    const equipamiento = await EquipamientoRepository.findById(id);
    if (!equipamiento) throw new Error("Equipamiento no encontrado");
    return equipamiento;
  },
  async crear(data) {
    const payload = await validateCreatePayload(data);

    const grupo = await GrupoInvestigacion.findByPk(payload.grupoId);
    if (!grupo) throw new Error("Grupo de investigación no encontrado");

    const equipamientoDuplicado = await Equipamiento.findOne({
      where: {
        grupoId: payload.grupoId,
        [Op.and]: [
          db.sequelize.where(
            db.sequelize.fn("LOWER", db.sequelize.col("denominacion")),
            payload.denominacion.toLowerCase()
          ),
        ],
      },
    });

    if (equipamientoDuplicado) {
      throw buildValidationError(
        "Ya existe un equipamiento con esa denominación en el grupo seleccionado.",
        409
      );
    }

    return await EquipamientoRepository.create(payload);
  },
  async actualizar(id, data) {
      const equipamiento = await EquipamientoRepository.findById(id);
  if (!equipamiento) throw new Error("Equipamiento no encontrado");

  if (data.grupoId) {
    const grupo = await GrupoInvestigacion.findByPk(data.grupoId);
    if (!grupo) throw new Error("Grupo de investigación no encontrado");
  }

  return await EquipamientoRepository.update(id, data);
}
,
  async eliminar(id) {
    const equipamiento = await EquipamientoRepository.findById(id);
    if (!equipamiento) throw new Error("Equipamiento no encontrado");
    await EquipamientoRepository.delete(id);
    return { message: "Equipamiento eliminado correctamente" };
  },

  async resumen(search = "") {
    return await EquipamientoRepository.resumenPorGrupo(search);
  },
};
