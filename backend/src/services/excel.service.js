import ExcelJS from "exceljs";

/**
 * ExcelService
 * - generarMemoriaXlsx(memoriaDetalle)
 * - generarGrupoMemoriasXlsx({ grupo, memorias, filtros })
 * - generarAdminResumenXlsx({ gruposResumen, memoriasDetalle, filtros })
 * - generarEstadoActualGrupoXlsx({ grupo, personalActual, equipamientoActual })
 *
 * Notas:
 * - Presupuesto gastado se calcula sumando:
 *   monto = me.montoInvertido ?? me.equipamiento?.montoInvertido ?? 0
 *   (soporta si el monto está en MemoriaEquipamiento o en Equipamiento)
 * - "Personal" en memoria usa estructura típica:
 *   memoria.personal[] -> mp.personal -> mp.personal.Usuario + mp.personal.Investigador/EnFormacion
 * - "Equipamiento" en memoria usa:
 *   memoria.equipamiento[] -> me.equipamiento
 */

//--helpers para formatear
// funciones para formatear valores en Excel (evitar null/undefined, formatear dinero, etc.)
const safe = (v) => (v === null || v === undefined ? "" : String(v));
const n = (v) => {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
};
const moneyFmt = (num) => {
  // Excel: usar número real; formato se aplica con numFmt
  return n(num);
};
// para generar nombres de archivo seguros
const normalizeFilename = (s) =>
  safe(s)
    .trim()
    .replaceAll(" ", "_")
    .replace(/[^\w\-\.]/g, "_");
// para generar clases CSS seguras (ej: estado de memoria)
const estadoClass = (estado) => safe(estado).toLowerCase().replace(/\s+/g, "-");
const COLORS = {
  headerBg: "FF0B3A5A",
  headerFg: "FFFFFFFF",
  border: "FFD1D5DB",
  zebra: "FFF8FAFC",
  mutedText: "FF6B7280",
};
//funciones de estilo
function styleHeaderRow(ws, rowNum = 1) {
  const row = ws.getRow(rowNum);
  row.font = { bold: true, color: { argb: COLORS.headerFg }, size: 11 };
  row.alignment = { vertical: "middle", horizontal: "center" };
  row.height = 20;

  row.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.headerBg },
    };
    cell.border = {
      top: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } },
    };
  });
}
function applyTableBorders(ws, fromRow, toRow, fromCol, toCol) {
  for (let i = fromRow; i <= toRow; i++) {
    for (let j = fromCol; j <= toCol; j++) {
      const cell = ws.getCell(i, j);
      cell.border = {
        top: { style: "thin", color: { argb: COLORS.border } },
        left: { style: "thin", color: { argb: COLORS.border } },
        bottom: { style: "thin", color: { argb: COLORS.border } },
        right: { style: "thin", color: { argb: COLORS.border } },
      };
    }
  }
}
function applyZebraRows(ws, fromRow, toRow, fromCol, toCol) {
  for (let i = fromRow; i <= toRow; i++) {
    if (i % 2 === 0) {
      for (let j = fromCol; j <= toCol; j++) {
        const cell = ws.getCell(i, j);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLORS.zebra },
        };
      }
    }
  }
}
function setAutoFilter(ws, fromColLetter, toColLetter, headerRow) {
  ws.autoFilter = {
    from: `${fromColLetter}${headerRow}`,
    to: `${toColLetter}${headerRow}`,
  };
}

function addSectionTitle(ws, title, { row, col = 1 }) {
  const cell = ws.getCell(row, col);
  cell.value = title;
  cell.font = { bold: true, size: 13 };
  return row + 1;
}

function calcInversionMemoria(memoria) {
  return (memoria.equipamiento ?? []).reduce((acc, me) => {
    const monto = n(me?.montoInvertido ?? me.equipamiento?.montoInvertido ?? 0);
    return acc + monto;
  }, 0);
}

function calcInversionActual(equipamientos) {
  return (equipamientos ?? []).reduce(
    (acc, e) => acc + n(e?.montoInvertido ?? 0),
    0,
  );
}

function calcInversionEquipamientosActual(equipamientos) {
  return calcInversionActual(equipamientos);
}

function calcAvg(num, den) {
  const a = n(num);
  const b = n(den);
  if (!b) return 0;
  return a / b;
}

