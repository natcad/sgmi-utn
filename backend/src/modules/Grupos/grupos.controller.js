// En: backend/src/modules/Grupos/grupos.controller.js

// ¡CAMBIO CLAVE AQUÍ!
// Usamos "import *" para importar TODAS las funciones del servicio
import * as gruposService from "./grupos.services.js";

// No usamos 'module.exports', exportamos cada función
export const obtenerTodosLosGrupos = async (req, res) => {
  try {
    const grupos = await gruposService.buscarTodos();
    res.status(200).json(grupos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los grupos', error: error.message });
  }
};

export const crearGrupo = async (req, res) => {
  try {
    const datosNuevoGrupo = req.body;
    if (req.file) {
      datosNuevoGrupo.organigrama = req.file.path;
    }
    const nuevoGrupo = await gruposService.crear(datosNuevoGrupo);
    res.status(201).json(nuevoGrupo);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear el grupo", error: error.message });
  }
};

export const obtenerGrupoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const grupo = await gruposService.buscarPorId(id);
    if (!grupo) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }
    res.status(200).json(grupo);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el grupo", error: error.message });
  }
};

export const actualizarGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    if (req.file) {
      datosActualizados.organigrama = req.file.path;
    }
    const [grupoActualizado] = await gruposService.actualizar(id, datosActualizados);
    if (grupoActualizado === 0) {
      return res
        .status(404)
        .json({ message: "Grupo no encontrado o sin cambios" });
    }
    res.status(200).json({ message: 'Grupo actualizado exitosamente' });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar el grupo", error: error.message });
  }
};

export const eliminarGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const [grupoEliminado] = await gruposService.eliminar(id);
    if (grupoEliminado === 0) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }
    res.status(204).json(); 
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar el grupo", error: error.message });
  }
};

export const obtenerEquipamientoDeGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const equipamiento = await gruposService.buscarEquipamiento(id);
    res.status(200).json(equipamiento);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener el equipamiento del grupo",
        error: error.message,
      });
  }
};
