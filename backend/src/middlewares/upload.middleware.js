// En: backend/src/middlewares/upload.middleware.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener el directorio actual en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta absoluta a la carpeta uploads
const uploadsDir = path.join(__dirname, '../../uploads');

// Crear la carpeta uploads si no existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 1. Dónde queremos guardar los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Los guardaremos en una carpeta 'uploads/' en la raíz del backend
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // 2. Para evitar nombres duplicados, le ponemos un nombre único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// 3. Creamos la instancia de Multer
const upload = multer({ storage: storage });

// 4. Exportamos como 'default' para que la ruta pueda importarlo
export default upload;