function buildPortada(wb, { titulo, grupoNombre, filtros, resumenData = [] }) {
  const ws = wb.addWorksheet("Portada", { views: [{ showGridLines: false }] });

  ws.getColumn(1).width = 30;
  ws.getColumn(2).width = 50;

  // Merge cells para el título
  ws.mergeCells("A1:B1");
  const titleCell = ws.getCell("A1");
  titleCell.value = titulo;
  titleCell.font = { size: 24, bold: true, color: { argb: COLORS.headerBg } };
  titleCell.alignment = { vertical: "center", horizontal: "left" };
  ws.getRow(1).height = 35;

  let r = 3;

  // Datos principales (Grupo, Período, Estados, Generado)
  const datos = [];
  if (grupoNombre) datos.push(["Grupo", grupoNombre]);
  if (filtros?.periodo) datos.push(["Período", filtros.periodo]);
  if (filtros?.estados) datos.push(["Estados", filtros.estados]);
  datos.push(["Generado", new Date().toLocaleString("es-AR")]);

  datos.forEach(([label, value]) => {
    const labelCell = ws.getCell(r, 1);
    const valueCell = ws.getCell(r, 2);

    labelCell.value = label;
    labelCell.font = { bold: true, size: 11, color: { argb: COLORS.headerFg } };
    labelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.headerBg },
    };
    labelCell.alignment = { vertical: "center", horizontal: "left" };

    valueCell.value = value;
    valueCell.font = { size: 11, color: { argb: COLORS.headerBg } };
    valueCell.alignment = { vertical: "center", horizontal: "left", wrapText: true };
    valueCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFAFBFC" },
    };

    ws.getRow(r).height = 22;
    r++;
  });

  r += 2;

  // Resumen como mini tabla
  if (resumenData.length) {
    const headerStart = r;
    
    // Header de tabla
    const headerLabelCell = ws.getCell(r, 1);
    const headerValueCell = ws.getCell(r, 2);
    
    headerLabelCell.value = "Concepto";
    headerValueCell.value = "Valor";
    
    [headerLabelCell, headerValueCell].forEach((cell) => {
      cell.font = { bold: true, size: 11, color: { argb: COLORS.headerFg } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.headerBg },
      };
      cell.alignment = { vertical: "center", horizontal: "left" };
      cell.border = {
        top: { style: "thin", color: { argb: COLORS.border } },
        bottom: { style: "thin", color: { argb: COLORS.border } },
        left: { style: "thin", color: { argb: COLORS.border } },
        right: { style: "thin", color: { argb: COLORS.border } },
      };
    });
    ws.getRow(r).height = 20;
    r++;
    
    // Datos de resumen
    resumenData.forEach((item, idx) => {
      const labelCell = ws.getCell(r, 1);
      const valueCell = ws.getCell(r, 2);

      labelCell.value = item.label;
      valueCell.value = item.value;
      
      const bgColor = idx % 2 === 0 ? "FFFAFBFC" : "FFFFFF";
      
      [labelCell, valueCell].forEach((cell) => {
        cell.font = { size: 10, color: { argb: "FF374151" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: bgColor },
        };
        cell.alignment = { vertical: "center", horizontal: "left", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: COLORS.border } },
          bottom: { style: "thin", color: { argb: COLORS.border } },
          left: { style: "thin", color: { argb: COLORS.border } },
          right: { style: "thin", color: { argb: COLORS.border } },
        };
      });
      ws.getRow(r).height = 18;
      r++;
    });
  }

  return ws;
}

