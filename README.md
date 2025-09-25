# sgmi-utn
Sistema de Gestión de Memorias de Grupos y Centros de Investigación (SGMI) - UTN FRLP 2025
Este repositorio contiene la base del **SGMI (Sistema de Gestión de Memorias de Grupos y Centros de Investigación)** desarrollado en la **UTN FRLP**.  
El proyecto ya incluye la configuración para correr con **Docker Desktop** los tres servicios principales:

- 🗄️ **Base de datos (MySQL 8.0)**
- ⚙️ **Backend (Node.js + Express)**
- 💻 **Frontend (React + Vite)**

---

## 🚀 Tecnologías
- **Docker + Docker Compose**
- **MySQL 8.0**
- **Node.js 18**
- **Express**
- **React + Vite**

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
``
PORT=4000
NODE_ENV=development
DB_HOST=mysql
DB_PORT=3306
DB_NAME=sgmi_db
DB_USER=sgmi_user
DB_PASSWORD=sgmi_pass
``
3. Crear el archivo .env.local en /frontend/.env.local con el siguiente contenido:
``
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=SGMI
NEXT_PUBLIC_ENV=development
``
4. Levantar el entorno:
```bash
docker-compose up --build
```
El flag --build es necesario solo la primera vez o si cambias dependencias.

5. Acceder al sistema:

- Frontend: http://localhost:3000

- Backend (API): http://localhost:4000/api

- MySQL: puerto 3306

