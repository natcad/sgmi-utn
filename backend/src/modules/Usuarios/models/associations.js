import { Usuario
 } from "./Usuario.js";
 import { PerfilUsuario } from "./PerfilUsuario.js";

//Definir asociaciones
export const defineAssociations = () => {
Usuario.hasOne(PerfilUsuario, {
  foreignKey: "usuarioId",
    as: "perfil",   
    onDelete: "CASCADE",
});
PerfilUsuario.belongsTo(Usuario, {
  foreignKey: "usuarioId",
    as: "usuario",
});
};
