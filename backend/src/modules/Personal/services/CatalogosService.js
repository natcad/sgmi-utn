import sequelize from "../../../config/database.js";

/**
 * Parsea el tipo ENUM de MySQL (ej: "enum('A','B','C')") y devuelve array de valores.
 */
function parseEnumValues(columnType) {
  if (!columnType || typeof columnType !== "string") return [];
  const match = columnType.match(/^enum\((.*)\)$/i);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((s) => s.trim().replace(/^'|'$/g, ""))
    .filter(Boolean);
}

/**
 * Obtiene los valores de un campo ENUM desde INFORMATION_SCHEMA.
 */
async function getEnumValues(tableName, columnName) {
  const [rows] = await sequelize.query(
    `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = :tableName 
       AND COLUMN_NAME = :columnName`,
    {
      replacements: { tableName, columnName },
    }
  );
  const row = Array.isArray(rows) ? rows[0] : rows;
  const columnType = row?.COLUMN_TYPE ?? row?.column_type;
  return parseEnumValues(columnType);
}

/**
 * Obtiene valores distintos de un campo (para campos no ENUM, ej. ProgramaIncentivo.estado).
 */
async function getDistinctValues(tableName, columnName) {
  const [rows] = await sequelize.query(
    `SELECT DISTINCT \`${columnName}\` AS val FROM \`${tableName}\` WHERE \`${columnName}\` IS NOT NULL AND \`${columnName}\` != '' ORDER BY val`,
    { type: sequelize.QueryTypes.SELECT }
  );
  const list = Array.isArray(rows) ? rows : [];
  return list.map((r) => r.val).filter(Boolean);
}

export const CatalogosService = {
  async getCatalogos() {
    const [
      roles,
      nivelDeFormacion,
      categoriaUTN,
      dedicacion,
      tipoFormacion,
    ] = await Promise.all([
      getEnumValues("Personal", "rol"),
      getEnumValues("Personal", "nivelDeFormacion"),
      getEnumValues("Investigador", "categoriaUTN"),
      getEnumValues("Investigador", "dedicacion"),
      getEnumValues("EnFormacion", "tipoFormacion"),
    ]);

    let estadosIncentivo = await getDistinctValues("ProgramaIncentivo", "estado");
    if (estadosIncentivo.length === 0) {
      estadosIncentivo = ["Activo", "Inactivo"];
    }

    return {
      roles,
      tiposFormacion: tipoFormacion.length ? tipoFormacion : nivelDeFormacion,
      categoriasUTN: categoriaUTN,
      dedicaciones: dedicacion,
      estadosIncentivo,
    };
  },
};
