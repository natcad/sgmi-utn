import { Usuario } from "../../Usuarios/models/Usuario";
import { Personal } from "./Personal";
import { Investigador } from "./Investigador";
import { EnFormacion } from "./EnFormacion";
import GrupoInvestigacion from "../../Grupos/grupos.models.cjs";
import { ProgramaIncetivo } from "./ProgramaIncentivo";
import { FuenteFinanciamiento } from "./FuenteFinanciamiento";
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

  ProgramaIncetivo.hasOne(Investigador,{
    foreignKey: "idIncentivo",
    as: "investigador",
  })
  Investigador.belongsTo(ProgramaIncetivo,{
    foreignKey: "idIncentivo",
    as:"ProgramaIncetivo",
  })

   EnFormacion.hasMany(FuenteFinanciamiento,{
    foreignKey: "idFinanciamiento",
    as: "fuentesDeFinanciamiento",
  })
  FuenteFinanciamiento.belongsTo(EnFormacion,{
    foreignKey: "enFormacionId",
    as:"enFormacionId",
  })
};
