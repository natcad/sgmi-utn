// En: backend/src/modules/Grupos/grupos.controller.js
// ¡CAMBIO CLAVE AQUÍ!
// Usamos "import *" para importar TODAS las funciones del servicio
import * as gruposService from "./grupos.services.js";
import {
  uploadRawFile,
  deleteRawFile,
  buildRawDownloadUrl,
} from "../../services/cloudinary.service.js";
import axios from "axios";
import { ValidationError } from "sequelize";
import db from "../../models/db.js";
const { Personal,GrupoInvestigacion } = db.models;
const CAMPOS_PERMITIDOS = [
  "nombre",
  "siglas",
  "objetivo",
  "correo",
  "presupuesto",
  "idDirector",
  "idVicedirector",
  "idFacultadRegional",
  "idFuenteDeFinanciamiento",
];
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
    const { id: usuarioId, rol } = req.user;

    // Normalizar nombre del campo
    if (datosNuevoGrupo.idfacultadRegional) {
      datosNuevoGrupo.idFacultadRegional = datosNuevoGrupo.idfacultadRegional;
    }

    // Manejo de archivo (organigrama)
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

    // ❗ Validar que NO pertenezca ya a un grupo (si no es ADMIN)
    if (rol !== "admin"){
      const yaEsPersonal = await Personal.findOne({
        where: { usuarioId },
      });

      if (yaEsPersonal) {
        return res.status(403).json({
          message:
            "Ya perteneces a un grupo de investigación, no puedes crear otro grupo.",
        });
      }
    }

    // 1️⃣ Crear el grupo primero
    const nuevoGrupo = await gruposService.crear(datosNuevoGrupo);

    return res.status(201).json(nuevoGrupo);
  } catch (error) {
    console.error("Error al crear grupo:", error);

    // Error de validación
    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: "Error de validación al crear el grupo",
        errors: error.errors.map((e) => ({
          message: e.message,
          path: e.path,
          value: e.value,
          type: e.type,
        })),
      });
    }

    // Error general
    return res.status(500).json({
      message: "Error inesperado al crear el grupo",
      error: error.message,
    });
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

    const grupoExistente = await gruposService.buscarPorId(id);
    if (!grupoExistente) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }
    const datosActualizados = {};
    for (const campo of CAMPOS_PERMITIDOS) {
      if (Object.prototype.hasOwnProperty.call(req.body, campo)) {
        datosActualizados[campo] = req.body[campo];
      }
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
    if (Object.keys(datosActualizados).length === 0 && !req.file) {
      return res
        .status(400)
        .json({ message: "No se recibieron datos para actualizar" });
    }

    await gruposService.actualizar(id, datosActualizados);
    const grupoActualizado = await gruposService.buscarPorId(id);

    return res.status(200).json(grupoActualizado);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar el grupo", error: error.message });
  }
};

export const eliminarGrupo = async (req, res) => {
  try {
    const { id } = req.params;

    const grupo = await gruposService.buscarPorId(id);

    if (!grupo) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    if (grupo.organigramaPublicId) {
      await deleteRawFile(grupo.organigramaPublicId);
    }

    const filasEliminadas = await gruposService.eliminar(id);

    if (filasEliminadas === 0) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar el grupo:", error);
    return res.status(500).json({
      message: "Error al eliminar el grupo",
      error: error.message,
    });
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

export const validarCorreoGrupo = async (req, res) => {
  try {
    const { correo, idGrupo } = req.query;

    if (!correo) {
      return res.status(400).json({
        disponible: false,
        message: "El correo es requerido",
      });
    }

    const idGrupoNumber = idGrupo ? Number(idGrupo) : null;

    const existe = await gruposService.buscarPorCorreo(correo, idGrupoNumber);

    return res.status(200).json({
      disponible: !existe,
      message: existe
        ? "Ya existe un grupo con ese correo"
        : "Correo disponible",
    });
  } catch (error) {
    console.error("Error al validar correo de grupo:", error);
    return res.status(500).json({
      disponible: false,
      message: "Error al validar el correo",
      error: error.message,
    });
  }
};

export const descargarOrganigrama = async (req, res) => {
  try {
    const { id } = req.params;
    const grupo = await gruposService.buscarPorId(id);

    if (!grupo || !grupo.organigramaPublicId) {
      return res
        .status(404)
        .json({ message: "No hay organigrama para este grupo." });
    }

    const nombreLimpio = (grupo.nombre || "organigrama")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    const fileName = `organigrama-${nombreLimpio}.pdf`;

    const urlDescarga = buildRawDownloadUrl(grupo.organigramaPublicId);

    const cloudinaryResponse = await axios.get(urlDescarga, {
      responseType: "stream",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    cloudinaryResponse.data.pipe(res);
  } catch (error) {
    console.error("Error al obtener organigrama:", error);
    res.status(500).json({
      message: "Error al obtener el organigrama",
      error: error.message,
    });
  }
};
export const getMiGrupo = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    console.log("1. ID del Token:", usuarioId);

    const personal = await Personal.findOne({
      where: { usuarioId },
      include: [
        {
          model: GrupoInvestigacion,
          as: "grupo", 
        },
      ],
    });
    

    if (!personal) {
        console.log("-> Fallo: No se encontró registro en tabla Personal");
        return res.status(404).json({ message: "No existe un registro en Personal..." });
    }

    if (!personal.grupo) {
         console.log("-> Fallo: Se encontró Personal, pero la relación 'grupo' es null");
         return res.status(404).json({ message: "Existe el Personal pero NO tiene grupo asignado." });
    }
    
    const grupo = await gruposService.buscarPorId(personal.grupo.id);

    return res.json(grupo);

  } catch (error) {
    return res.status(500).json({ message: "Error interno al obtener el grupo" });
  }
};

