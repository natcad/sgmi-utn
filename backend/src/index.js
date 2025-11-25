import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import express from "express";

import cors from "cors";

// Cargamos el loader centralizado de modelos
import db from "./models/db.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import usuarioRoutes from "./modules/Usuarios/routes/usuario.routes.js";
import personalRoutes from "./modules/Personal/routes/personal.routes.js";
import investigadorRoutes from "./modules/Personal/routes/investigador.routes.js";
import enFormacionRoutes from "./modules/Personal/routes/enFormacion.routes.js";
import fuenteFinanciamientoRoutes from "./modules/Personal/routes/fuenteFinanciamiento.routes.js";
import programaIncentivoRoutes from "./modules/Personal/routes/programaIncentivo.routes.js";
import gruposRouter from "./modules/Grupos/grupos.routes.js";

//
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true, // necesario para enviar cookies
  })
);
app.use(express.json());
app.use(cookieParser());
//ruta modulo auntenticación
app.use("/api/auth", authRoutes);
//ruta modulo usuarios
app.use("/api/usuarios", usuarioRoutes);
//modulo personal
app.use("/api/personal",personalRoutes);
app.use("/api/investigador",investigadorRoutes);
app.use("/api/enFormacion",enFormacionRoutes);
app.use("/api/fuenteFinanciamiento", fuenteFinanciamientoRoutes);
app.use("/api/programaIncentivo",programaIncentivoRoutes);

app.use("/api/grupos",gruposRouter);


app.get("/", (req, res) => {
  res.send("SGMI API funcionando 🚀");
});

app.use('/api/grupos', gruposRouter);


//conexión a la base de datos
db.sequelize
  .authenticate()
  .then(() => console.log("✅ Conexión a la base de datos OK"))
  .catch((err) => console.error("❌ Error DB:", err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
