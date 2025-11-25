//AuthRepository.js
import db from "../../../models/db.js";
const { Usuario } = db.models;
export const AuthRepository = {
    findByEmail: async (email) => {
        return await Usuario.unscoped().findOne({ where: { email } });
    },
    findById: async (id) => {
        return await Usuario.findByPk(id);
    },
    createUser: async (data) => {
        return await Usuario.create(data);
    },
    activateUser: async (email) => {
        return await Usuario.update({ activo: true }, { where: { email }});
    },
    updatePassword: async (email, hashedPassword) => {
        return await Usuario.update({ password: hashedPassword }, { where: { email }});
    },

};