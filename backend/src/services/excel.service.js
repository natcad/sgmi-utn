import ExcelJS from "exceljs";

/**
 * ExcelService (limpio)
 * - generarMemoriaXlsx(memoriaDetalle)
 * - generarGrupoMemoriasXlsx({ grupo, memorias, filtros })
 * - generarAdminResumenXlsx({ gruposResumen, memoriasDetalle, filtros })
 * - generarEstadoActualGrupoXlsx({ grupo, personalActual, equipamientoActual })
 */

// -------------------- helpers --------------------
const safe = (v) => (v === null || v === undefined ? "" : String(v));
const n = (v) => {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
};
const money = (v) => n(v); // value numérico; formato se aplica con numFmt

const normalizeFilename = (s) =>
  safe(s)
    .trim()
    .replaceAll(" ", "_")
    .replace(/[^\w\-\.]/g, "_");

const COLORS = {
  headerBg: "FF0B3A5A",
  headerFg: "FFFFFFFF",
  border: "FFD1D5DB",
  zebra: "FFF8FAFC",
  mutedText: "FF6B7280",
};

function styleHeaderRow(ws, rowNum = 1) {
  const row = ws.getRow(rowNum);
  row.font = { bold: true, color: { argb: COLORS.headerFg }, size: 11 };
  row.alignment = { vertical: "middle", horizontal: "center" };
  row.height = 20;

  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.headerBg } };
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
        ws.getCell(i, j).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLORS.zebra },
        };
      }
    }
  }
}

function setAutoFilter(ws, fromColLetter, toColLetter, headerRow) {
  ws.autoFilter = { from: `${fromColLetter}${headerRow}`, to: `${toColLetter}${headerRow}` };
}

function addSectionTitle(ws, title, { row, col = 1 }) {
  const cell = ws.getCell(row, col);
  cell.value = title;
  cell.font = { bold: true, size: 13 };
  return row + 1;
}

// -------------------- cálculos --------------------
function calcInversionMemoria(memoria) {
  return (memoria.equipamiento ?? []).reduce((acc, me) => {
    const monto = n(me?.montoInvertido ?? me?.equipamiento?.montoInvertido ?? 0);
    return acc + monto;
  }, 0);
}

function calcInversionActual(equipamientos) {
  return (equipamientos ?? []).reduce((acc, e) => acc + n(e?.montoInvertido ?? 0), 0);
}

function calcAvg(num, den) {
  const a = n(num);
  const b = n(den);
  return b ? a / b : 0;
}

