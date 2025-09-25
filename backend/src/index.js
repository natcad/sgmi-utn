import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/database.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SGMI API funcionando 🚀");
});

sequelize.authenticate()
  .then(() => console.log("✅ Conexión a la base de datos OK"))
  .catch((err) => console.error("❌ Error DB:", err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
