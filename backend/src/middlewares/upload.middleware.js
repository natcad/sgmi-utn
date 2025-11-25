// En: backend/src/middlewares/upload.middleware.js

import multer from 'multer';
import path from 'path';

// 1. Dónde queremos guardar los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Los guardaremos en una carpeta 'uploads/' en la raíz del backend
    cb(null, 'uploads/');
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