// -------------------- portada --------------------
function buildPortada(wb, { titulo, grupoNombre, filtros, objetivo, resumenData = [] }) {
  const ws = wb.addWorksheet("Portada", { views: [{ showGridLines: false }] });
  ws.getColumn(1).width = 30;
  ws.getColumn(2).width = 50;

  ws.mergeCells("A1:B1");
  const titleCell = ws.getCell("A1");
  titleCell.value = titulo;
  titleCell.font = { size: 24, bold: true, color: { argb: COLORS.headerBg } };
  titleCell.alignment = { vertical: "center", horizontal: "left" };
  ws.getRow(1).height = 35;

  let r = 3;

  if (objetivo) {
    ws.getCell(r, 1).value = "Objetivo";
    ws.getCell(r, 1).font = { bold: true, size: 12, color: { argb: COLORS.headerBg } };
    r++;

    ws.mergeCells(`A${r}:B${r + 1}`);
    const objetivoCell = ws.getCell(r, 1);
    objetivoCell.value = objetivo;
    objetivoCell.font = { size: 10, color: { argb: "FF374151" } };
    objetivoCell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
    objetivoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFAFBFC" } };
    objetivoCell.border = {
      top: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } },
    };
    ws.getRow(r).height = 36;
    ws.getRow(r + 1).height = 36;
    r += 3;
  }

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
    labelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.headerBg } };
    labelCell.alignment = { vertical: "center", horizontal: "left" };

    valueCell.value = value;
    valueCell.font = { size: 11, color: { argb: COLORS.headerBg } };
    valueCell.alignment = { vertical: "center", horizontal: "left", wrapText: true };
    valueCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFAFBFC" } };

    ws.getRow(r).height = 22;
    r++;
  });

  r += 2;

  if (resumenData.length) {
    ws.getCell(r, 1).value = "Concepto";
    ws.getCell(r, 2).value = "Valor";
    styleHeaderRow(ws, r);
    ws.getRow(r).height = 20;
    r++;

    resumenData.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? "FFFAFBFC" : "FFFFFFFF";
      const a = ws.getCell(r, 1);
      const b = ws.getCell(r, 2);
      a.value = item.label;
      b.value = item.value;

      [a, b].forEach((c) => {
        c.font = { size: 10, color: { argb: "FF374151" } };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
        c.alignment = { vertical: "center", horizontal: "left", wrapText: true };
        c.border = {
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

// -------------------- hojas: memoria --------------------
function addMemoriaPersonalSheet(wb, memoria) {
  const ws = wb.addWorksheet(`Personal_${memoria.id}`.slice(0, 31), {
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
    const tipo = p?.Investigador ? "Investigador" : p?.EnFormacion ? "En formación" : "Personal";

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
  if (lastRow > 1) applyZebraRows(ws, 2, lastRow, 1, 9);

  return ws;
}

function addMemoriaEquipamientoSheet(wb, memoria) {
  const ws = wb.addWorksheet(`Equip_${memoria.id}`.slice(0, 31), {
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
      montoInvertido: money(monto),
      fechaIncorporacion: e?.fechaIncorporacion ? new Date(e.fechaIncorporacion) : "",
    });
  });

  ws.getColumn("montoInvertido").numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';
  ws.getColumn("descripcion").alignment = { wrapText: true };

  const lastRow = Math.max(1, (memoria.equipamiento?.length ?? 0) + 1);
  setAutoFilter(ws, "A", "E", 1);
  applyTableBorders(ws, 1, lastRow, 1, 5);
  if (lastRow > 1) applyZebraRows(ws, 2, lastRow, 1, 5);

  return ws;
}

// -------------------- hojas: grupo (memorias) --------------------
function addGrupoPersonalSheet(wb, memorias = []) {
  const ws = wb.addWorksheet("Personal", { views: [{ state: "frozen", ySplit: 1 }] });

  ws.columns = [
    { header: "Memoria", key: "memoria", width: 28 },
    { header: "Año", key: "anio", width: 10 },
    { header: "Versión", key: "version", width: 10 },
    { header: "Estado", key: "estado", width: 14 },
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

  let rowCount = 0;
  memorias.forEach((m) => {
    const memoriaLabel = `Memoria ${safe(m.anio)} v${safe(m.version)}`;
    const estado = safe(m.estado);

    (m.personal ?? []).forEach((mp) => {
      const p = mp?.personal;
      const u = p?.Usuario;
      const tipo = p?.Investigador ? "Investigador" : p?.EnFormacion ? "En formación" : "Personal";

      ws.addRow({
        memoria: memoriaLabel,
        anio: safe(m.anio),
        version: safe(m.version),
        estado,
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
      rowCount++;
    });
  });

  const lastRow = Math.max(1, rowCount + 1);
  setAutoFilter(ws, "A", "M", 1);
  applyTableBorders(ws, 1, lastRow, 1, 13);
  if (lastRow > 1) applyZebraRows(ws, 2, lastRow, 1, 13);

  return ws;
}

function addGrupoEquipamientoSheet(wb, memorias = []) {
  const ws = wb.addWorksheet("Equipamientos", { views: [{ state: "frozen", ySplit: 1 }] });

  ws.columns = [
    { header: "Memoria", key: "memoria", width: 28 },
    { header: "Año", key: "anio", width: 10 },
    { header: "Versión", key: "version", width: 10 },
    { header: "Estado", key: "estado", width: 14 },
    { header: "Denominación", key: "denominacion", width: 32 },
    { header: "Descripción", key: "descripcion", width: 50 },
    { header: "Cantidad", key: "cantidad", width: 10 },
    { header: "Monto Invertido", key: "montoInvertido", width: 18 },
    { header: "Fecha de Incorporación", key: "fechaIncorporacion", width: 18 },
  ];
  styleHeaderRow(ws, 1);

  let rowCount = 0;
  memorias.forEach((m) => {
    const memoriaLabel = `Memoria ${safe(m.anio)} v${safe(m.version)}`;
    const estado = safe(m.estado);

    (m.equipamiento ?? []).forEach((me) => {
      const e = me?.equipamiento;
      const monto = n(me?.montoInvertido ?? e?.montoInvertido ?? 0);

      ws.addRow({
        memoria: memoriaLabel,
        anio: safe(m.anio),
        version: safe(m.version),
        estado,
        denominacion: safe(e?.denominacion),
        descripcion: safe(e?.descripcion),
        cantidad: safe(me?.cantidad ?? e?.cantidad ?? 1),
        montoInvertido: money(monto),
        fechaIncorporacion: e?.fechaIncorporacion ? new Date(e.fechaIncorporacion) : "",
      });
      rowCount++;
    });
  });

  ws.getColumn("montoInvertido").numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';
  ws.getColumn("descripcion").alignment = { wrapText: true };

  const lastRow = Math.max(1, rowCount + 1);
  setAutoFilter(ws, "A", "I", 1);
  applyTableBorders(ws, 1, lastRow, 1, 9);
  if (lastRow > 1) applyZebraRows(ws, 2, lastRow, 1, 9);

  return ws;
}

function addGrupoEstadisticasSheet(wb, memorias = []) {
  const ws = wb.addWorksheet("Estadisticas");
  ws.getColumn(1).width = 32;
  ws.getColumn(2).width = 36;

  const personalEntries = [];
  const equipEntries = [];

  memorias.forEach((m) => {
    (m.personal ?? []).forEach((mp) => {
      const p = mp?.personal;
      const tipo = p?.Investigador ? "Investigador" : p?.EnFormacion ? "En formación" : "Otros";

      personalEntries.push({
        tipo,
        rol: safe(p?.rol) || "Sin rol",
        horasSemanales: n(p?.horasSemanales),
        categoriaUTN: safe(p?.Investigador?.categoriaUTN) || "Sin dato",
        dedicacion: safe(p?.Investigador?.dedicacion) || "Sin dato",
      });
    });

    (m.equipamiento ?? []).forEach((me) => {
      const e = me?.equipamiento;
      equipEntries.push({
        denominacion: safe(e?.denominacion) || "Sin denominación",
        cantidad: n(me?.cantidad ?? e?.cantidad ?? 1),
        monto: n(me?.montoInvertido ?? e?.montoInvertido ?? 0),
        fechaIncorporacion: e?.fechaIncorporacion || null,
      });
    });
  });

  const countBy = (items, getter) => {
    const map = new Map();
    items.forEach((item) => {
      const key = safe(getter(item)) || "Sin dato";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  };

  const totalHoras = personalEntries.reduce((acc, p) => acc + n(p.horasSemanales), 0);
  const personalCount = personalEntries.length;
  const promedioHoras = personalCount ? totalHoras / personalCount : 0;

  const totalItems = equipEntries.reduce((acc, e) => acc + n(e.cantidad), 0);
  const totalInversion = equipEntries.reduce((acc, e) => acc + n(e.monto), 0);
  const promedioPorItem = totalItems ? totalInversion / totalItems : 0;

  const topEquip = [...equipEntries]
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 5)
    .map((e) => ({ label: e.denominacion, value: e.monto, isMoney: true }));

  const inversionPorAnioMap = new Map();
  equipEntries.forEach((e) => {
    const year = e.fechaIncorporacion ? new Date(e.fechaIncorporacion).getFullYear() : "Sin fecha";
    inversionPorAnioMap.set(year, (inversionPorAnioMap.get(year) || 0) + n(e.monto));
  });
  const inversionPorAnio = Array.from(inversionPorAnioMap.entries())
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
    .map(([label, value]) => ({ label: String(label), value, isMoney: true }));

  const addTwoColTable = (title, headerA, headerB, rows, { moneyCol = false } = {}) => {
    let r = addSectionTitle(ws, title, { row: addTwoColTable.row });
    const headerRow = r;
    ws.getCell(r, 1).value = headerA;
    ws.getCell(r, 2).value = headerB;
    styleHeaderRow(ws, headerRow);
    r++;

    const startDataRow = r;
    rows.forEach((row) => {
      ws.getCell(r, 1).value = row.label;
      ws.getCell(r, 2).value = row.value;
      if (row.isMoney || moneyCol) ws.getCell(r, 2).numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';
      r++;
    });
    const endDataRow = r - 1;

    if (endDataRow >= headerRow + 1) {
      applyTableBorders(ws, headerRow, endDataRow, 1, 2);
      applyZebraRows(ws, headerRow + 1, endDataRow, 1, 2);
    } else {
      ws.getCell(r, 1).value = "Sin datos";
      ws.getCell(r, 1).font = { italic: true, color: { argb: COLORS.mutedText } };
      r++;
    }

    addTwoColTable.row = r + 1;
  };
  addTwoColTable.row = 1;

  addSectionTitle(ws, "Personal", { row: addTwoColTable.row });
  addTwoColTable.row++;

  addTwoColTable("Totales y promedio", "Concepto", "Valor", [
    { label: "Total personal", value: personalCount },
    { label: "Promedio horas semanales", value: Number(promedioHoras.toFixed(2)) },
  ]);

  addTwoColTable("Por tipo", "Tipo", "Cantidad", countBy(personalEntries, (p) => p.tipo));
  addTwoColTable("Por rol", "Rol", "Cantidad", countBy(personalEntries, (p) => p.rol));
  addTwoColTable(
    "Por categoría UTN",
    "Categoría UTN",
    "Cantidad",
    countBy(personalEntries, (p) => p.categoriaUTN),
  );
  addTwoColTable(
    "Por dedicación",
    "Dedicación",
    "Cantidad",
    countBy(personalEntries, (p) => p.dedicacion),
  );

  addSectionTitle(ws, "Equipamiento", { row: addTwoColTable.row });
  addTwoColTable.row++;

  addTwoColTable("Totales", "Concepto", "Valor", [
    { label: "Total de ítems", value: totalItems },
    { label: "Total de inversión", value: totalInversion, isMoney: true },
    { label: "Promedio por ítem", value: promedioPorItem, isMoney: true },
  ]);

  addTwoColTable("Top 5 por monto", "Denominación", "Monto invertido", topEquip, { moneyCol: true });
  addTwoColTable("Total por año de incorporación", "Año", "Inversión total", inversionPorAnio, {
    moneyCol: true,
  });

  return ws;
}

// -------------------- admin --------------------
function addAdminResumenSheet(wb, { gruposResumen }) {
  const ws = wb.addWorksheet("Resumen_Grupos", { views: [{ state: "frozen", ySplit: 1 }] });

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
      presActual: money(g.presupuestoActual),
      presMem: money(g.presupuestoEnMemorias),
      promEq: money(calcAvg(g.presupuestoActual, g.equipActualCount)),
    });
  });

  ["presActual", "presMem", "promEq"].forEach((k) => {
    ws.getColumn(k).numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';
  });

  setAutoFilter(ws, "A", "J", 1);
  const lastRow = Math.max(1, (gruposResumen?.length ?? 0) + 1);
  applyTableBorders(ws, 1, lastRow, 1, 10);
  if (lastRow > 1) applyZebraRows(ws, 2, lastRow, 1, 10);

  return ws;
}

function addAdminDetalleMemoriasSheet(wb, { memoriasDetalle }) {
  const ws = wb.addWorksheet("Detalle_Memorias", { views: [{ state: "frozen", ySplit: 1 }] });

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
      inv: money(calcInversionMemoria(m)),
    });
  });

  ws.getColumn("inv").numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';

  setAutoFilter(ws, "A", "G", 1);
  const lastRow = Math.max(1, (memoriasDetalle?.length ?? 0) + 1);
  applyTableBorders(ws, 1, lastRow, 1, 7);
  if (lastRow > 1) applyZebraRows(ws, 2, lastRow, 1, 7);

  return ws;
}

