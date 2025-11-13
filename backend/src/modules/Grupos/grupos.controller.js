
// Importae el servicio
const gruposService = require('./grupos.service');

// --- Controlador para obtener todos los grupos ---
const obtenerTodosLosGrupos = async (req, res) => {
  try {
    //Llama al servicio para buscar los grupos
    const grupos = await gruposService.buscarTodos();
    
    // Responde al cliente con los grupos encontrados
    res.status(200).json(grupos);
  } catch (error) {
    // En caso de error
    res.status(500).json({ message: 'Error al obtener los grupos', error: error.message });
  }
};

// --- Controlador para CREAR un grupo ---
const crearGrupo = async (req, res) => {
  try {

    const datosNuevoGrupo = req.body;

    //si Multer subió un archivo, lo agrega a 'req.file' Guardamos la RUTA (path) del archivo en nuestro objeto.
    if (req.file) {
      datosNuevoGrupo.organigrama = req.file.path;
    }
    
    //Llama al servicio (el servicio no se entera de nada, solo recibe un string con la ruta)
    const nuevoGrupo = await gruposService.crear(datosNuevoGrupo);

    res.status(201).json(nuevoGrupo);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el grupo', error: error.message });
  }
};

// --- Controlador para OBTENER UN grupo por ID ---
const obtenerGrupoPorId = async (req, res) => {
  try {
    //Obtiene el ID de los parámetros de la URL
    const { id } = req.params;

    //Llama al servicio para buscar ese grupo
    const grupo = await gruposService.buscarPorId(id);

    //Verifica si el grupo existe
    if (!grupo) {
      return res.status(404).json({ message: 'Grupo no encontrado' }); // 404 = "Not Found"
    }

    //Responde con el grupo encontrado
    res.status(200).json(grupo);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el grupo', error: error.message });
  }
};

// --- Controlador para ACTUALIZAR un grupo ---
const actualizarGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Si el usuario sube un NUEVO archivo al editar, actualizamos la ruta.
    if (req.file) {
      datosActualizados.organigrama = req.file.path;
    }
    //Llama al servicio para actualizar
    const [grupoActualizado] = await gruposService.actualizar(id, datosActualizados);

    if (grupoActualizado === 0) {
      return res.status(404).json({ message: 'Grupo no encontrado o sin cambios' });
    }

    //Responde con un mensaje de éxito
    res.status(200).json({ message: 'Grupo actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el grupo', error: error.message });
  }
};

// --- Controlador para ELIMINAR un grupo ---
const eliminarGrupo = async (req, res) => {
  try {
    const { id } = req.params;

    //Llama al servicio para eliminar
    const [grupoEliminado] = await gruposService.eliminar(id);

    if (grupoEliminado === 0) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }

    //Responde con un mensaje de éxito (204 = "No Content")
    res.status(204).json(); 
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el grupo', error: error.message });
  }
};

// --- Controlador para OBTENER EQUIPAMIENTO de un grupo ---
const obtenerEquipamientoDeGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    
    //Llama al servicio para buscar el equipamiento
    const equipamiento = await gruposService.buscarEquipamiento(id);

    res.status(200).json(equipamiento);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el equipamiento del grupo', error: error.message });
  }
};


// --- Exportamos todas las funciones ---
module.exports = {
  obtenerTodosLosGrupos,
  crearGrupo,
  obtenerGrupoPorId,
  actualizarGrupo,
  eliminarGrupo,
  obtenerEquipamientoDeGrupo,
};