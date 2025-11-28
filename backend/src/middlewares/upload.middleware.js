// En: backend/src/middlewares/upload.middleware.js

import multer from "multer";

// 1. Usamos memoria en lugar de disco
const storage = multer.memoryStorage();

// 2. Creamos la instancia de Multer
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // opcional: límite 10 MB
  },
});

// 3. Exportamos como default 
export default upload;