function addMemoriaSheet(wb, memoria) {
  const sheetNameBase = `Memoria_${memoria.anio}_v${memoria.version}`;
  const sheetName = sheetNameBase.slice(0, 31); // Excel limit
  const ws = wb.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 8 }],
  });

  // Layout: meta arriba, luego tabla personal y equipamiento
  const grupoNombre = memoria.grupo?.nombre ?? `Grupo #${memoria.grupoId}`;
  const inversion = calcInversionMemoria(memoria);

  ws.getColumn(1).width = 24;
  ws.getColumn(2).width = 52;
  ws.getColumn(3).width = 24;
  ws.getColumn(4).width = 32;
  ws.getColumn(5).width = 18;

  // Título
  ws.getCell("A1").value = memoria.titulo || `Memoria ${memoria.anio}`;
  ws.getCell("A1").font = { size: 16, bold: true };

  // Metas
  const meta = [
    ["Grupo", grupoNombre],
    ["Año", safe(memoria.anio)],
    ["Versión", safe(memoria.version)],
    ["Estado", safe(memoria.estado)],
    ["Inversión total (memoria)", moneyFmt(inversion)],
    ["Integrantes (memoria)", safe(memoria.personal?.length ?? 0)],
    ["Equipamientos (memoria)", safe(memoria.equipamiento?.length ?? 0)],
  ];

  let r = 3;
  meta.forEach(([k, v]) => {
    ws.getCell(r, 1).value = k;
    ws.getCell(r, 1).font = { bold: true };
    ws.getCell(r, 2).value = v;

    if (k.includes("Inversión")) {
      ws.getCell(r, 2).numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';
    }
    r++;
  });

  // Resumen
  if (memoria.resumen) {
    ws.getCell(r, 1).value = "Resumen";
    ws.getCell(r, 1).font = { bold: true };
    ws.getCell(r, 2).value = memoria.resumen;
    ws.getCell(r, 2).alignment = { wrapText: true };
    ws.getRow(r).height = 60;
    r += 2;
  } else {
    r += 1;
  }

  const personalHeaderRow = r;
  const personalCols = [
    { header: "Nombre", key: "nombre", width: 24 },
    { header: "Apellido", key: "apellido", width: 24 },
    { header: "Email", key: "email", width: 34 },
    { header: "Tipo", key: "tipo", width: 16 },
    { header: "Rol", key: "rol", width: 16 },
    { header: "Horas Semanales", key: "horasSemanales", width: 10 },
    { header: "Nivel de Formación", key: "nivelDeFormacion", width: 18 },
    { header: "Categoría UTN", key: "categoriaUTN", width: 10 },
    { header: "Dedicación", key: "dedicacion", width: 16 },
  ];
  personalCols.forEach((c, idx) => {
    ws.getCell(personalHeaderRow, idx + 1).value = c.header;
    ws.getColumn(idx + 1).width = Math.max(
      ws.getColumn(idx + 1).width || 10,
      c.width,
    );
  });
  styleHeaderRow(ws, personalHeaderRow);

  let rowCursor = personalHeaderRow + 1;
  (memoria.personal ?? []).forEach((mp) => {
    const p = mp?.personal;
    const u = p?.Usuario;

    const tipo = p?.Investigador
      ? "Investigador"
      : p?.EnFormacion
        ? "En formación"
        : "Personal";
    ws.getCell(rowCursor, 1).value = safe(u?.nombre);
    ws.getCell(rowCursor, 2).value = safe(u?.apellido);
    ws.getCell(rowCursor, 3).value = safe(u?.email);
    ws.getCell(rowCursor, 4).value = tipo;
    ws.getCell(rowCursor, 5).value = safe(p?.rol);
    ws.getCell(rowCursor, 6).value = safe(p?.horasSemanales);
    ws.getCell(rowCursor, 7).value = safe(p?.nivelDeFormacion);
    ws.getCell(rowCursor, 8).value = safe(p?.Investigador?.categoriaUTN);
    ws.getCell(rowCursor, 9).value = safe(p?.Investigador?.dedicacion);
    rowCursor++;
  });
  const personalLastRow = rowCursor - 1;
  if (personalLastRow >= personalHeaderRow + 1) {
    applyTableBorders(ws, personalHeaderRow, personalLastRow, 1, 9);
    applyZebraRows(ws, personalHeaderRow + 1, personalLastRow, 1, 9);
    setAutoFilter(ws, "A", "I", personalHeaderRow);
  } else {
    ws.getCell(rowCursor, 1).value = "Sin personal cargado.";
    ws.getCell(rowCursor, 1).font = {
      italic: true,
      color: { argb: "FF6B7280" },
    };
    rowCursor += 2;
  }

  // --- Equipamiento (tabla) ---
  rowCursor = addSectionTitle(ws, "Equipamiento (snapshot de memoria)", {
    row: rowCursor,
    col: 1,
  });
  const equipamientoHeaderRow = rowCursor;
  const equipamientoCols = [
    { header: "Denominación", key: "denominación", width: 32 },
    { header: "Descripción", key: "descripcion", width: 50 },
    { header: "Cantidad", key: "cantidad", width: 10 },
    { header: "Monto Invertido", key: "montoInvertido", width: 18 },
    { header: "Fecha de Incorporación", key: "fechaIncorporacion", width: 18 },
  ];
  equipamientoCols.forEach((c, idx) => {
    ws.getCell(equipamientoHeaderRow, idx + 1).value = c.header;
    ws.getColumn(idx + 1).width = Math.max(
      ws.getColumn(idx + 1).width || 10,
      c.width,
    );
  });
  styleHeaderRow(ws, equipamientoHeaderRow);

  rowCursor = equipamientoHeaderRow + 1;
  (memoria.equipamiento ?? []).forEach((me) => {
    const e = me?.equipamiento;
    const monto = n(me?.montoInvertido ?? e?.montoInvertido ?? 0);
    ws.getCell(rowCursor, 1).value = safe(e?.denominacion);
    ws.getCell(rowCursor, 2).value = safe(e?.descripcion);
    ws.getCell(rowCursor, 3).value = safe(me?.cantidad ?? e?.cantidad ?? 1);
    ws.getCell(rowCursor, 4).value = monto;
    ws.getCell(rowCursor, 4).numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';
    ws.getCell(rowCursor, 5).value = e?.fechaIncorporacion
      ? new Date(e.fechaIncorporacion)
      : "";
    rowCursor++;
  });
  const equipamientoLastRow = rowCursor - 1;
  if (equipamientoLastRow >= equipamientoHeaderRow + 1) {
    applyTableBorders(ws, equipamientoHeaderRow, equipamientoLastRow, 1, 5);
    applyZebraRows(ws, equipamientoHeaderRow + 1, equipamientoLastRow, 1, 5);
  } else {
    ws.getCell(rowCursor, 1).value = "Sin equipamiento cargado.";
    ws.getCell(rowCursor, 1).font = {
      italic: true,
      color: { argb: "FF6B7280" },
    };
  }
  ws.getCell("C4").value = "Estado (para filtros)";
  ws.getCell("D4").value = estadoClass(memoria.estado);

  return ws;
}

