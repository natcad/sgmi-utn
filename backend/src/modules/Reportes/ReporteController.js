// backend/src/modules/reportes/controllers/ReporteController.js
"use strict";

import { Op } from "sequelize";
import db from "../../models/db.js"; // ajustá si tu path real es otro
import * as GrupoService from "../Grupos/grupos.services.js";
import { ExcelService } from "../../services/excel.service.js";
import { MemoriaService } from "../Memorias/services/MemoriasService.js";
import { MemoriaRepository } from "../Memorias/repositories/MemoriasRepository.js";

const {
  Personal,
  Usuario,
  Investigador,
  EnFormacion,
  Equipamiento,
  GrupoInvestigacion,
} = db.models;

const esAdmin = (rol) =>
  rol && ["admin", "administrador"].includes(String(rol).toLowerCase());

const normalizeFilename = (s) =>
  String(s ?? "")
    .trim()
    .replaceAll(" ", "_")
    .replace(/[^\w\-\.]/g, "_");

const parseIntOrUndef = (v) => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const parseIds = (q) => {
  if (!q) return [];
  return [
    ...new Set(
      String(q)
        .split(",")
        .map((x) => Number(x.trim()))
        .filter((x) => Number.isFinite(x))
    ),
  ];
};

const parseEstados = (q) => {
  if (!q) return [];
  return [
    ...new Set(
      String(q)
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    ),
  ];
};

const n = (v) => {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
};

const calcInversionMemoria = (memoria) =>
  (memoria.equipamiento ?? []).reduce((acc, me) => {
    const monto = n(me?.montoInvertido ?? me?.equipamiento?.montoInvertido ?? 0);
    return acc + monto;
  }, 0);

async function assertPuedeVerGrupo({ userId, rol, grupoId }) {
  if (esAdmin(rol)) return;

  const integrante = await Personal.findOne({
    where: { usuarioId: userId, grupoId },
  });

  if (!integrante) {
    const err = new Error("No tenés permisos para exportar reportes de este grupo");
    err.statusCode = 403;
    throw err;
  }
}

export const ReporteController = {
  async exportarResumenGruposExcel(req, res) {
    try {
      if (!esAdmin(req.user?.rol)) {
        return res.status(403).json({ message: "Solo administradores" });
      }

      const grupoIds = parseIds(req.query.grupoIds);
      const from = parseIntOrUndef(req.query.from);
      const to = parseIntOrUndef(req.query.to);
      const estados = parseEstados(req.query.estado);

      let grupos = [];
      if (grupoIds.length) {
        grupos = await GrupoInvestigacion.findAll({
          where: { id: { [Op.in]: grupoIds } },
        });
      } else {
        grupos = await GrupoInvestigacion.findAll();
      }

      if (!grupos.length) {
        return res.status(404).json({ message: "No se encontraron grupos" });
      }

      const gruposResumen = [];
      const memoriasDetalle = [];

      for (const g of grupos) {
        const grupoId = g.id;

        const personalActualCount = await Personal.count({ where: { grupoId } });

        const equipActual = await Equipamiento.findAll({
          where: { grupoId },
          attributes: ["id", "montoInvertido"],
        });

        const equipActualCount = equipActual.length;
        const presupuestoActual = equipActual.reduce(
          (acc, e) => acc + n(e.montoInvertido ?? 0),
          0
        );

        let memorias = await MemoriaService.listar({ grupoId, incluirDetalle: true });

        if (from !== undefined) memorias = memorias.filter((m) => Number(m.anio) >= from);
        if (to !== undefined) memorias = memorias.filter((m) => Number(m.anio) <= to);

        if (estados.length) {
          const set = new Set(estados.map((x) => x.toLowerCase()));
          memorias = memorias.filter((m) => set.has(String(m.estado).toLowerCase()));
        }

        memoriasDetalle.push(...memorias);

        const memoriasEnviadas = memorias.filter(
          (m) => String(m.estado).toLowerCase() === "enviada"
        ).length;
        const memoriasAprobadas = memorias.filter(
          (m) => String(m.estado).toLowerCase() === "aprobada"
        ).length;
        const memoriasRechazadas = memorias.filter(
          (m) => String(m.estado).toLowerCase() === "rechazada"
        ).length;

        const presupuestoEnMemorias = memorias.reduce(
          (acc, m) => acc + calcInversionMemoria(m),
          0
        );

        const sorted = [...memorias].sort((a, b) => {
          const ay = Number(a.anio),
            by = Number(b.anio);
          if (by !== ay) return by - ay;
          return Number(b.version) - Number(a.version);
        });

        const ultima = sorted[0];
        const ultimaMemoriaLabel = ultima ? `${ultima.anio} v${ultima.version}` : "—";

        gruposResumen.push({
          grupoId,
          grupoNombre: g.nombre,
          memoriasEnviadas,
          memoriasAprobadas,
          memoriasRechazadas,
          ultimaMemoriaLabel,
          personalActualCount,
          equipActualCount,
          presupuestoActual,
          presupuestoEnMemorias,
        });
      }

      const filtros = {
        from,
        to,
        estados,
        grupoIds,
        periodo:
          from !== undefined && to !== undefined
            ? `${from} - ${to}`
            : from !== undefined
              ? `desde ${from}`
              : to !== undefined
                ? `hasta ${to}`
                : "—",
      };

      const buffer = await ExcelService.generarAdminResumenXlsx({
        gruposResumen,
        memoriasDetalle,
        filtros,
      });

      const filename = normalizeFilename(
        `Resumen_Grupos_${filtros.periodo}_${(estados.length ? estados.join("-") : "Todos")}.xlsx`
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.status(200).send(buffer);
    } catch (e) {
      console.error(e);
      return res.status(e.statusCode || 500).json({
        message: e.message || "Error al exportar resumen de grupos",
      });
    }
  },

  async exportarEstadoActualGrupoExcel(req, res) {
    try {
      const grupoId = Number(req.params.grupoId);
      if (Number.isNaN(grupoId)) {
        return res.status(400).json({ message: "grupoId inválido" });
      }

      // ✅ ACÁ: sacamos "solo admin" y usamos admin o integrante
      await assertPuedeVerGrupo({
        userId: req.user?.id,
        rol: req.user?.rol,
        grupoId,
      });

      const grupo = await GrupoService.buscarPorId(grupoId);
      if (!grupo) return res.status(404).json({ message: "Grupo no encontrado" });

      // Obtener todas las memorias del grupo con detalles
      const memorias = await MemoriaRepository.findAllByGrupo({ grupoId, incluirDetalle: true });

      const buffer = await ExcelService.generarGrupoMemoriasXlsx({
        grupo,
        memorias,
        filtros: { periodo: "Estado actual a hoy" },
      });

      const filename = normalizeFilename(`Reporte_${grupo.nombre}.xlsx`);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.status(200).send(buffer);
    } catch (e) {
      console.error(e);
      return res.status(e.statusCode || 500).json({
        message: e.message || "Error al exportar reporte del grupo",
      });
    }
  },
};