// -------------------- estado actual --------------------
function addEstadoActualResumenSheet(wb, { grupoNombre, personalActual, equipamientoActual }) {
  const ws = wb.addWorksheet("Estado_Actual");
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
  ws.getCell("B7").value = money(presupuesto);
  ws.getCell("B7").numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';

  return ws;
}

function addEstadoActualPersonalSheet(wb, personalActual) {
  const ws = wb.addWorksheet("Personal_Actual", { views: [{ state: "frozen", ySplit: 1 }] });

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
    const tipo = p?.Investigador ? "Investigador" : p?.EnFormacion ? "En formación" : "Personal";

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

  setAutoFilter(ws, "A", "I", 1);
  const lastRow = Math.max(1, (personalActual?.length ?? 0) + 1);
  applyTableBorders(ws, 1, lastRow, 1, 9);
  if (lastRow > 1) applyZebraRows(ws, 2, lastRow, 1, 9);

  return ws;
}

function addEstadoActualEquipamientoSheet(wb, equipamientoActual) {
  const ws = wb.addWorksheet("Equipamiento_Actual", { views: [{ state: "frozen", ySplit: 1 }] });

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
      montoInvertido: money(e?.montoInvertido),
      fechaIncorporacion: e?.fechaIncorporacion ? new Date(e.fechaIncorporacion) : "",
    });
  });

  ws.getColumn("montoInvertido").numFmt = '$ #,##0.00;[Red]-$ #,##0.00;""';
  ws.getColumn("descripcion").alignment = { wrapText: true };

  setAutoFilter(ws, "A", "E", 1);
  const lastRow = Math.max(1, (equipamientoActual?.length ?? 0) + 1);
  applyTableBorders(ws, 1, lastRow, 1, 5);
  if (lastRow > 1) applyZebraRows(ws, 2, lastRow, 1, 5);

  return ws;
}