function addMemoriaPersonalSheet(wb, memoria) {
  const sheetName = `Personal_${memoria.id}`.slice(0, 31);
  const ws = wb.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: "Nombre", key: "nombre", width: 24 },
    { header: "Apellido", key: "apellido", width: 24 },
    { header: "Email", key: "email", width: 34 },
    { header: "Tipo", key: "tipo", width: 16 },
    { header: "Rol", key: "rol", width: 16 },
    { header: "Horas Semanales", key: "horasSemanales", width: 12 },
    { header: "Nivel de Formación", key: "nivelDeFormacion", width: 18 },
    { header: "Categoría UTN", key: "categoriaUTN", width: 14 },
    { header: "Dedicación", key: "dedicacion", width: 16 },
  ];

  styleHeaderRow(ws, 1);

  (memoria.personal ?? []).forEach((mp) => {
    const p = mp?.personal;
    const u = p?.Usuario;
    const tipo = p?.Investigador
      ? "Investigador"
      : p?.EnFormacion
        ? "En formación"
        : "Personal";
    ws.addRow({
      nombre: safe(u?.nombre),
      apellido: safe(u?.apellido),
      email: safe(u?.email),
      tipo,
      rol: safe(p?.rol),
      horasSemanales: safe(p?.horasSemanales),
      nivelDeFormacion: safe(p?.nivelDeFormacion),
      categoriaUTN: safe(p?.Investigador?.categoriaUTN),
      dedicacion: safe(p?.Investigador?.dedicacion),
    });
  });

  const lastRow = Math.max(1, (memoria.personal?.length ?? 0) + 1);
  setAutoFilter(ws, "A", "I", 1);
  applyTableBorders(ws, 1, lastRow, 1, 9);
  if (lastRow > 1) {
    applyZebraRows(ws, 2, lastRow, 1, 9);
  }

  return ws;
}

