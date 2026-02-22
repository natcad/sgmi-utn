// backend/src/modules/memorias/controllers/MemoriaController.js
import sequelize from "../../../config/database.js";
import { MemoriaService } from "../services/MemoriasService.js";

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
  // body: { idGrupo, anio, titulo?, resumen? }
  async crear(req, res) {
    const t = await sequelize.transaction();

    try {
      const { grupoId, anio, titulo, resumen } = req.body;

      const idCreador = req.usuario?.id || req.user?.id || req.body.idCreador;

      if (!grupoId || !anio || !idCreador) {
        await t.rollback();
        return res.status(400).json({
          message: "grupoId, anio e idCreador son obligatorios",
        });
      }

      // Crear memoria + snapshots de personal y equipamiento
      const nuevaMemoria = await MemoriaService.crearConSnapshot(
        {
          grupoId,
          anio,
          idCreador,
          titulo,
          resumen,
        },
        t
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

      const memoriaActualizada = await MemoriaService.actualizar(
        id,
        datos,
        t
      );

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
};
