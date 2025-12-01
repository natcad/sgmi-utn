// Middleware universal de subida a memoria para SGMI
import multer from "multer";

// Guardar archivos SOLO en memoria (ideal Cloudinary/S3)
const storage = multer.memoryStorage();

// Limitar tamaño por seguridad
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

export default upload;
