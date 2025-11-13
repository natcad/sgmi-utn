

// Importamos los modelos de la base de datos
const { GrupoInvestigacion, FacultadRegional, Personal, Equipamiento } = require('../../models');

// --- Servicio para OBTENER TODOS los grupos ---
const buscarTodos = async () => {
  // Se buscan todos los 'GrupoInvestigacion'
  const grupos = await GrupoInvestigacion.findAll({
    //Trae los datos relacionados.
    include: [
      {
        model: FacultadRegional, // Trae la info de la facultad
        as: 'facultadRegional',
        attributes: ['nombre'],
      },
      {
        model: Personal, // Trae la info del director
        as: 'director',
        attributes: ['nombre', 'apellido'],
      }
    ]
  });
  return grupos;
};

// --- Servicio para CREAR un grupo ---
const crear = async (datosNuevoGrupo) => {
  const nuevoGrupo = await GrupoInvestigacion.create(datosNuevoGrupo);
  return nuevoGrupo;
};

// --- Servicio para OBTENER UN grupo por ID ---
const buscarPorId = async (id) => {
  // 'findByPk' es "Find by Primary Key"
  const grupo = await GrupoInvestigacion.findByPk(id, {
    include: [
      { model: FacultadRegional, as: 'facultadRegional' },
      { model: Personal, as: 'director' },
      { model: Personal, as: 'vicedirector' },
    ]
  });
  return grupo; // Devuelve el grupo encontrado o 'null'
};

// --- Servicio para ACTUALIZAR un grupo ---
const actualizar = async (id, datosActualizados) => {
  // 'update' actualiza la fila que coincida con el 'where'
  const [filasActualizadas] = await GrupoInvestigacion.update(datosActualizados, {
    where: { oid: id }
  });
  // 'update' devuelve un array con el número de filas afectadas
  return [filasActualizadas];
};

// --- Servicio para ELIMINAR un grupo ---
const eliminar = async (id) => {
  // 'destroy' elimina la fila
  const [filasEliminadas] = await GrupoInvestigacion.destroy({
    where: { oid: id }
  });
  return [filasEliminadas];
};

// --- Servicio para OBTENER EQUIPAMIENTO de un grupo ---
const buscarEquipamiento = async (id) => {
  // Buscamos el equipamiento que tenga el 'GrupoInvestigacion_oid' correcto
  const equipamiento = await Equipamiento.findAll({
    where: { GrupoInvestigacion_oid: id }
  });
  return equipamiento;
};


// --- Exportamos todas las funciones ---
module.exports = {
  buscarTodos,
  crear,
  buscarPorId,
  actualizar,
  eliminar,
  buscarEquipamiento,
};