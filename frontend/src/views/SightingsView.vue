<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api/axios'
import { useAlertsStore } from '@/stores/alerts'
import { getErrorMessage } from '@/utils/errors'
import BaseMap from '@/components/map/BaseMap.vue'
import Chip from '@/components/Chip.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import SightingFormModal from '@/components/sightings/SightingFormModal.vue'
import { toLeaflet } from '@/utils/coordinates'
import { formatDateTime } from '@/utils/dates'
import {
  SIGHTING_STATUS_META,
  SIGHTING_STATUS_OPTIONS,
  sightingStatusMeta,
} from '@/utils/sightingConfig'
const alerts = useAlertsStore()

/* ---------- Lista y estado de carga ---------- */
const avistamientos = ref([])
const cargando = ref(false)
// Cuando falle la carga: { message, details } (ver utils/errors.js).
const error = ref(null)

/* ---------- Filtros (query params de GET /sightings) ---------- */
const busqueda = ref('')
const estado = ref('all')
// Id de una ubicación o 'all'.
const ubicacion = ref('all')
// Formato AAAA-MM-DD, como lo pide el backend.
const desde = ref('')
const hasta = ref('')

// Solo ubicaciones de categoría "avistamiento" (el backend rechaza otras).
const ubicacionesAvistamiento = ref([])

async function cargarUbicaciones() {
  try {
    const { data } = await api.get('/locations', { params: { category: 'avistamiento' } })
    ubicacionesAvistamiento.value = data
  } catch (err) {
    mostrarError(err)
  }
}

// Espera a que el usuario deje de escribir antes de pedir la lista.
let timerBusqueda = null

function cargarAvistamientos() {
  clearTimeout(timerBusqueda)
  timerBusqueda = setTimeout(pedirAvistamientos, 300)
}

// GET /sightings?search=&status=&location=&from=&to=. El filtrado lo hace el backend.
async function pedirAvistamientos() {
  cargando.value = true
  error.value = null

  try {
    const { data } = await api.get('/sightings', {
      params: {
        search: busqueda.value.trim(),
        status: estado.value,
        location: ubicacion.value,
        // Fechas vacías no se envían (el backend no las acepta como texto vacío).
        from: desde.value || undefined,
        to: hasta.value || undefined,
      },
    })
    avistamientos.value = data

    if (!data.some((avistamiento) => avistamiento.id === seleccionadoId.value)) {
      seleccionadoId.value = data[0]?.id ?? null
    }
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    cargando.value = false
  }
}

function mostrarError(err) {
  const { message, details } = getErrorMessage(err)
  alerts.error(message, details)
}

onMounted(() => {
  pedirAvistamientos()
  cargarUbicaciones()
})

function limpiarFiltros() {
  busqueda.value = ''
  estado.value = 'all'
  ubicacion.value = 'all'
  desde.value = ''
  hasta.value = ''
  cargarAvistamientos()
}

/* ---------- Avistamiento seleccionado (popup del mapa) ---------- */
const seleccionadoId = ref(null)

function seleccionarAvistamiento(avistamiento) {
  seleccionadoId.value = avistamiento.id
}

// El marcador guarda el avistamiento completo en `data`.
function alClicMarcador(marcador) {
  seleccionarAvistamiento(marcador.data)
}

// Un marcador por avistamiento, coloreado según su estado.
const marcadores = computed(() =>
  avistamientos.value
    .map((avistamiento) => ({
      id: avistamiento.id,
      latlng: toLeaflet(avistamiento.location?.point),
      category: 'avistamiento',
      color: sightingStatusMeta(avistamiento.status).color,
      data: avistamiento,
    }))
    .filter((marcador) => marcador.latlng),
)

const leyenda = Object.values(SIGHTING_STATUS_META)

/* ---------- Crear / editar ---------- */
const formAbierto = ref(false)
const avistamientoEditando = ref(null)
const guardando = ref(false)
// Errores por campo del formulario. Ej: { notes: 'Mínimo 5 caracteres' }.
const erroresForm = ref({})

function abrirCrear() {
  avistamientoEditando.value = null
  erroresForm.value = {}
  formAbierto.value = true
}

function abrirEditar(avistamiento) {
  avistamientoEditando.value = avistamiento
  erroresForm.value = {}
  formAbierto.value = true
}

function cerrarForm() {
  formAbierto.value = false
}

