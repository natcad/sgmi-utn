// backend/src/modules/memorias/controllers/MemoriaPersonalController.js
import sequelize from "../../../config/database.js";
import { MemoriaPersonalRepository } from "../infrastructure/MemoriaPersonalRepository.js";
import { MemoriaRepository } from "../infrastructure/MemoriaRepository.js";

export const MemoriaPersonalController = {
  // GET /api/memorias/:idMemoria/personal
  async listarPorMemoria(req, res) {
    try {
      const { idMemoria } = req.params;

      const memoria = await MemoriaRepository.findById(idMemoria);
      if (!memoria) {
        return res.status(404).json({ message: "Memoria no encontrada" });
      }

      const filas = await MemoriaPersonalRepository.findByMemoria(idMemoria);
      return res.json(filas);
    } catch (error) {
      console.error("Error al listar personal de memoria:", error);
      return res.status(500).json({
        message: "Error al listar personal de la memoria",
        error: error.message,
      });
    }
  },

  // POST /api/memorias/:idMemoria/personal
  // body: { idPersonal, rolEnGrupo?, horasSemanales?, dedicacion?, categoriaUTN?, tipoFormacion?, activoEseAnio?, observaciones? }
  async agregar(req, res) {
    const t = await sequelize.transaction();
    try {
      const { idMemoria } = req.params;
      const {
        idPersonal,
        rolEnGrupo,
        horasSemanales,
        dedicacion,
        categoriaUTN,
        tipoFormacion,
        activoEseAnio,
        observaciones,
      } = req.body;

      if (!idPersonal) {
        await t.rollback();
        return res.status(400).json({ message: "idPersonal es obligatorio" });
      }

      // Podrías validar aquí que el Personal pertenece al mismo grupo que la Memoria
      const nuevaFila = await MemoriaPersonalRepository.addIntegrante(
        {
          idMemoria,
          idPersonal,
          rolEnGrupo,
          horasSemanales,
          dedicacion,
          categoriaUTN,
          tipoFormacion,
          activoEseAnio,
          observaciones,
        },
        t
      );

      await t.commit();
      return res.status(201).json(nuevaFila);
    } catch (error) {
      await t.rollback();
      console.error("Error al agregar integrante a memoria:", error);
      return res.status(500).json({
        message: "Error al agregar integrante a la memoria",
        error: error.message,
      });
    }
  },

  // PUT /api/memoria-personal/:id
  async actualizar(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const data = req.body;

      const filaActualizada = await MemoriaPersonalRepository.updateIntegrante(
        id,
        data,
        t
      );

      if (!filaActualizada) {
        await t.rollback();
        return res.status(404).json({ message: "Registro de MemoriaPersonal no encontrado" });
      }

      await t.commit();
      return res.json(filaActualizada);
    } catch (error) {
      await t.rollback();
      console.error("Error al actualizar integrante de memoria:", error);
      return res.status(500).json({
        message: "Error al actualizar integrante de la memoria",
        error: error.message,
      });
    }
  },

  // DELETE /api/memoria-personal/:id
  async eliminar(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;

      const eliminado = await MemoriaPersonalRepository.removeIntegrante(id, t);

      if (!eliminado) {
        await t.rollback();
        return res.status(404).json({ message: "Registro de MemoriaPersonal no encontrado" });
      }

      await t.commit();
      return res.json({ message: "Integrante eliminado de la memoria" });
    } catch (error) {
      await t.rollback();
      console.error("Error al eliminar integrante de memoria:", error);
      return res.status(500).json({
        message: "Error al eliminar integrante de la memoria",
        error: error.message,
      });
    }
  },
};