function addMemoriaEquipamientoSheet(wb, memoria) {
  const sheetName = `Equip_${memoria.id}`.slice(0, 31);
  const ws = wb.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: "Denominación", key: "denominacion", width: 32 },
    { header: "Descripción", key: "descripcion", width: 50 },
    { header: "Cantidad", key: "cantidad", width: 10 },
    { header: "Monto Invertido", key: "montoInvertido", width: 18 },
    { header: "Fecha de Incorporación", key: "fechaIncorporacion", width: 18 },
  ];

  styleHeaderRow(ws, 1);

  (memoria.equipamiento ?? []).forEach((me) => {
    const e = me?.equipamiento;
    const monto = n(me?.montoInvertido ?? e?.montoInvertido ?? 0);
    ws.addRow({
      denominacion: safe(e?.denominacion),
      descripcion: safe(e?.descripcion),
      cantidad: safe(me?.cantidad ?? e?.cantidad ?? 1),
      montoInvertido: moneyFmt(monto),
      fechaIncorporacion: e?.fechaIncorporacion
        ? new Date(e.fechaIncorporacion)
        : "",
    });
  });

  ws.getColumn("montoInvertido").numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';
  ws.getColumn("descripcion").alignment = { wrapText: true };

  const lastRow = Math.max(1, (memoria.equipamiento?.length ?? 0) + 1);
  setAutoFilter(ws, "A", "E", 1);
  applyTableBorders(ws, 1, lastRow, 1, 5);
  if (lastRow > 1) {
    applyZebraRows(ws, 2, lastRow, 1, 5);
  }

  return ws;
}

function addResumenMemoriasSheet(wb, { grupoNombre, memorias }) {
  const ws = wb.addWorksheet("Resumen_Memorias", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: "Grupo", key: "grupo", width: 28 },
    { header: "Año", key: "anio", width: 10 },
    { header: "Versión", key: "version", width: 10 },
    { header: "Estado", key: "estado", width: 14 },
    { header: "Personal", key: "personal", width: 12 },
    { header: "Equipamientos", key: "equipamientos", width: 14 },
    { header: "Inversión (memoria)", key: "inversion", width: 18 },
  ];

  styleHeaderRow(ws, 1);

  (memorias ?? []).forEach((m) => {
    ws.addRow({
      grupo: grupoNombre ?? m.grupo?.nombre ?? `Grupo #${m.grupoId}`,
      anio: m.anio,
      version: m.version,
      estado: m.estado,
      personal: m.personal?.length ?? 0,
      equipamientos: m.equipamiento?.length ?? 0,
      inversion: moneyFmt(calcInversionMemoria(m)),
    });
  });

  ws.getColumn("inversion").numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';

  setAutoFilter(ws, "A", "G", 1);
  const resumenLastRow = Math.max(1, (memorias?.length ?? 0) + 1);
  applyTableBorders(ws, 1, resumenLastRow, 1, 7);
  if (resumenLastRow > 1) {
    applyZebraRows(ws, 2, resumenLastRow, 1, 7);
  }

  return ws;
}

