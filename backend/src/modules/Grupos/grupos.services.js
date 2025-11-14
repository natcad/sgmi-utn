// En: backend/src/modules/Grupos/grupos.service.js

// ¡CAMBIO CLAVE!
// Importamos 'db' desde 'index.js' (el archivo que SÍ existe)
// y lo importamos de una forma especial que maneja la sintaxis "antigua"
import db from '../../models/index.cjs'; 

// Extraemos los modelos que necesitamos del objeto 'db'
const { GrupoInvestigacion, FacultadRegional, Personal, Equipamiento } = db;

// --- Exportamos cada función ---

export const buscarTodos = async () => {
  const grupos = await GrupoInvestigacion.findAll({
    include: [
      {
        model: FacultadRegional,
        as: 'faculRegional', // Asegúrate que este 'as' coincida con tu modelo
        attributes: ['nombre'],
      },
      {
        model: Personal,
        as: 'director',
        attributes: ['nombre', 'apellido'],
      }
    ]
  });
  return grupos;
};

export const crear = async (datosNuevoGrupo) => {
  const nuevoGrupo = await GrupoInvestigacion.create(datosNuevoGrupo);
  return nuevoGrupo;
};

export const buscarPorId = async (id) => {
  const grupo = await GrupoInvestigacion.findByPk(id, {
    include: [
      { model: FacultadRegional, as: 'faculRegional' },
      { model: Personal, as: 'director' },
      { model: Personal, as: 'vicedirector' },
    ]
  });
  return grupo;
};

export const actualizar = async (id, datosActualizados) => {
  const [filasActualizadas] = await GrupoInvestigacion.update(datosActualizados, {
    where: { oid: id }
  });
  return [filasActualizadas];
};

export const eliminar = async (id) => {
  const [filasEliminadas] = await GrupoInvestigacion.destroy({
    where: { oid: id }
  });
  return [filasEliminadas];
};

export const buscarEquipamiento = async (id) => {
  const equipamiento = await Equipamiento.findAll({
    where: { GrupoInvestigacion_oid: id }
  });
  return equipamiento;
};