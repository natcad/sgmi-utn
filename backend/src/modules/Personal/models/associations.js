import { Usuario } from "../../Usuarios/models/Usuario.js";
import { Personal } from "./Personal.js";
import { Investigador } from "./Investigador.js";
import { EnFormacion } from "./EnFormacion.js";
import { ProgramaIncentivo } from "./ProgramaIncentivo.js";
import { FuenteFinanciamiento } from "./FuenteFinanciamiento.js";
import sequelize from "../../../config/database.js";

import getGrupoInvestigacion from "../../Grupos/grupos.models.cjs";
const GrupoInvestigacion = getGrupoInvestigacion(sequelize);

export const applyPersonalAssociations = () => {
  Usuario.hasOne(Personal, { foreignKey: "usuarioId", onDelete: "CASCADE" });
  Personal.belongsTo(Usuario, { foreignKey: "usuarioId" });

  Personal.hasOne(Investigador, {
    foreignKey: "personalId",
    onDelete: "CASCADE",
  });
  Investigador.belongsTo(Personal, {
    foreignKey: "personalId",
  });

  Personal.hasOne(EnFormacion, {
    foreignKey: "personalId",
    onDelete: "CASCADE",
  });
  EnFormacion.belongsTo(Personal, {
    foreignKey: "personalId",
  });

  Personal.belongsTo(GrupoInvestigacion,{
    as:"grupo",
    foreignKey: "grupoId",
  })

  ProgramaIncentivo.hasOne(Investigador,{
    foreignKey: "idIncentivo",
    as: "investigador",
  })
  Investigador.belongsTo(ProgramaIncentivo,{
    foreignKey: "idIncentivo",
    as:"ProgramaIncentivo",
  })

   EnFormacion.hasMany(FuenteFinanciamiento,{
    foreignKey: "idFinanciamiento",
    as: "fuentesDeFinanciamiento",
  })
  FuenteFinanciamiento.belongsTo(EnFormacion,{
    foreignKey: "enFormacionId",
    as:"enFormacion",
  })
};