function addAdminResumenSheet(wb, { gruposResumen }) {
  const ws = wb.addWorksheet("Resumen_Grupos", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: "Grupo", key: "grupo", width: 32 },
    { header: "Memorias enviadas", key: "enviadas", width: 16 },
    { header: "Memorias aprobadas", key: "aprobadas", width: 16 },
    { header: "Memorias rechazadas", key: "rechazadas", width: 16 },
    { header: "Última memoria (año/v)", key: "ultima", width: 18 },
    { header: "Personal actual", key: "personalActual", width: 14 },
    { header: "Equipamiento actual", key: "equipActual", width: 16 },
    { header: "Presupuesto actual", key: "presActual", width: 18 },
    { header: "Presupuesto (memorias)", key: "presMem", width: 22 },
    { header: "Prom. inversión por eq", key: "promEq", width: 22 },
  ];

  styleHeaderRow(ws, 1);
  (gruposResumen ?? []).forEach((g) => {
    ws.addRow({
      grupo: g.grupoNombre,
      enviadas: g.memoriasEnviadas,
      aprobadas: g.memoriasAprobadas,
      rechazadas: g.memoriasRechazadas,
      ultima: g.ultimaMemoriaLabel,
      personalActual: g.personalActualCount,
      equipActual: g.equipActualCount,
      presActual: moneyFmt(g.presupuestoActual),
      presMem: moneyFmt(g.presupuestoEnMemorias),
      promEq: moneyFmt(calcAvg(g.presupuestoActual, g.equipActualCount)),
    });
  });
  ws.getColumn("presActual").numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';
  ws.getColumn("presMem").numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';
  ws.getColumn("promEq").numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';

  setAutoFilter(ws, "A", "J", 1);
  const adminResumenLastRow = Math.max(1, (gruposResumen?.length ?? 0) + 1);
  applyTableBorders(ws, 1, adminResumenLastRow, 1, 10);
  if (adminResumenLastRow > 1) {
    applyZebraRows(ws, 2, adminResumenLastRow, 1, 10);
  }

  return ws;
}
function addAdminDetalleMemoriasSheet(wb, { memoriasDetalle }) {
  const ws = wb.addWorksheet("Detalle_Memorias", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: "Grupo", key: "grupo", width: 30 },
    { header: "Año", key: "anio", width: 10 },
    { header: "Versión", key: "version", width: 10 },
    { header: "Estado", key: "estado", width: 14 },
    { header: "Personal (memoria)", key: "personal", width: 16 },
    { header: "Equipamientos (memoria)", key: "equip", width: 20 },
    { header: "Inversión (memoria)", key: "inv", width: 18 },
  ];

  styleHeaderRow(ws, 1);
  (memoriasDetalle ?? []).forEach((m) => {
    const grupoNombre = m.grupo?.nombre ?? `Grupo #${m.grupoId}`;
    ws.addRow({
      grupo: grupoNombre,
      anio: m.anio,
      version: m.version,
      estado: m.estado,
      personal: m.personal?.length ?? 0,
      equip: m.equipamiento?.length ?? 0,
      inv: moneyFmt(calcInversionMemoria(m)),
    });
  });

  ws.getColumn("inv").numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';

  setAutoFilter(ws, "A", "G", 1);
  const detalleLastRow = Math.max(1, (memoriasDetalle?.length ?? 0) + 1);
  applyTableBorders(ws, 1, detalleLastRow, 1, 7);
  if (detalleLastRow > 1) {
    applyZebraRows(ws, 2, detalleLastRow, 1, 7);
  }

  return ws;
}

