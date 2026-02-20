// backend/src/modules/memorias/controllers/MemoriaController.js
import sequelize from "../../../config/database.js";
import { MemoriaService } from "../services/MemoriasService.js";
import { MemoriaRepository } from "../repositories/MemoriasRepository.js";
import { ExcelService } from "../../../services/excel.service.js";
import { MailerService } from "../../../services/mailer.service.js";
import * as GrupoService from "../../Grupos/grupos.services.js";

const normalizeEmails = (emails) => {
  const arr = Array.isArray(emails) ? emails : [emails];
  return [...new Set(arr.map((e) => String(e || "").trim()).filter(Boolean))];
};
const normalizeFilename = (s) =>
  String(s ?? "")
    .trim()
    .replaceAll(" ", "_")
    .replace(/[^\w\-\.]/g, "_");

const parseEstados = (estadoQuery) => {
  if (!estadoQuery) return undefined;
  const arr = String(estadoQuery)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length ? arr : undefined;
};

export const MemoriaController = {
  // GET /api/memorias?grupoId=&anio=&estado=&incluirDetalle=true
  async listar(req, res) {
    try {
      const { grupoId, anio, estado, incluirDetalle } = req.query;

      const memorias = await MemoriaService.listar({
        grupoId: grupoId ?? undefined,
        anio: anio ? Number(anio) : undefined,
        estado: estado ?? undefined,
        incluirDetalle: incluirDetalle === "true",
      });

      return res.json(memorias);
    } catch (error) {
      console.error("Error al listar memorias:", error);
      return res
        .status(500)
        .json({ message: "Error al listar memorias", error: error.message });
    }
  },

  // GET /api/memorias/:id?incluirDetalle=true
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const { incluirDetalle } = req.query;

      const memoria = await MemoriaService.obtenerPorId(id, {
        incluirDetalle: incluirDetalle === "true",
      });

      if (!memoria) {
        return res.status(404).json({ message: "Memoria no encontrada" });
      }

      return res.json(memoria);
    } catch (error) {
      console.error("Error al obtener memoria:", error);
      return res
        .status(500)
        .json({ message: "Error al obtener memoria", error: error.message });
    }
  },

  // POST /api/memorias
  // body: { idGrupo, anio, titulo?, resumen?, incluirDatosPrevios? }
  async crear(req, res) {
    const t = await sequelize.transaction();

    try {
      const { grupoId, anio, titulo, resumen, incluirDatosPrevios } = req.body;

      console.log("[MemoriasController.crear] Parámetros recibidos:", {
        grupoId,
        anio,
        titulo,
        resumen,
        incluirDatosPrevios,
        tipo: typeof incluirDatosPrevios,
      });

      const idCreador = req.usuario?.id || req.user?.id || req.body.idCreador;

      if (!grupoId || !anio || !idCreador) {
        await t.rollback();
        return res.status(400).json({
          message: "grupoId, anio e idCreador son obligatorios",
        });
      }

      // Procesar incluirDatosPrevios
      const normalizado = String(incluirDatosPrevios).toLowerCase();
      const procesado =
        incluirDatosPrevios === true ||
        ["true", "1", "on", "yes", "conprevios"].includes(normalizado);
      console.log(
        "[MemoriasController.crear] incluirDatosPrevios procesado:",
        procesado,
      );

      // Crear memoria + snapshots de personal y equipamiento
      const nuevaMemoria = await MemoriaService.crearConSnapshot(
        {
          grupoId,
          anio,
          idCreador,
          titulo,
          resumen,
          incluirDatosPrevios: procesado,
        },
        t,
      );

      await t.commit();
      return res.status(201).json(nuevaMemoria);
    } catch (error) {
      await t.rollback();
      console.error("Error al crear memoria:", error);
      return res
        .status(500)
        .json({ message: "Error al crear memoria", error: error.message });
    }
  },

  // PUT /api/memorias/:id
  // body: { estado?, titulo?, resumen?, fechaCierre? }
  async actualizar(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { estado, titulo, resumen, fechaCierre } = req.body;

      const datos = {};
      if (estado) datos.estado = estado;
      if (titulo !== undefined) datos.titulo = titulo;
      if (resumen !== undefined) datos.resumen = resumen;
      if (fechaCierre !== undefined) datos.fechaCierre = fechaCierre;

      const memoriaActualizada = await MemoriaService.actualizar(id, datos, t);

      if (!memoriaActualizada) {
        await t.rollback();
        return res.status(404).json({ message: "Memoria no encontrada" });
      }

      await t.commit();
      return res.json(memoriaActualizada);
    } catch (error) {
      await t.rollback();
      console.error("Error al actualizar memoria:", error);
      return res
        .status(500)
        .json({ message: "Error al actualizar memoria", error: error.message });
    }
  },

  // DELETE /api/memorias/:id
  async eliminar(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;

      const eliminada = await MemoriaService.eliminar(id, t);

      if (!eliminada) {
        await t.rollback();
        return res.status(404).json({ message: "Memoria no encontrada" });
      }

      await t.commit();
      return res.json({ message: "Memoria eliminada correctamente" });
    } catch (error) {
      await t.rollback();
      console.error("Error al eliminar memoria:", error);
      return res
        .status(500)
        .json({ message: "Error al eliminar memoria", error: error.message });
    }
  },

  //exportar a Excel
  async exportarExcel(req, res) {
    try {
      const { id } = req.params;
      const memoria = await MemoriaService.obtenerPorId(id, {
        incluirDetalle: true,
      });
      if (!memoria) {
        return res.status(404).json({ message: "Memoria no encontrada" });
      }
      const buffer = await ExcelService.generarMemoriaXlsx(memoria);
      const grupoNombre = memoria.grupo ? memoria.grupo.nombre : "grupo";
      const anio = memoria.anio || "anio";
      const filename = `Memoria_${grupoNombre}_${anio}.xlsx`;

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      return res.status(200).send(buffer);
    } catch (error) {
      console.error("Error al exportar memoria a Excel:", error);
      res.status(500).json({
        message: "Error al exportar memoria a Excel",
        error: error.message,
      });
    }
  },
  //exportar todas las memorias del grupo a Excel
  async exportarExcelGrupoMemorias(req, res) {
    try {
      const grupoId = Number(req.params.grupoId);
      if (Number.isNaN(grupoId)) {
        return res.status(400).json({ message: "grupoId inválido" });
      }

      const from = req.query.from ? Number(req.query.from) : undefined;
      const to = req.query.to ? Number(req.query.to) : undefined;
      const estados = parseEstados(req.query.estado);

      if (
        (req.query.from && Number.isNaN(from)) ||
        (req.query.to && Number.isNaN(to))
      ) {
        return res.status(400).json({ message: "from/to inválidos" });
      }
      const grupo = await GrupoService.obtenerPorId(grupoId);
      if (!grupo) {
        return res.status(404).json({ message: "Grupo no encontrado" });
      }
      let memorias = await MemoriaService.listar({
        grupoId,
        incluirDetalle: true,
      });

      // 3) Filtrar por rango de años (from/to)
      if (from !== undefined)
        memorias = memorias.filter((m) => Number(m.anio) >= from);
      if (to !== undefined)
        memorias = memorias.filter((m) => Number(m.anio) <= to);

      // 4) Filtrar por estados (si vienen)
      if (estados?.length) {
        const set = new Set(estados.map((e) => e.toLowerCase()));
        memorias = memorias.filter((m) =>
          set.has(String(m.estado).toLowerCase()),
        );
      }

      if (!memorias.length) {
        return res.status(404).json({
          message:
            "No hay memorias para exportar con los filtros seleccionados",
        });
      }

      const filtros = {
        from,
        to,
        estados: estados ?? [],
        periodo:
          from !== undefined && to !== undefined
            ? `${from} - ${to}`
            : from !== undefined
              ? `desde ${from}`
              : to !== undefined
                ? `hasta ${to}`
                : "—",
      };
      const buffer = await ExcelService.generarGrupoMemoriasXlsx({
        grupo,
        memorias,
        filtros,
      });

      const estadosTxt = (estados?.length ? estados : ["Todos"]).join("-");
      const filename = normalizeFilename(
        `Memorias_${grupo.nombre}_${filtros.periodo}_${estadosTxt}.xlsx`,
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );

      return res.status(200).send(buffer);
    } catch (e) {
      console.error(e);
      return res
        .status(e.statusCode || 500)
        .json({ message: e.message || "Error al exportar memorias del grupo" });
    }
  },
  //enviar por mail
  // POST /memorias/:id/enviar-por-mail
  async enviarPorMail(req, res) {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const rol = req.user.rol;

    const emails = normalizeEmails(req.body?.emails);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    if (!emails.length) {
      return res
        .status(400)
        .json({ message: "Debe indicar al menos un email" });
    }

    let memoriaDetalle; // la usamos para armar el excel y el mail

    try {
      // 1) TX: validar + cambiar estado
      const memoriaActualizada = await sequelize.transaction(async (t) => {
        memoriaDetalle = await MemoriaRepository.findById(id, {
          incluirDetalle: true,
          transaction: t,
        });

        if (!memoriaDetalle) {
          const err = new Error("Memoria no encontrada");
          err.statusCode = 404;
          throw err;
        }

        await MemoriaService.enviar(id, { userId, rol }, t);

        return await MemoriaRepository.findById(id, {
          incluirDetalle: false,
          transaction: t,
        });
      });

      // 2) Fuera de tx: generar Excel
      const buffer = await ExcelService.generarMemoriaXlsx(memoriaDetalle);

      const grupoNombre =
        memoriaDetalle.grupo?.nombre ?? `Grupo_${memoriaDetalle.grupoId}`;
      const filename =
        `Memoria_${grupoNombre}_${memoriaDetalle.anio}_v${memoriaDetalle.version}.xlsx`.replaceAll(
          " ",
          "_",
        );

      // 3) Enviar mail (a los destinatarios que vino por body)
      let emailEnviado = true;
      try {
        await MailerService.send({
          to: emails,
          subject: `Memoria ${memoriaDetalle.anio} - ${
            memoriaDetalle.grupo?.nombre ?? "Grupo"
          }`,
          html: `<p>Adjuntamos la memoria del año <b>${memoriaDetalle.anio}</b> del grupo <b>${
            memoriaDetalle.grupo?.nombre ?? "Grupo"
          }</b>.</p>`,
          attachments: [
            {
              filename,
              content: buffer,
              contentType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
          ],
        });
      } catch (mailErr) {
        emailEnviado = false;
        console.error("Error enviando mail:", mailErr);
      }

      return res.status(200).json({
        message: emailEnviado
          ? "Memoria enviada por mail correctamente"
          : "Memoria marcada como enviada, pero falló el envío de mail",
        emailEnviado,
        memoria: memoriaActualizada,
      });
    } catch (error) {
      console.error("Error al enviar memoria por mail:", error);
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message || "Error al enviar memoria por mail" });
    }
  },

  // POST /api/memorias/:id/aprobar
  // Solo admins pueden aprobar
  async aprobar(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const rol = req.user?.rol;

      if (Number.isNaN(Number(id))) {
        await t.rollback();
        return res.status(400).json({ message: "ID inválido" });
      }

      // 1) Dentro de TX: obtener memoria con detalles y aprobar
      let memoriaDetalle = await MemoriaRepository.findById(id, {
        incluirDetalle: true,
        transaction: t,
      });

      if (!memoriaDetalle) {
        await t.rollback();
        return res.status(404).json({ message: "Memoria no encontrada" });
      }

      const memoriaAprobada = await MemoriaService.aprobar(
        id,
        { rol },
        t
      );

      if (!memoriaAprobada) {
        await t.rollback();
        return res.status(500).json({ message: "No se pudo aprobar la memoria" });
      }

      await t.commit();

      // 2) Fuera de TX: enviar correo de notificación
      if (memoriaDetalle?.creador?.email) {
        try {
          const grupoNombre =
            memoriaDetalle.grupo?.nombre ?? `Grupo ${memoriaDetalle.grupoId}`;
          await MailerService.send({
            to: memoriaDetalle.creador.email,
            subject: `Memoria ${memoriaDetalle.anio} - Aprobada`,
            html: `
              <h3>Memoria Aprobada</h3>
              <p>Nos complace informarle que su memoria ha sido <b>aprobada</b>.</p>
              <p><b>Detalles:</b></p>
              <ul>
                <li><strong>Grupo:</strong> ${grupoNombre}</li>
                <li><strong>Año:</strong> ${memoriaDetalle.anio}</li>
                <li><strong>Versión:</strong> ${memoriaDetalle.version}</li>
              </ul>
              <p>Si tiene alguna pregunta, contacte al administrador.</p>
            `,
          });
        } catch (mailErr) {
          console.error("Error enviando correo de aprobación:", mailErr);
        }
      }

      return res.json({
        message: "Memoria aprobada correctamente",
        memoria: memoriaAprobada,
      });
    } catch (error) {
      await t.rollback();
      console.error("Error al aprobar memoria:", error);
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message || "Error al aprobar memoria" });
    }
  },

  // POST /api/memorias/:id/rechazar
  // Solo admins pueden rechazar
  async rechazar(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { comentario } = req.body || {};
      const rol = req.user?.rol;

      if (Number.isNaN(Number(id))) {
        await t.rollback();
        return res.status(400).json({ message: "ID inválido" });
      }

      // 1) Dentro de TX: obtener memoria con detalles y rechazar
      let memoriaDetalle = await MemoriaRepository.findById(id, {
        incluirDetalle: true,
        transaction: t,
      });

      if (!memoriaDetalle) {
        await t.rollback();
        return res.status(404).json({ message: "Memoria no encontrada" });
      }

      const memoriaRechazada = await MemoriaService.rechazar(
        id,
        { rol },
        t
      );

      if (!memoriaRechazada) {
        await t.rollback();
        return res.status(500).json({ message: "No se pudo rechazar la memoria" });
      }

      await t.commit();

      // 2) Fuera de TX: enviar correo de notificación
      if (memoriaDetalle?.creador?.email) {
        try {
          const grupoNombre =
            memoriaDetalle.grupo?.nombre ?? `Grupo ${memoriaDetalle.grupoId}`;
          const comentarioHtml = comentario 
            ? `<hr /><h4>Motivos del rechazo:</h4><p>${comentario.replace(/\n/g, "<br/>")}</p>`
            : "";
          
          await MailerService.send({
            to: memoriaDetalle.creador.email,
            subject: `Memoria ${memoriaDetalle.anio} - Rechazada`,
            html: `
              <h3>Memoria Rechazada</h3>
              <p>Le informamos que su memoria ha sido <b>rechazada</b>.</p>
              <p>Por favor, revise los comentarios del administrador y vuelva a enviar la memoria con las correcciones necesarias.</p>
              <p><b>Detalles:</b></p>
              <ul>
                <li><strong>Grupo:</strong> ${grupoNombre}</li>
                <li><strong>Año:</strong> ${memoriaDetalle.anio}</li>
                <li><strong>Versión:</strong> ${memoriaDetalle.version}</li>
              </ul>
              ${comentarioHtml}
              <p>Si tiene alguna pregunta, contacte al administrador.</p>
            `,
          });
        } catch (mailErr) {
          console.error("Error enviando correo de rechazo:", mailErr);
        }
      }

      return res.json({
        message: "Memoria rechazada correctamente",
        memoria: memoriaRechazada,
      });
    } catch (error) {
      await t.rollback();
      console.error("Error al rechazar memoria:", error);
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message || "Error al rechazar memoria" });
    }
  }
};