// El modal entrega el cuerpo listo: { location, seenAt (ISO), status, witness, notes }.
async function guardarAvistamiento(payload) {
  guardando.value = true
  erroresForm.value = {}

  try {
    const editando = avistamientoEditando.value
    const { data } = editando
      ? await api.patch(`/sightings/${editando.id}`, payload)
      : await api.post('/sightings', payload)

    alerts.success(
      editando ? 'Avistamiento actualizado correctamente.' : 'Avistamiento registrado correctamente.',
    )
    cerrarForm()
    seleccionadoId.value = data.id
    await pedirAvistamientos()
  } catch (err) {
    mostrarError(err)
  } finally {
    guardando.value = false
  }
}

/* ---------- Eliminar ---------- */
const avistamientoAEliminar = ref(null)
const eliminando = ref(false)

function pedirEliminar(avistamiento) {
  avistamientoAEliminar.value = avistamiento
}

function cancelarEliminar() {
  avistamientoAEliminar.value = null
}

async function confirmarEliminar() {
  const avistamiento = avistamientoAEliminar.value
  if (!avistamiento) return

  eliminando.value = true

  try {
    // Los crímenes que lo referenciaban quedan sin avistamiento.
    await api.delete(`/sightings/${avistamiento.id}`)
    alerts.success('Avistamiento eliminado correctamente.')
    avistamientoAEliminar.value = null
    await pedirAvistamientos()
  } catch (err) {
    mostrarError(err)
  } finally {
    eliminando.value = false
  }
}
</script>

