# Spidey Tracker

Aplicación web georreferenciada para registrar avistamientos de Spider-Man, crímenes, villanos y zonas de riesgo sobre un mapa.

- **Frontend:** Vue 3 + Vite, Pinia, Vue Router, Leaflet + Leaflet-Geoman (`frontend/`)
- **Backend:** Node.js + Express, Mongoose, JWT, bcrypt (`backend/`)
- **Base de datos:** MongoDB Atlas (GeoJSON `Point` y `Polygon` con índice `2dsphere`)

## Requisitos

- Node.js 22.18+ o 24.12+
- Una base de datos MongoDB (Atlas o local)

## Ejecutar localmente

### 1. Backend

```sh
cd backend
npm install
cp .env.example .env   # llenar con tus valores
npm run seed           # borra y carga datos de prueba
npm run dev            # http://localhost:3000
```

Variables de `backend/.env`:

| Variable | Descripción |
|---|---|
| `MONGODB_URI` | Cadena de conexión de MongoDB |
| `JWT_SECRET` | Secreto para firmar los tokens |
| `JWT_EXPIRES_IN` | Duración del token (opcional, por defecto `1d`) |
| `FRONTEND_ORIGINS` | Orígenes permitidos por CORS separados por coma (vacío = todos) |
| `PORT` | Puerto del servidor (opcional, por defecto `3000`) |
| `SEED_USER_PASSWORD` | Contraseña de `tester@spideytracker.com` creada por el seed |
| `SEED_ADMIN_PASSWORD` | Contraseña de `admin@spideytracker.com` creada por el seed |

### 2. Frontend

```sh
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:3000/api
npm run dev            # http://localhost:5173
```

## Estructura del backend

```
backend/src/
├── config/        conexión a MongoDB
├── models/        esquemas de Mongoose
├── routes/        reciben la petición y llaman al servicio
├── services/      lógica y operaciones con MongoDB (uno por entidad)
├── middlewares/   validaciones, autenticación y manejo de errores
├── utils/         AppError, tokens, constantes
└── data/          seed
```

## Despliegue

- **Backend:** Render, Root Directory `backend`, start `npm start`, mismas variables del `.env`.
- **Frontend:** Vercel, Root Directory `frontend`, variable `VITE_API_URL=https://<backend>/api`.
- **Base de datos:** MongoDB Atlas.
