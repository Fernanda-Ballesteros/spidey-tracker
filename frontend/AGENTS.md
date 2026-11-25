# AGENTS.md — SpyderTracker (Frontend)

## Qué es
App web para rastrear villanos, crímenes y avistamientos de Spider-Man en un mapa.
Proyecto final de Sistemas Georeferenciados. La ubicación geográfica es parte
central de la solución. Este repo es SOLO el frontend; el backend está en otro repo.

## Stack (no cambiar)
- Vue 3 + Vite, JavaScript (sin TypeScript), Composition API con `<script setup>`
- Vue Router (instalar si falta) y Pinia (instalar si falta)
- axios para HTTP
- Leaflet para el mapa; leaflet-geoman (@geoman-io/leaflet-geoman-free) para dibujar zonas
- Sin librerías de UI pesadas salvo que se indique. CSS propio o el que defina el diseño.

## Reglas de trabajo
- Haz SOLO lo que se pide en cada prompt. No agregues funciones, vistas ni librerías extra.
- No modifiques el backend ni asumas endpoints que no estén listados abajo.
- Todo el equipo debe poder explicar cada línea: código claro, comentarios breves en español,
  nombres descriptivos, sin trucos ni abstracciones innecesarias.
- Textos de la interfaz en español.
- Cada petición que falle debe mostrar un mensaje visible (usar `error.message` y `error.details`).
- Cada acción exitosa (crear, editar, borrar, login) debe mostrar un mensaje de éxito visible.
- La carpeta `backend/` es SOLO LECTURA: sirve de referencia para saber qué espera la API.
  Nunca la edites, ni crees archivos dentro de ella. Todo el código nuevo va en `spidey-tracker-front/`.
- Nunca leas, muestres ni copies el contenido de `backend/.env` (tiene credenciales reales).
- Si el front necesita algo que el back no ofrece, avisa en lugar de inventar un endpoint.

## Variables de entorno
`.env` (no se sube) y `.env.example` (sí se sube):
```
VITE_API_URL=http://localhost:3000/api
```
Se lee con `import.meta.env.VITE_API_URL`.

## Estructura sugerida
```
src/
  api/          # axios.js (instancia + interceptores) y un archivo por entidad
  stores/       # Pinia: auth.js, y los que hagan falta
  router/       # index.js con guard de autenticación
  views/        # LoginView, MapView, VillainsView, CrimesView, SightingsView
  components/   # componentes reutilizables (tabla, modal, alertas, popup, filtros)
  utils/        # helpers (conversión de coordenadas, formato de fechas)
```

## Vistas requeridas (rúbrica)
1. Login / Registro (misma pantalla, alternar entre ambos). Sin sesión NO se entra al resto.
2. Principal: mapa + tabla de ubicaciones + búsqueda y filtros.
3. Villanos, Crímenes y Avistamientos: CRUD completo cada uno (crear, listar, editar, eliminar).
Navegación clara entre vistas, diseño coherente, alertas de éxito y error.

## Autenticación
- `POST /api/auth/login` y `POST /api/auth/register` responden `{ user, token }`.
- Guardar el token (localStorage) y mandarlo en TODAS las demás peticiones:
  `Authorization: Bearer <token>`.
- `GET /api/auth/me` devuelve `{ user }` (sirve para validar la sesión al recargar).
- Interceptor de axios: si responde 401 -> borrar sesión y redirigir a /login.
- Guard del router: rutas internas con `meta: { requiresAuth: true }`.
- Validaciones del back: nombre 2-60 caracteres; contraseña 8-72 con al menos una letra y un número;
  correo válido. Registro con correo repetido -> 409. Login incorrecto -> 401.
- Usuario: `{ id, name, email, role, createdAt, updatedAt }` (role: user | admin).

## Formato de errores del back
```json
{ "error": { "status": 400, "message": "...", "details": ["..."] | null, "path": "...", "timestamp": "..." } }
```
Leer `err.response.data.error`. Códigos usados: 400 validación, 401 sin sesión, 403 CORS/permisos,
404 no existe, 409 conflicto (duplicado o regla de negocio), 500 error interno.

