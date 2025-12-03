// backend/src/modules/memorias/controllers/MemoriaEquipamientoController.js
import sequelize from "../../../config/database.js";
import { MemoriaEquipamientoRepository } from "../infrastructure/MemoriaEquipamientoRepository.js";
import { MemoriaRepository } from "../infrastructure/MemoriaRepository.js";

export const MemoriaEquipamientoController = {
  // GET /api/memorias/:idMemoria/equipamiento
  async listarPorMemoria(req, res) {
    try {
      const { idMemoria } = req.params;

      const memoria = await MemoriaRepository.findById(idMemoria);
      if (!memoria) {
        return res.status(404).json({ message: "Memoria no encontrada" });
      }

      const filas = await MemoriaEquipamientoRepository.findByMemoria(idMemoria);
      return res.json(filas);
    } catch (error) {
      console.error("Error al listar equipamiento de memoria:", error);
      return res.status(500).json({
        message: "Error al listar equipamiento de la memoria",
        error: error.message,
      });
    }
  },

  // POST /api/memorias/:idMemoria/equipamiento
  // body: { idEquipamiento, estadoEnEseAnio?, esAltaDelAnio?, usoPrincipal?, ubicacionEnEseAnio?, valorReferencial?, observaciones? }
  async agregar(req, res) {
    const t = await sequelize.transaction();
    try {
      const { idMemoria } = req.params;
      const {
        idEquipamiento,
        estadoEnEseAnio,
        esAltaDelAnio,
        usoPrincipal,
        ubicacionEnEseAnio,
        valorReferencial,
        observaciones,
      } = req.body;

      if (!idEquipamiento) {
        await t.rollback();
        return res.status(400).json({ message: "idEquipamiento es obligatorio" });
      }

      // Podrías validar que el equipamiento pertenece al mismo grupo que la Memoria
      const nuevaFila = await MemoriaEquipamientoRepository.addEquipo(
        {
          idMemoria,
          idEquipamiento,
          estadoEnEseAnio,
          esAltaDelAnio,
          usoPrincipal,
          ubicacionEnEseAnio,
          valorReferencial,
          observaciones,
        },
        t
      );

      await t.commit();
      return res.status(201).json(nuevaFila);
    } catch (error) {
      await t.rollback();
      console.error("Error al agregar equipamiento a memoria:", error);
      return res.status(500).json({
        message: "Error al agregar equipamiento a la memoria",
        error: error.message,
      });
    }
  },

  // PUT /api/memoria-equipamiento/:id
  async actualizar(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const data = req.body;

      const filaActualizada = await MemoriaEquipamientoRepository.updateEquipo(
        id,
        data,
        t
      );

      if (!filaActualizada) {
        await t.rollback();
        return res.status(404).json({ message: "Registro de MemoriaEquipamiento no encontrado" });
      }

      await t.commit();
      return res.json(filaActualizada);
    } catch (error) {
      await t.rollback();
      console.error("Error al actualizar equipamiento de memoria:", error);
      return res.status(500).json({
        message: "Error al actualizar equipamiento de la memoria",
        error: error.message,
      });
    }
  },

  // DELETE /api/memoria-equipamiento/:id
  async eliminar(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;

      const eliminado = await MemoriaEquipamientoRepository.removeEquipo(id, t);

      if (!eliminado) {
        await t.rollback();
        return res.status(404).json({ message: "Registro de MemoriaEquipamiento no encontrado" });
      }

      await t.commit();
      return res.json({ message: "Equipamiento eliminado de la memoria" });
    } catch (error) {
      await t.rollback();
      console.error("Error al eliminar equipamiento de memoria:", error);
      return res.status(500).json({
        message: "Error al eliminar equipamiento de la memoria",
        error: error.message,
      });
    }
  },
};