<template>
  <section class="sightings-view">
    <header class="page-head">
      <div>
        <h1>Avistamientos</h1>
        <p class="page-head__sub">Registro y monitoreo de contactos visuales con Spider-Man</p>
      </div>

      <button class="btn btn-primary" type="button" @click="abrirCrear">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nuevo avistamiento
      </button>
    </header>

    <section class="map-card" aria-label="Mapa de avistamientos">
      <div class="map-card__map">
        <BaseMap :markers="marcadores" :selected-id="seleccionadoId" @marker-click="alClicMarcador">
          <template #popup="{ marker }">
            <div v-if="marker" class="sighting-popup">
              <div class="sighting-popup__head">
                <h3>{{ marker.data.location?.name }}</h3>
                <Chip
                  :label="sightingStatusMeta(marker.data.status).label"
                  :variant="sightingStatusMeta(marker.data.status).chip"
                />
              </div>
              <p class="sighting-popup__date">{{ formatDateTime(marker.data.seenAt) }}</p>
              <p v-if="marker.data.witness" class="sighting-popup__witness">
                Testigo: {{ marker.data.witness }}
              </p>
              <p class="sighting-popup__notes">"{{ marker.data.notes }}"</p>
            </div>
          </template>
        </BaseMap>

        <span class="map-card__badge">León centro</span>
      </div>

      <footer class="map-legend">
        <p>
          <span class="map-legend__label">Leyenda de avistamientos:</span>
          <span v-for="item in leyenda" :key="item.label" class="map-legend__item">
            <i :style="{ background: item.color }"></i>
            {{ item.label }}
          </span>
        </p>
        <span class="map-legend__mode">Modo consulta · vista urbana</span>
      </footer>
    </section>

    <section class="filters" aria-label="Filtros de avistamientos">
      <div class="form-field filters__search">
        <label class="form-label" for="filtro-busqueda">Búsqueda</label>
        <div class="filters__search-box">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="filtro-busqueda"
            v-model="busqueda"
            class="input"
            type="search"
            placeholder="Buscar por notas o testigo..."
            @input="cargarAvistamientos"
          />
        </div>
      </div>

      <div class="form-field">
        <label class="form-label" for="filtro-estado">Estado</label>
        <select id="filtro-estado" v-model="estado" class="select" @change="cargarAvistamientos">
          <option value="all">Todos los estados</option>
          <option v-for="item in SIGHTING_STATUS_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>

      <div class="form-field">
        <label class="form-label" for="filtro-ubicacion">Ubicación</label>
        <select
          id="filtro-ubicacion"
          v-model="ubicacion"
          class="select"
          @change="cargarAvistamientos"
        >
          <option value="all">Todas las ubicaciones</option>
          <option v-for="item in ubicacionesAvistamiento" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </select>
      </div>

      <div class="form-field">
        <label class="form-label" for="filtro-desde">Desde</label>
        <input
          id="filtro-desde"
          v-model="desde"
          class="input"
          type="date"
          :max="hasta || undefined"
          @change="cargarAvistamientos"
        />
      </div>

      <div class="form-field">
        <label class="form-label" for="filtro-hasta">Hasta</label>
        <input
          id="filtro-hasta"
          v-model="hasta"
          class="input"
          type="date"
          :min="desde || undefined"
          @change="cargarAvistamientos"
        />
      </div>

      <button class="btn btn-ghost filters__clear" type="button" @click="limpiarFiltros">
        Limpiar
      </button>
    </section>

    <section class="table-panel" aria-label="Registro de avistamientos">
      <header class="table-panel__head">
        <h2>Registro de avistamientos</h2>
        <span class="table-panel__count">{{ avistamientos.length }} registrados</span>
      </header>

      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Testigo</th>
              <th>Notas</th>
              <th class="col-actions">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="cargando">
              <td colspan="6" class="state-row">Cargando avistamientos...</td>
            </tr>

            <tr v-else-if="error">
              <td colspan="6" class="state-row state-row--error">
                <span>{{ error.message }}</span>
                <button class="btn btn-ghost btn--sm" type="button" @click="cargarAvistamientos">
                  Reintentar
                </button>
              </td>
            </tr>

            <tr v-else-if="avistamientos.length === 0">
              <td colspan="6" class="state-row">
                Sin resultados: no se encontraron avistamientos que coincidan con los filtros
                aplicados.
              </td>
            </tr>

            <template v-else>
              <tr
                v-for="avistamiento in avistamientos"
                :key="avistamiento.id"
                class="sighting-row"
                :class="{ 'sighting-row--selected': seleccionadoId === avistamiento.id }"
                tabindex="0"
                @click="seleccionarAvistamiento(avistamiento)"
                @keydown.enter="seleccionarAvistamiento(avistamiento)"
              >
                <td class="cell-date">{{ formatDateTime(avistamiento.seenAt) }}</td>
                <td class="cell-name">{{ avistamiento.location?.name || '—' }}</td>
                <td>
                  <Chip
                    :label="sightingStatusMeta(avistamiento.status).label"
                    :variant="sightingStatusMeta(avistamiento.status).chip"
                    dot
                  />
                </td>
                <td>{{ avistamiento.witness || '—' }}</td>
                <td class="cell-notes">{{ avistamiento.notes }}</td>
                <td class="col-actions">
                  <div class="row-actions">
                    <button
                      class="icon-btn"
                      type="button"
                      :aria-label="`Editar avistamiento en ${avistamiento.location?.name || ''}`"
                      @click.stop="abrirEditar(avistamiento)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
                        <path d="m14 7 3 3" />
                      </svg>
                    </button>
                    <button
                      class="icon-btn icon-btn--danger"
                      type="button"
                      :aria-label="`Eliminar avistamiento en ${avistamiento.location?.name || ''}`"
                      @click.stop="pedirEliminar(avistamiento)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>

    <SightingFormModal
      :open="formAbierto"
      :sighting="avistamientoEditando"
      :locations="ubicacionesAvistamiento"
      :saving="guardando"
      :errors="erroresForm"
      @close="cerrarForm"
      @submit="guardarAvistamiento"
    />

    <ConfirmModal
      :open="Boolean(avistamientoAEliminar)"
      title="Eliminar avistamiento"
      :message="`¿Seguro que deseas eliminar el avistamiento en &quot;${avistamientoAEliminar?.location?.name || ''}&quot;?`"
      details="Los crímenes que lo referenciaban se conservan, pero quedarán sin avistamiento."
      :loading="eliminando"
      @confirm="confirmarEliminar"
      @cancel="cancelarEliminar"
    />
  </section>
</template>

