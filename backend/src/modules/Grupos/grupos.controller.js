// En: backend/src/modules/Grupos/grupos.controller.js
// ¡CAMBIO CLAVE AQUÍ!
// Usamos "import *" para importar TODAS las funciones del servicio
import * as gruposService from "./grupos.services.js";
import {
  uploadRawFile,
  deleteRawFile,
  buildRawDownloadUrl
} from "../../services/cloudinary.service.js";

// No usamos 'module.exports', exportamos cada función
export const obtenerTodosLosGrupos = async (req, res) => {
  try {
    const grupos = await gruposService.buscarTodos();
    res.status(200).json(grupos);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los grupos", error: error.message });
  }
};

export const crearGrupo = async (req, res) => {
  try {
    const datosNuevoGrupo = { ...req.body };

   

    // Aseguramos que el campo se llame como en el modelo
    if (datosNuevoGrupo.idfacultadRegional) {
      datosNuevoGrupo.idFacultadRegional = datosNuevoGrupo.idfacultadRegional;
    }

     if (req.file) {
      const resultado = await uploadRawFile(
        req.file.buffer,
        "sgmi/organigramas"
      );
      if (resultado) {
        datosNuevoGrupo.organigramaUrl = resultado.url;
        datosNuevoGrupo.organigramaPublicId = resultado.publicId;
      }
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
      return res.status(404).json({ message: "Grupo no encontrado" });
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
    const datosActualizados = {...req.body};
  
    const grupoExistente = await gruposService.buscarPorId(id);
    if (!grupoExistente) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }
     if (req.file) {
      const resultado = await uploadRawFile(
        req.file.buffer,
        "sgmi/organigramas"
      );

      if (resultado) {
        // Borramos el anterior si existía
        if (grupoExistente.organigramaPublicId) {
          await deleteRawFile(grupoExistente.organigramaPublicId);
        }

        datosActualizados.organigramaUrl = resultado.url;
        datosActualizados.organigramaPublicId = resultado.publicId;
      }
    }


    await gruposService.actualizar(id, datosActualizados);
    res.status(200).json({ message: "Grupo actualizado exitosamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar el grupo", error: error.message });
  }
};

export const eliminarGrupo = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ CORRECCIÓN: Recibir el resultado como una variable simple
    const filasEliminadas = await gruposService.eliminar(id);

    if (filasEliminadas === 0) {
      // Si el número de filas eliminadas es 0, el grupo no existía.
      return res.status(404).json({ message: "Grupo no encontrado" });
    }
 if (grupo.organigramaPublicId) {
      await deleteRawFile(grupo.organigramaPublicId);
    }
    // Si filasEliminadas es 1 (o más), la eliminación fue exitosa.
    // Usamos res.send() en lugar de res.json() para 204, ya que no lleva cuerpo.
    res.status(204).send();
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
    res.status(500).json({
      message: "Error al obtener el equipamiento del grupo",
      error: error.message,
    });
  }
};

export const descargarOrganigrama = async (req, res) => {
  try {
    const { id } = req.params;
    const grupo = await gruposService.buscarPorId(id);

    if (!grupo || !grupo.organigramaUrl) {
      return res
        .status(404)
        .json({ message: "No hay organigrama para este grupo." });
    }
    const nombreLimpio = (grupo.nombre || "organigrama")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    const urlDescarga = buildRawDownloadUrl(
      grupo.organigramaPublicId,
      `organigrama-${nombreLimpio}.pdf`
    );

    return res.redirect(urlDescarga);
  } catch (error) {
    console.error("Error al obtener organigrama:", error);
    res.status(500).json({
      message: "Error al obtener el organigrama",
      error: error.message,
    });
  }
};
