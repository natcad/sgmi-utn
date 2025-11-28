import { FacultadRegional } from "./facultad.models.js"; // Asegúrate de importar tu modelo correctamente

export const obtenerTodasLasFacultades = async (req, res) => {
  try {
    const facultades = await FacultadRegional.findAll();
    res.json(facultades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener facultades" });
  }
};