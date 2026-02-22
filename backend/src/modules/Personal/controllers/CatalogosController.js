import { CatalogosService } from "../services/CatalogosService.js";

export const CatalogosController = {
  async getCatalogos(req, res) {
    try {
      const catalogos = await CatalogosService.getCatalogos();
      return res.json(catalogos);
    } catch (error) {
      console.error("Error al obtener catálogos:", error);
      return res.status(500).json({
        message: "Error al obtener catálogos",
        error: error.message,
      });
    }
  },
};
