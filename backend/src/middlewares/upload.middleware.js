
const multer = require('multer');
const path = require('path');

//Dónde queremos guardar los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Los guardaremos en una carpeta 'uploads/' en la raíz del backend
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    //Para evitar nombres duplicados, le ponemos un nombre único (Ej: 167888659559-organigrama.pdf)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

//se crea la instancia de Multer
const upload = multer({ storage: storage });

module.exports = upload;