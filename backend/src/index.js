import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import sequelize from "./config/database.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import usuarioRoutes from "./modules/Usuarios/routes/usuario.routes.js";
import { defineAssociations } from "./modules/Usuarios/models/associations.js";
import gruposRouter from './modules/Grupos/grupos.routes.js';

//importacion de modelos
import "./modules/Usuarios/models/Usuario.js";
import "./modules/Usuarios/models/PerfilUsuario.js";

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true, // necesario para enviar cookies
  })
);
app.use(express.json());

//ruta modulo auntenticación
app.use("/api/auth", authRoutes);
//ruta modulo usuarios
app.use("/api/usuarios", usuarioRoutes);

app.get("/", (req, res) => {
  res.send("SGMI API funcionando 🚀");
});

app.use('/api/grupos', gruposRouter);

defineAssociations();

//conexión a la base de datos
sequelize
  .authenticate()
  .then(() => console.log("✅ Conexión a la base de datos OK"))
  .catch((err) => console.error("❌ Error DB:", err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
