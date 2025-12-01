import db from "../../models/db.js";
import { Op } from "sequelize";
// 👇 CORRECCIÓN IMPORTANTE: Agregamos ".models"
const {
  GrupoInvestigacion,
  FacultadRegional,
  Personal,
  Usuario,
  EnFormacion,
  Investigador,
  FuenteFinanciamiento,
} = db.models;

export const buscarTodos = async () => {
  console.log("🚀 Buscando grupos...");

  // Verificación de seguridad
  if (!GrupoInvestigacion) {
    throw new Error(
      "CRÍTICO: El modelo GrupoInvestigacion es undefined. Revisa db.models"
    );
  }

  try {
    const grupos = await GrupoInvestigacion.findAll({
      attributes: [
        "id", // 1. Siempre incluir el ID
        "nombre",
        "siglas",
        "correo",
        "idFacultadRegional", // Si este campo vincula a FacultadRegional
        "organigramaUrl",
        "organigramaPublicId",
        // 'directorId',             // Si este campo vincula al Director
        // 'vicedirectorId'
        // Si este campo vincula al Vicedirector
        // Si hay más relaciones (ej: Integrantes, Equipamiento), revisa si el grupo guarda la FK
      ],
      include: [
        {
          model: FacultadRegional,
          as: "faculRegional",
          attributes: ["nombre"],
        },
        {
          model: Personal,
          as: "director",
          // No pedimos atributos de Personal, sino que saltamos a Usuario
          include: [
            {
              model: Usuario,
              as: "Usuario", // Asegúrate que en tu modelo Personal tengas: Personal.belongsTo(Usuario, { as: 'usuario' })
              attributes: ["nombre", "apellido"],
            },
          ],
        },
        {
          model: FuenteFinanciamiento,
          as: "fuenteFinanciamiento",
          required: false,
        },
      ],
    });
    return grupos;
  } catch (error) {
    console.error("❌ Error en Sequelize:", error); // Esto imprimirá el error real en la terminal negra
    throw error;
  }
};

export const crear = async (datosNuevoGrupo) => {
  return await GrupoInvestigacion.create(datosNuevoGrupo);
};

export const buscarPorId = async (id) => {
  return await GrupoInvestigacion.findByPk(id, {
    include: [
      { model: FacultadRegional, as: "faculRegional" },
      {
        model: Personal,
        as: "director",
        include: [
          {
            model: Usuario,
            attributes: ["nombre", "apellido", "email"],
            as: "Usuario",
          },
        ],
      },
      {
        model: Personal,
        as: "vicedirector",
        include: [
          {
            model: Usuario,
            attributes: ["nombre", "apellido", "email"],
            as: "Usuario",
          },
        ],
      },
      {
        model: Personal,
        as: "personal",
        include: [
          {
            model: Usuario,
            attributes: ["nombre", "apellido", "email"],
            as: "Usuario",
          },
          {
            model: Investigador,
            as: "Investigador",
            required: false,
          },
          {
            model: EnFormacion,
            as: "EnFormacion",
            required: false,
            include: [],
          },
        ],
      },
      {
        model: FuenteFinanciamiento,
        as: "fuenteFinanciamiento",
        required: false,
      },
    ],
  });
};

export const actualizar = async (id, datosActualizados) => {
  const [filasActualizadas] = await GrupoInvestigacion.update(
    datosActualizados,
    {
      where: { id: id },
    }
  );
  return [filasActualizadas];
};

export const eliminar = async (id) => {
  const filasEliminadas = await GrupoInvestigacion.destroy({
    where: { id: id },
  });
  return filasEliminadas;
};

export const buscarEquipamiento = async (id) => {
  if (!Equipamiento) return [];
  return await Equipamiento.findAll({
    where: { GrupoInvestigacionId: id },
  });
};

export const buscarPorCorreo = async (correo, idGrupoExcluir = null) => {
  const where = { correo };

  if (idGrupoExcluir) {
    where.id = { [Op.ne]: idGrupoExcluir };
  }

  return await GrupoInvestigacion.findOne({ where });
};
