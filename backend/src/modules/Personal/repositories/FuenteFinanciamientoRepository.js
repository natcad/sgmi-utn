import db from "../../../models/db.js"; // adaptá ruta si estás más profundo
const {
  Personal,
  Usuario,
  EnFormacion,
  GrupoInvestigacion,
  FuenteFinanciamiento,
} = db.models;

export const FuenteFinanciamientoRepository = {
  async findAll(filters = {}) {
    const where = {};
    if (filters.enFormacionId) {
      where.enFormacionId = filters.enFormacionId;
    }
    if (filters.organismo) {
      where.organismo = filters.organismo;
    }

    return await FuenteFinanciamiento.findAll({
      where: where,
      include: [
        {
          model: EnFormacion,
          as: "Personal",
          include: [
            {
              model: Personal,
              as: "EnFormacion",

              include: [
                {
                  model: Usuario,
                  as: "Usuario",
                  attributes: ["nombre", "apellido", "email"],
                },
                { model: GrupoInvestigacion, as: "grupo" },
              ],
            },
          ],
        },
      ],
    });
  },
  async findById(id) {
    return await FuenteFinanciamiento.findByPk(id, {
      include: [
        {
          model: EnFormacion,
          as: "EnFormacion",
          include: [
            {
              model: Personal,
              as: "Personal",
              include: [
                {
                  model: Usuario,
                  as: "Usuario",
                  attributes: ["nombre", "apellido", "email"],
                },
                { model: GrupoInvestigacion, as: "grupo" },
              ],
            },
          ],
        },
      ],
    });
  },
  async create(data) {
    return await FuenteFinanciamiento.create(data);
  },
  async update(id, updates) {
    const fuente = await FuenteFinanciamiento.findByPk(id);
    if (!fuente) throw new Error("Fuente de financiamiento no encontrado");
    return await fuente.update(updates);
  },
  async delete(id) {
    const fuente = await FuenteFinanciamiento.findByPk(id);
    if (!fuente) throw new Error("Fuente de financiamiento no encontrado");
    return await fuente.destroy();
  },
};