// -------------------- servicio --------------------
export const ExcelService = {
  async generarMemoriaXlsx(memoriaDetalle) {
    const wb = new ExcelJS.Workbook();
    wb.creator = "SGMI";
    wb.created = new Date();

    const grupoNombre = memoriaDetalle.grupo?.nombre ?? `Grupo #${memoriaDetalle.grupoId}`;
    const titulo = memoriaDetalle.titulo ?? `Memoria ${memoriaDetalle.anio}`;

    buildPortada(wb, {
      titulo,
      grupoNombre,
      filtros: { periodo: `${memoriaDetalle.anio}`, estados: safe(memoriaDetalle.estado) },
      resumenData: [
        { label: "Versión", value: safe(memoriaDetalle.version) },
        { label: "Estado", value: safe(memoriaDetalle.estado) },
        { label: "Personal (memoria)", value: safe(memoriaDetalle.personal?.length ?? 0) },
        { label: "Equipamientos (memoria)", value: safe(memoriaDetalle.equipamiento?.length ?? 0) },
        {
          label: "Inversión (memoria)",
          value: `$${calcInversionMemoria(memoriaDetalle).toLocaleString("es-AR")}`,
        },
      ],
    });

    addMemoriaPersonalSheet(wb, memoriaDetalle);
    addMemoriaEquipamientoSheet(wb, memoriaDetalle);

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },

  async generarGrupoMemoriasXlsx({ grupo, memorias = [], filtros = {} }) {
    const wb = new ExcelJS.Workbook();
    wb.creator = "SGMI";
    wb.created = new Date();

    const grupoNombre =
      grupo?.nombre ?? memorias[0]?.grupo?.nombre ?? `Grupo #${memorias[0]?.grupoId ?? ""}`;

    const periodo =
      filtros?.from && filtros?.to ? `${filtros.from} - ${filtros.to}` : safe(filtros?.periodo ?? "");
    const estados = Array.isArray(filtros?.estados) ? filtros.estados.join(", ") : safe(filtros?.estados ?? "");

    const totalInv = memorias.reduce((acc, m) => acc + calcInversionMemoria(m), 0);

    buildPortada(wb, {
      titulo: `Memorias del grupo (${grupoNombre})`,
      grupoNombre,
      objetivo: safe(grupo?.objetivo),
      filtros: { periodo: periodo || "—", estados: estados || "—" },
      resumenData: [
        { label: "Cantidad de memorias", value: memorias.length },
        { label: "Inversión total", value: `$${totalInv.toLocaleString("es-AR")}` },
      ],
    });

    addGrupoPersonalSheet(wb, memorias);
    addGrupoEquipamientoSheet(wb, memorias);
    addGrupoEstadisticasSheet(wb, memorias);

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },

  async generarAdminResumenXlsx({ gruposResumen = [], memoriasDetalle = [], filtros = {} }) {
    const wb = new ExcelJS.Workbook();
    wb.creator = "SGMI";
    wb.created = new Date();

    const periodo = filtros?.from && filtros?.to ? `${filtros.from} - ${filtros.to}` : safe(filtros?.periodo ?? "—");
    const estados = Array.isArray(filtros?.estados) ? filtros.estados.join(", ") : safe(filtros?.estados ?? "—");
    const gruposTxt =
      Array.isArray(filtros?.grupoIds) && filtros.grupoIds.length ? filtros.grupoIds.join(", ") : "Todos";

    buildPortada(wb, {
      titulo: "Resumen administrativo de grupos",
      filtros: { periodo, estados },
      resumenData: [
        { label: "Grupos", value: gruposTxt },
        { label: "Cantidad de grupos", value: gruposResumen.length },
        { label: "Memorias consideradas", value: memoriasDetalle.length },
      ],
    });

    addAdminResumenSheet(wb, { gruposResumen });
    addAdminDetalleMemoriasSheet(wb, { memoriasDetalle });

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },

  async generarEstadoActualGrupoXlsx({ grupo, personalActual = [], equipamientoActual = [] }) {
    const wb = new ExcelJS.Workbook();
    wb.creator = "SGMI";
    wb.created = new Date();

    const grupoNombre = grupo?.nombre ?? `Grupo #${grupo?.id ?? ""}`;

    buildPortada(wb, {
      titulo: `Estado actual del grupo`,
      grupoNombre,
      filtros: { periodo: "A hoy", estados: "—" },
      resumenData: [
        { label: "Personal actual", value: personalActual.length },
        { label: "Equipamiento actual", value: equipamientoActual.length },
        {
          label: "Presupuesto actual",
          value: `$${calcInversionActual(equipamientoActual).toLocaleString("es-AR")}`,
        },
      ],
    });

    addEstadoActualResumenSheet(wb, { grupoNombre, personalActual, equipamientoActual });
    addEstadoActualPersonalSheet(wb, personalActual);
    addEstadoActualEquipamientoSheet(wb, equipamientoActual);

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },

  utils: {
    normalizeFilename,
    calcInversionMemoria,
    calcInversionActual,
  },
};