## REGLA CRÍTICA DE COORDENADAS
- GeoJSON y el backend usan `[longitud, latitud]`.
- Leaflet usa `[latitud, longitud]`.
- Al ENVIAR una ubicación (POST/PATCH) se mandan campos sueltos `latitude` y `longitude` (números).
- Al RECIBIR, la ubicación trae `point: { type: "Point", coordinates: [lng, lat] }`.
  Para Leaflet: `[point.coordinates[1], point.coordinates[0]]`.
- Crear un helper único en `utils/` para convertir y usarlo en todos lados.
- Zonas: el polígono se envía como GeoJSON `area: { type: "Polygon", coordinates: [[[lng,lat], ...]] }`,
  el primer punto repetido al final (anillo cerrado). `layer.toGeoJSON().geometry` de Leaflet ya
  entrega ese formato.

## Endpoints (base: VITE_API_URL, todos requieren Bearer salvo auth)

### Ubicaciones `/locations`
- `GET /locations?search=&category=&zone=` -> arreglo. `search` = nombre parcial sin importar
  mayúsculas; `category` = `all` o una categoría; `zone` = `all` o id de zona (filtra geográficamente).
  El filtrado se hace en el backend: el mapa y la tabla deben reflejar el mismo resultado.
- `GET /locations/geojson?...` mismos filtros, devuelve FeatureCollection
  (`properties` = datos sin `point`, `geometry` = el Point).
- `GET /locations/:id` -> detalle + `zones` (zonas donde cae: `{id,name,riskLevel}`).
- `POST /locations` body `{ name, description, category, latitude, longitude }` (todos obligatorios) -> 201.
- `PATCH /locations/:id` mismos campos, parcial (al menos uno).
- `DELETE /locations/:id` -> `{ location, removed: { sightings, crimes } }`.
  OJO: borra en cascada sus avistamientos y crímenes. Avisar al usuario antes (confirmación).
- Categorías: `avistamiento | crimen | guarida | punto-de-interes`.
- Reglas: name 3-80, description 10-500. Cambiar la categoría de una ubicación con registros
  asociados responde 409.
- Forma de la respuesta: `{ id, name, description, category, point, createdBy: { id, name }, createdAt, updatedAt }`.
  La categoría es un texto (enum), se muestra tal cual; no es un ObjectId.

### Zonas `/zones`
- `GET /zones?search=` y `GET /zones/geojson?search=` (FeatureCollection, `geometry` = Polygon).
- `GET /zones/:id`, `POST /zones`, `PATCH /zones/:id`, `DELETE /zones/:id`.
- Body: `{ name (obligatorio, 3-80, ÚNICO), description (opcional, <=500), riskLevel, area (obligatorio) }`.
- `riskLevel`: `bajo | medio | alto` (default medio).
- Errores: nombre repetido -> 409; polígono con lados que se cruzan -> 400; máx. 500 vértices.
- Las zonas se cargan al abrir la app y permanecen hasta que el usuario las elimine.

### Villanos `/villains`
- `GET /villains?search=&threatLevel=&status=` (search busca en nombre y alias).
- `GET /villains/:id` -> incluye `crimes` (historial: type, severity, status, occurredAt).
- `POST`, `PATCH /:id`, `DELETE /:id`.
- Campos: `name` (obligatorio, único, 2-80), `alias`, `history` (obligatorio, 10-2500),
  `powers` (arreglo de textos), `threatLevel` (obligatorio), `status`, `knownLocations` (arreglo de ids).
- `threatLevel`: `bajo | medio | alto | extremo`. `status`: `activo | capturado | desaparecido | fallecido`.
- `knownLocations`: SOLO ubicaciones de categoría `guarida` (si no, 400). Vienen pobladas
  con `{ id, name, category, point }`.
- Nombre repetido -> 409. Al borrar, sus crímenes se conservan sin villano.

### Crímenes `/crimes`
- `GET /crimes?search=&type=&severity=&status=&villain=&from=&to=`
  (`search` busca en descripción; `villain` = id o `all`; `from`/`to` formato AAAA-MM-DD).