function addEstadoActualPersonalSheet(wb, personalActual) {
  const ws = wb.addWorksheet("Personal_Actual", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: "Nombre", key: "nombre", width: 24 },
    { header: "Apellido", key: "apellido", width: 24 },
    { header: "Email", key: "email", width: 34 },
    { header: "Tipo", key: "tipo", width: 16 },
    { header: "Rol", key: "rol", width: 16 },
    { header: "Horas Semanales", key: "horasSemanales", width: 10 },
    { header: "Nivel de Formación", key: "nivelDeFormacion", width: 18 },
    { header: "Categoría UTN", key: "categoriaUTN", width: 10 },
    { header: "Dedicación", key: "dedicacion", width: 16 },
  ];
  styleHeaderRow(ws, 1);
  (personalActual ?? []).forEach((p) => {
    const u = p?.Usuario;
    const tipo = p?.Investigador
      ? "Investigador"
      : p?.EnFormacion
        ? "En formación"
        : "Personal";
    ws.addRow({
      nombre: u?.nombre,
      apellido: u?.apellido,
      email: u?.email,
      tipo,
      rol: p?.rol,
      horasSemanales: p?.horasSemanales,
      nivelDeFormacion: p?.nivelDeFormacion,
      categoriaUTN: p?.Investigador?.categoriaUTN,
      dedicacion: p?.Investigador?.dedicacion,
    });
  });

  setAutoFilter(ws, "A", "I", 1);
  const personalActualLastRow = Math.max(1, (personalActual?.length ?? 0) + 1);
  applyTableBorders(ws, 1, personalActualLastRow, 1, 9);
  if (personalActualLastRow > 1) {
    applyZebraRows(ws, 2, personalActualLastRow, 1, 9);
  }

  return ws;
}
function addEstadoActualEquipamientoSheet(wb, equipamientoActual) {
  const ws = wb.addWorksheet("Equipamiento_Actual", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  ws.columns = [
    { header: "Denominación", key: "denominacion", width: 32 },
    { header: "Descripción", key: "descripcion", width: 50 },
    { header: "Cantidad", key: "cantidad", width: 10 },
    { header: "Monto Invertido", key: "montoInvertido", width: 18 },
    { header: "Fecha de Incorporación", key: "fechaIncorporacion", width: 18 },
  ];
  styleHeaderRow(ws, 1);
  (equipamientoActual ?? []).forEach((e) => {
    ws.addRow({
      denominacion: safe(e?.denominacion),
      descripcion: safe(e?.descripcion),
      cantidad: safe(e?.cantidad),
      montoInvertido: moneyFmt(e?.montoInvertido),
      fechaIncorporacion: e?.fechaIncorporacion
        ? new Date(e.fechaIncorporacion)
        : "",
    });
  });
  ws.getColumn("montoInvertido").numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';
  ws.getColumn("descripcion").alignment = { wrapText: true };
  setAutoFilter(ws, "A", "E", 1);
  const equipActualLastRow = Math.max(1, (equipamientoActual?.length ?? 0) + 1);
  applyTableBorders(ws, 1, equipActualLastRow, 1, 5);
  if (equipActualLastRow > 1) {
    applyZebraRows(ws, 2, equipActualLastRow, 1, 5);
  }
  return ws;
}

function addEstadoActualResumenSheet(
  wb,
  { grupoNombre, personalActual, equipamientoActual },
) {
  const ws = wb.addWorksheet("Estado_Actual", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  ws.getColumn(1).width = 24;
  ws.getColumn(2).width = 60;
  const presupuesto = calcInversionActual(equipamientoActual);
  ws.getCell("A1").value = `Estado actual - ${grupoNombre}`;
  ws.getCell("A1").font = { size: 16, bold: true };

  ws.getCell("A3").value = "Generado";
  ws.getCell("A3").font = { bold: true };
  ws.getCell("B3").value = new Date().toLocaleString("es-AR");

  ws.getCell("A5").value = "Personal actual";
  ws.getCell("A5").font = { bold: true };
  ws.getCell("B5").value = personalActual?.length ?? 0;

  ws.getCell("A6").value = "Equipamiento actual";
  ws.getCell("A6").font = { bold: true };
  ws.getCell("B6").value = equipamientoActual?.length ?? 0;

  ws.getCell("A7").value = "Presupuesto actual (equipamiento)";
  ws.getCell("A7").font = { bold: true };
  ws.getCell("B7").value = moneyFmt(presupuesto);
  ws.getCell("B7").numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';
  return ws;
}

export const ExcelService = {
  /**
   * Export: una memoria puntual (integrante/admin).
   */
  async generarMemoriaXlsx(memoriaDetalle) {
    const wb = new ExcelJS.Workbook();
    wb.creator = "SGMI";
    wb.created = new Date();

    const grupoNombre =
      memoriaDetalle.grupo?.nombre ?? `Grupo #${memoriaDetalle.grupoId}`;
    const titulo = memoriaDetalle.titulo ?? `Memoria ${memoriaDetalle.anio}`;

    buildPortada(wb, {
      titulo,
      grupoNombre,
      filtros: {
        periodo: `${memoriaDetalle.anio}`,
        estados: safe(memoriaDetalle.estado),
      },
      resumenData: [
        { label: "Versión", value: safe(memoriaDetalle.version) },
        { label: "Estado", value: safe(memoriaDetalle.estado) },
        { label: "Personal (memoria)", value: safe(memoriaDetalle.personal?.length ?? 0) },
        { label: "Equipamientos (memoria)", value: safe(memoriaDetalle.equipamiento?.length ?? 0) },
        { label: "Inversión (memoria)", value: `$${calcInversionMemoria(memoriaDetalle).toLocaleString("es-AR")}` },
      ],
    });

    addMemoriaPersonalSheet(wb, memoriaDetalle);
    addMemoriaEquipamientoSheet(wb, memoriaDetalle);

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },

  /**
   * Export: todas las memorias de un grupo en un workbook (una hoja por memoria).
   * Ideal para integrantes (o admin cuando pide "memorias enviadas por grupo").
   *
   * @param {Object} param0
   * @param {Object} param0.grupo  GrupoInvestigacion (opcional)
   * @param {Array}  param0.memorias Array de Memoria (idealmente con incluirDetalle:true)
   * @param {Object} param0.filtros { from, to, estados }
   */
  async generarGrupoMemoriasXlsx({ grupo, memorias = [], filtros = {} }) {
    const wb = new ExcelJS.Workbook();
    wb.creator = "SGMI";
    wb.created = new Date();

    const grupoNombre =
      grupo?.nombre ??
      memorias[0]?.grupo?.nombre ??
      `Grupo #${memorias[0]?.grupoId ?? ""}`;

    const periodo =
      filtros?.from && filtros?.to
        ? `${filtros.from} - ${filtros.to}`
        : safe(filtros?.periodo ?? "");
    const estados = Array.isArray(filtros?.estados)
      ? filtros.estados.join(", ")
      : safe(filtros?.estados ?? "");

    const totalMemorias = memorias.length;
    const totalInv = memorias.reduce(
      (acc, m) => acc + calcInversionMemoria(m),
      0,
    );
    buildPortada(wb, {
      titulo: `Memorias del grupo (${grupoNombre})`,
      grupoNombre,
      filtros: {
        periodo: periodo || "—",
        estados: estados || "—",
      },
      resumenData: [
        { label: "Cantidad de memorias", value: totalMemorias },
        { label: "Inversión total", value: `$${totalInv.toLocaleString("es-AR")}` },
      ],
    });

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },

  /**
   * Export: Admin resumen multi-grupo (con métricas y detalle de memorias).
   *
   * @param {Object} param0
   * @param {Array}  param0.gruposResumen Array de filas ya calculadas en el service:
   *   [{
   *      grupoId, grupoNombre,
   *      memoriasEnviadas, memoriasAprobadas, memoriasRechazadas,
   *      ultimaMemoriaLabel,  // ej: "2026 v2"
   *      personalActualCount, equipActualCount,
   *      presupuestoActual, presupuestoEnMemorias
   *   }]
   * @param {Array} param0.memoriasDetalle Array de memorias (ideal incluirDetalle:true) para hoja Detalle_Memorias
   * @param {Object} param0.filtros { from, to, estados, grupoIds }
   */
  async generarAdminResumenXlsx({
    gruposResumen = [],
    memoriasDetalle = [],
    filtros = {},
  }) {
    const wb = new ExcelJS.Workbook();
    wb.creator = "SGMI";
    wb.created = new Date();

    const periodo =
      filtros?.from && filtros?.to
        ? `${filtros.from} - ${filtros.to}`
        : safe(filtros?.periodo ?? "—");
    const estados = Array.isArray(filtros?.estados)
      ? filtros.estados.join(", ")
      : safe(filtros?.estados ?? "—");
    const gruposTxt =
      Array.isArray(filtros?.grupoIds) && filtros.grupoIds.length
        ? filtros.grupoIds.join(", ")
        : "Todos";
    buildPortada(wb, {
      titulo: "Resumen administrativo de grupos",
      grupoNombre: null,
      filtros: {
        periodo,
        estados,
      },
      resumenData: [
        { label: "Grupos", value: gruposTxt },
        { label: "Cantidad de grupos", value: gruposResumen.length },
        { label: "Memorias consideradas", value: memoriasDetalle.length },
      ],
    });

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },

  /**
   * Export: Estado actual de un grupo (admin/integrante)).
   * Incluye personal/equipamiento actual aunque no haya memoria enviada.
   *
   * @param {Object} param0
   * @param {Object} param0.grupo
   * @param {Array}  param0.personalActual (lista Personal con include Usuario + Investigador/EnFormacion si existe)
   * @param {Array}  param0.equipamientoActual (lista Equipamiento actual del grupo)
   */
  async generarEstadoActualGrupoXlsx({
    grupo,
    personalActual = [],
    equipamientoActual = [],
  }) {
    const wb = new ExcelJS.Workbook();
    wb.creator = "SGMI";
    wb.created = new Date();

    const grupoNombre = grupo?.nombre ?? `Grupo #${grupo?.id ?? ""}`;
    buildPortada(wb, {
      titulo: `Estado actual del grupo`,
      grupoNombre,
      filtros: {
        periodo: "A hoy",
        estados: "—",
      },
      resumenData: [
        { label: "Personal actual", value: personalActual.length },
        { label: "Equipamiento actual", value: equipamientoActual.length },
        { label: "Presupuesto actual", value: `$${calcInversionActual(equipamientoActual).toLocaleString("es-AR")}` },
      ],
    });

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },

  utils: {
    normalizeFilename,
    calcInversionMemoria,
    calcInversionActual,
    calcInversionEquipamientosActual,
  },
};
