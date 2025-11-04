# sgmi-utn
Sistema de Gestión de Memorias de Grupos y Centros de Investigación (SGMI) - UTN FRLP 2025
Este repositorio contiene la base del **SGMI (Sistema de Gestión de Memorias de Grupos y Centros de Investigación)** desarrollado en la **UTN FRLP**.  
El proyecto ya incluye la configuración para correr con **Docker Desktop** los tres servicios principales:

- 🗄️ **Base de datos (MySQL 8.0)**
- ⚙️ **Backend (Node.js + Express)**
- 💻 **Frontend (React + Next)**

---

## 🚀 Tecnologías
- **Docker + Docker Compose**
- **MySQL 8.0**
- **Node.js 18**
- **Express**
- **React + Next**

---

## 📂 Estructura del proyecto

```text
sgmi-utn/
├── backend/                     # API Node.js + Express
│   ├── src/
│   │   ├── config/              # Configuración DB y sequelize
│   │   ├── migrations/          # Migraciones con sequelize-cli
│   │   ├── seeders/             # Datos iniciales
│   │   ├── modules/             # Módulos de negocio
│   │   └── index.js             # Punto de entrada backend
│   ├── .env
│   ├── Dockerfile.prod
│   ├── .sequelizerc
│   └── package.json
│
├── frontend/                    # Next.js (App Router)
│   ├── public/                  # Archivos estáticos
│   ├── src/
│   │   ├── app/                 # Rutas (Next.js 13+)
│   │   ├── components/          # Componentes reutilizables
│   │   ├── services/            # Axios / API calls
│   │   └── styles/
│   ├── .env.local
│   ├── Dockerfile.prod
│   ├── next.config.js           # Configuración de Next.js
│   ├── tsconfig.json            # Configuracion TypeScript
│   └── package.json
│
├── docker-compose.yml           # Orquestador de contenedores
└── README.md  
```

## 🐳 Cómo levantar el proyecto con Docker 

1. Clonar el repositorio:

```bash
git clone https://github.com/natcad/sgmi-utn.git
cd sgmi-utn
```

2. Crear el archivo .env en /backend/.env con el siguiente contenido:
```text
# Servidor
PORT=4000
NODE_ENV=development

# Base de datos MySQL (usa el servicio "mysql" de docker-compose)
DB_HOST=mysql
DB_PORT=3306
DB_NAME=sgmi_db
DB_USER=sgmi_user
DB_PASSWORD=sgmi_pass

# Clave secreta para JWT
JWT_SECRET= jMMWa95b+xKh/m+0bnF1kXXPPoUhaCZ4Mftw6NEcugoz4FAYkzhgXDoePBWOYMLAa30+kBGqIN3ycQ50GSbenQ==
JWT_REFRESH_SECRET=4qkoKs4Y5CnrNv6j098WOs1iELTyej5v4IRavMQV5Yzik+NVgpJEYnlLKYqVCv899ZUAn0MWPb7mFHRawOxmkQ==

# Configuración de correo SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=sgmi.utn@gmail.com
SMTP_PASS= vmqz zkav tctn psrt
SMTP_FROM=SGMI UTN <sgmi.utn@gmail.com>

#FRONTEND URL
FRONTEND_URL=http://localhost:3000
```
3. Crear el archivo .env.local en /frontend/.env.local con el siguiente contenido:
```text
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=SGMI
NEXT_PUBLIC_ENV=development
```
4. Levantar el entorno:
```bash
docker-compose up --build
```
El flag --build es necesario solo la primera vez o si cambias dependencias.

5. Acceder al sistema:

- Frontend: http://localhost:3000

- Backend (API): http://localhost:4000/api

- MySQL: http://localhost:3306