- `GET /crimes/:id`, `POST`, `PATCH /:id`, `DELETE /:id`.
- Campos: `location` (id, obligatorio), `type`, `description` (10-1000), `occurredAt` (fecha ISO),
  `severity` (todos obligatorios), `status`, `villain` (id, opcional), `sighting` (id, opcional).
- `type`: `asalto | robo | balacera | secuestro | vandalismo | incendio | otro`.
- `severity`: `baja | media | alta | critica`. `status`: `reportado | en-proceso | resuelto`.
- `location` debe ser una ubicación de categoría `crimen` (si no, 400).
- Respuesta con populate: `location {name,category,point}`, `villain {name,alias,threatLevel}`,
  `sighting {seenAt,status}`, `reportedBy {name}`.

### Avistamientos `/sightings`
- `GET /sightings?search=&status=&location=&from=&to=` (search busca en notas y testigo).
- `GET /sightings/:id`, `POST`, `PATCH /:id`, `DELETE /:id`.
- Campos: `location` (id, obligatorio), `seenAt` (fecha ISO, obligatorio), `notes` (5-1000, obligatorio),
  `status`, `witness` (<=80, opcional).
- `status`: `confirmado | por-verificar | descartado` (default por-verificar).
- `location` debe ser de categoría `avistamiento` (si no, 400).
- Al borrar un avistamiento, los crímenes que lo referenciaban quedan sin avistamiento.

## Flujo de datos entre entidades
Primero se crea la UBICACIÓN en el mapa con la categoría correcta; después se crea el
avistamiento / crimen / villano (guarida) eligiendo esa ubicación en un selector que solo
liste ubicaciones de la categoría que corresponde (filtrar con `?category=`).

## Mapa (vista principal)
- Clic en el mapa -> abre formulario (nombre, descripción, categoría) con coordenadas ya llenas
  -> POST /locations -> aparece el marcador con su popup.
- Popup del marcador: muestra los datos y permite EDITAR y ELIMINAR ahí mismo (PATCH / DELETE).
- Tabla de ubicaciones: todas las columnas excepto el id; `createdBy` se muestra por nombre.
  Debe actualizarse SIN recargar la página al crear, editar o eliminar desde el mapa
  (estado compartido en Pinia o refetch tras cada acción).
- Filtros (búsqueda por nombre, categoría, zona) mandan query params al backend; el resultado
  se refleja en mapa Y tabla a la vez.
- Zonas: botón para dibujar polígono, pedir nombre (y riesgo), POST /zones, pintar la capa;
  al abrir la app se cargan con GET /zones/geojson. Poder eliminarlas.
- Al montar/desmontar el mapa limpiar la instancia de Leaflet (evitar "Map container is already initialized").
- Leaflet necesita `import "leaflet/dist/leaflet.css"` y arreglar los iconos por defecto con Vite.

## Reglas extra verificadas en el backend
- El back RECHAZA campos desconocidos (400 "Campos no permitidos"). En POST/PATCH mandar solo
  los campos listados de cada entidad. Nunca reenviar el objeto completo que devolvió la API:
  trae `id`, `createdBy`, `createdAt`, etc. y los ids vienen poblados como objetos. Al editar,
  convertir referencias a su id (`crime.location.id`, `villain.knownLocations.map(l => l.id)`).
- Fechas (`occurredAt`, `seenAt`): enviar ISO 8601 (`new Date(valor).toISOString()`).
  NO se aceptan fechas futuras (tolerancia de 5 min). Si el input es `datetime-local`,
  poner `max` con la fecha actual. Filtros `from`/`to`: formato AAAA-MM-DD.
- Villanos: `powers` es arreglo de textos de 1 a 40 caracteres, máximo 15 (se quitan repetidos);
  `knownLocations` máximo 20 ids; `alias` máximo 80.
- Crímenes: `villain` y `sighting` aceptan `null` en PATCH para quitar la relación.
- PATCH exige al menos un campo. Todos los PATCH son parciales.
- Usuario de prueba del seed: tester@spideytracker.com (la contraseña está en backend/src/data/users.seed.js).
  Admin: admin@spideytracker.com.
## Estilo visual
Definido por los diseños exportados de Stitch/Gemini que el equipo coloque en `/design`.
No inventar un estilo propio si hay un diseño de referencia.