<style scoped>
.sightings-view {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

/* ---------- Encabezado ---------- */
.page-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.page-head h1 {
  font-size: clamp(1.45rem, 2.8vw, 2.15rem);
  letter-spacing: 0.1em;
}

.page-head__sub {
  margin-top: 0.3rem;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.page-head .btn svg {
  width: 16px;
  height: 16px;
}

/* ---------- Mapa ---------- */
.map-card {
  overflow: hidden;
  background: var(--color-surface);
  border: var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
}

.map-card__map {
  position: relative;
  height: 420px;
}

.map-card__map :deep(.base-map) {
  position: absolute;
  inset: 0;
}

.map-card__badge {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  z-index: 450;
  padding: 0.35rem 0.65rem;
  background: rgba(19, 35, 92, 0.92);
  border: 1px solid rgba(127, 196, 238, 0.35);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  pointer-events: none;
}

.map-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: var(--color-bg-soft);
  border-top: var(--border);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.05em;
}

.map-legend p {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem 0.9rem;
}

.map-legend__label {
  color: var(--color-text);
  text-transform: uppercase;
}

.map-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.map-legend__item i {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.map-legend__mode {
  color: var(--color-accent);
  text-transform: uppercase;
}

/* ---------- Popup del mapa ---------- */
.sighting-popup {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 240px;
  padding: 0.85rem;
}

.sighting-popup__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.sighting-popup h3 {
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: none;
}

.sighting-popup p {
  color: var(--color-text-muted);
  font-size: 0.76rem;
  line-height: 1.4;
}

.sighting-popup__date {
  color: var(--color-accent) !important;
  font-family: var(--font-mono);
  font-size: 0.64rem !important;
}

.sighting-popup__notes {
  font-style: italic;
}

/* ---------- Filtros ---------- */
.filters {
  display: grid;
  grid-template-columns: minmax(180px, 2fr) repeat(2, minmax(140px, 1fr)) repeat(2, minmax(130px, 0.8fr)) auto;
  align-items: end;
  gap: 0.7rem;
  padding: 0.9rem 1rem;
  background: var(--color-surface);
  border: var(--border);
  border-radius: var(--radius-lg);
}

.filters__search-box {
  position: relative;
}

.filters__search-box svg {
  position: absolute;
  top: 50%;
  left: 0.7rem;
  width: 15px;
  height: 15px;
  color: var(--color-accent);
  transform: translateY(-50%);
  pointer-events: none;
}

.filters__search-box .input {
  padding-left: 2.2rem;
}

/* ---------- Tabla ---------- */
.table-panel {
  overflow: hidden;
  background: var(--color-surface);
  border: var(--border);
  border-radius: var(--radius-lg);
}

.table-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-bottom: var(--border);
}

.table-panel__head h2 {
  font-size: 0.95rem;
  letter-spacing: 0.08em;
}

.table-panel__count {
  padding: 0.15rem 0.55rem;
  background: var(--color-accent-soft);
  border: 1px solid rgba(127, 196, 238, 0.35);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  text-transform: uppercase;
}

.table-scroll {
  max-height: 420px;
  overflow: auto;
}

.table-scroll .data-table {
  min-width: 860px;
}

.table-scroll .data-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
}

.sighting-row {
  cursor: pointer;
  transition: background var(--transition);
}

.sighting-row td {
  vertical-align: middle;
}

.sighting-row:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.sighting-row--selected {
  background: var(--color-accent-soft);
}

.sighting-row--selected td:first-child {
  box-shadow: inset 3px 0 0 var(--color-accent);
}

.cell-date {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  white-space: nowrap;
}

.cell-name {
  min-width: 150px;
  font-weight: 600;
}

.cell-notes {
  max-width: 340px;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-actions {
  width: 1%;
  text-align: right;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.35rem;
}

.icon-btn {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  background: var(--color-surface-2);
  border: var(--border);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  transition:
    background var(--transition),
    border-color var(--transition);
}

.icon-btn:hover {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
}

.icon-btn--danger {
  color: var(--color-brand);
}

.icon-btn--danger:hover {
  background: var(--color-danger-soft);
  border-color: rgba(255, 92, 92, 0.5);
}

.icon-btn svg {
  width: 15px;
  height: 15px;
}

.state-row {
  padding: 2rem 1rem !important;
  color: var(--color-text-muted);
  text-align: center;
}

.state-row--error {
  color: #ffb4b6;
}

.state-row--error span {
  display: block;
  margin-bottom: 0.6rem;
}

/* ---------- Responsivo ---------- */
@media (max-width: 1100px) {
  .filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filters__search,
  .filters__clear {
    grid-column: 1 / -1;
  }
}

@media (max-width: 680px) {
  .page-head .btn {
    width: 100%;
  }

  .map-card__map {
    height: 340px;
  }

  .filters {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>