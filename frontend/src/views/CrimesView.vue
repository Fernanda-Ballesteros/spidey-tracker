<script setup>
import { computed, ref } from 'vue'
import BaseMap from '@/components/map/BaseMap.vue'
import Chip from '@/components/Chip.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import CrimeDetailPanel from '@/components/crimes/CrimeDetailPanel.vue'
import CrimeFormModal from '@/components/crimes/CrimeFormModal.vue'
import VillainBadge from '@/components/villains/VillainBadge.vue'
import {
  CRIME_STATUS_OPTIONS,
  SEVERITY_META,
  SEVERITY_OPTIONS,
  TYPE_OPTIONS,
  crimeStatusMeta,
  crimeTypeLabel,
  severityMeta,
} from '@/utils/crimeConfig'
import { toLeaflet } from '@/utils/coordinates'
import { formatDateTime } from '@/utils/dates'
// TODO(integración): quitar los datos de ejemplo y usar la API.
import { CRIMES_MOCK, CRIME_LOCATIONS_MOCK, SIGHTINGS_MOCK } from '@/mocks/crimes'
import { VILLAINS_MOCK } from '@/mocks/villains'

/* ---------- Lista y estado de carga ---------- */
// TODO(integración): reemplazar por un store de Pinia con GET /crimes.
const crimenes = ref(CRIMES_MOCK)
const cargando = ref(false)
// Cuando falle la carga: { message, details } (ver utils/errors.js).
const error = ref(null)

/* ---------- Filtros (query params de GET /crimes) ---------- */
const busqueda = ref('')
const tipo = ref('all')
const gravedad = ref('all')
const estado = ref('all')
const villano = ref('all')
// Formato AAAA-MM-DD, como lo pide el backend.
const desde = ref('')
const hasta = ref('')

// TODO(integración): GET /villains para llenar el filtro y el formulario.
const villanosDisponibles = ref(VILLAINS_MOCK)

function cargarCrimenes() {
  // TODO(integración): GET /crimes?search=&type=&severity=&status=&villain=&from=&to=
  // enviando { busqueda, tipo, gravedad, estado, villano, desde, hasta }.
  // El filtrado lo hace el backend.
}

function limpiarFiltros() {
  busqueda.value = ''
  tipo.value = 'all'
  gravedad.value = 'all'
  estado.value = 'all'
  villano.value = 'all'
  desde.value = ''
  hasta.value = ''
  cargarCrimenes()
}

/* ---------- Crimen seleccionado (detalle + mapa) ---------- */
const seleccionadoId = ref(CRIMES_MOCK[0]?.id ?? null)
const cargandoDetalle = ref(false)

const seleccionado = computed(
  () => crimenes.value.find((crimen) => crimen.id === seleccionadoId.value) || null,
)

function seleccionarCrimen(crimen) {
  seleccionadoId.value = crimen.id
  // TODO(integración): GET /crimes/:id y GET /locations/:id (para traer las zonas).
}

// El marcador guarda el crimen completo en `data`.
function alClicMarcador(marcador) {
  seleccionarCrimen(marcador.data)
}

// Un marcador por crimen, coloreado según su gravedad.
const marcadores = computed(() =>
  crimenes.value
    .map((crimen) => ({
      id: crimen.id,
      latlng: toLeaflet(crimen.location?.point),
      category: 'crimen',
      color: severityMeta(crimen.severity).color,
      data: crimen,
    }))
    .filter((marcador) => marcador.latlng),
)

const leyenda = Object.values(SEVERITY_META).reverse()

/* ---------- Crear / editar ---------- */
const formAbierto = ref(false)
const crimenEditando = ref(null)
const guardando = ref(false)
// Errores por campo del formulario. Ej: { description: 'Mínimo 10 caracteres' }.
const erroresForm = ref({})
// TODO(integración): GET /locations?category=crimen
const ubicacionesCrimen = ref(CRIME_LOCATIONS_MOCK)
// TODO(integración): GET /sightings
const avistamientosDisponibles = ref(SIGHTINGS_MOCK)

function abrirCrear() {
  crimenEditando.value = null
  erroresForm.value = {}
  formAbierto.value = true
}

function abrirEditar(crimen) {
  crimenEditando.value = crimen
  erroresForm.value = {}
  formAbierto.value = true
}

function cerrarForm() {
  formAbierto.value = false
}

function guardarCrimen() {
  // El modal entrega aquí el cuerpo listo: { location, type, description,
  // occurredAt (ISO), severity, status, villain, sighting }.
  // TODO(integración):
  //   - Crear:  POST /crimes            (si crimenEditando es null)
  //   - Editar: PATCH /crimes/:id       (usar crimenEditando.id)
  //   - Éxito: alertsStore.success('Crimen guardado correctamente.') y cerrarForm()
  //   - Error: alertsStore.error(message, details) y llenar erroresForm
  cerrarForm()
}

/* ---------- Eliminar ---------- */
const crimenAEliminar = ref(null)
const eliminando = ref(false)

function pedirEliminar(crimen) {
  crimenAEliminar.value = crimen
}

function cancelarEliminar() {
  crimenAEliminar.value = null
}

function confirmarEliminar() {
  // TODO(integración):
  //   - DELETE /crimes/:id (usar crimenAEliminar.id)
  //   - Éxito: alertsStore.success('Crimen eliminado correctamente.')
  //   - Error: alertsStore.error(message, details)
  crimenAEliminar.value = null
}
</script>

<template>
  <section class="crimes-view">
    <header class="page-head">
      <div>
        <h1>Crímenes</h1>
        <p class="page-head__sub">
          Registro de incidentes hostiles en Nueva York // cuadrante activo
        </p>
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
        Nuevo crimen
      </button>
    </header>

    <div class="crimes-layout">
      <div class="crimes-main">
        <section class="map-card" aria-label="Mapa de incidentes">
          <header class="map-card__head">
            <h2>Despliegue geo-táctico // cobertura total Manhattan</h2>
            <p>
              <span>Modo: solo consulta</span>
              <span class="map-card__live">Telemetría activa</span>
            </p>
          </header>

          <div class="map-card__map">
            <BaseMap :markers="marcadores" :selected-id="seleccionadoId" @marker-click="alClicMarcador">
              <template #popup="{ marker }">
                <div v-if="marker" class="crime-popup">
                  <div class="crime-popup__chips">
                    <VillainBadge
                      :label="severityMeta(marker.data.severity).label"
                      :color="severityMeta(marker.data.severity).color"
                      :solid="severityMeta(marker.data.severity).solid"
                    />
                    <Chip
                      :label="crimeStatusMeta(marker.data.status).label"
                      :variant="crimeStatusMeta(marker.data.status).chip"
                    />
                  </div>
                  <h3>{{ crimeTypeLabel(marker.data.type) }}</h3>
                  <p>{{ marker.data.location?.name }}</p>
                  <p class="crime-popup__date">{{ formatDateTime(marker.data.occurredAt) }}</p>
                </div>
              </template>
            </BaseMap>

            <div class="map-legend">
              <span class="map-legend__label">Nivel de gravedad</span>
              <span v-for="nivel in leyenda" :key="nivel.label" class="map-legend__item">
                <i :style="{ background: nivel.color }"></i>
                {{ nivel.label }}
              </span>
            </div>
          </div>
        </section>

        <section class="filters" aria-label="Filtros de crímenes">
          <header class="filters__head">
            <h2>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z" />
              </svg>
              Filtros tácticos de consulta
            </h2>
            <button class="filters__clear" type="button" @click="limpiarFiltros">
              Limpiar filtros
            </button>
          </header>

          <div class="filters__grid">
            <div class="form-field filters__search">
              <label class="form-label" for="filtro-busqueda">Descripción / palabras clave</label>
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
                  placeholder="Buscar por descripción..."
                  @input="cargarCrimenes"
                />
              </div>
            </div>

            <div class="form-field">
              <label class="form-label" for="filtro-tipo">Tipo</label>
              <select id="filtro-tipo" v-model="tipo" class="select" @change="cargarCrimenes">
                <option value="all">Todos</option>
                <option v-for="item in TYPE_OPTIONS" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>

            <div class="form-field">
              <label class="form-label" for="filtro-gravedad">Gravedad</label>
              <select
                id="filtro-gravedad"
                v-model="gravedad"
                class="select"
                @change="cargarCrimenes"
              >
                <option value="all">Todas</option>
                <option v-for="item in SEVERITY_OPTIONS" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>

            <div class="form-field">
              <label class="form-label" for="filtro-estado">Estado</label>
              <select id="filtro-estado" v-model="estado" class="select" @change="cargarCrimenes">
                <option value="all">Todos</option>
                <option v-for="item in CRIME_STATUS_OPTIONS" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>

            <div class="form-field">
              <label class="form-label" for="filtro-villano">Villano</label>
              <select id="filtro-villano" v-model="villano" class="select" @change="cargarCrimenes">
                <option value="all">Todos</option>
                <option v-for="item in villanosDisponibles" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="filters__range">
            <span class="filters__range-title">Rango temporal:</span>
            <label>
              Desde
              <input v-model="desde" class="input" type="date" :max="hasta || undefined" @change="cargarCrimenes" />
            </label>
            <label>
              Hasta
              <input v-model="hasta" class="input" type="date" :min="desde || undefined" @change="cargarCrimenes" />
            </label>
          </div>
        </section>

        <section class="table-panel" aria-label="Incidentes registrados">
          <header class="table-panel__head">
            <h2>Incidentes registrados</h2>
            <span class="table-panel__count">{{ crimenes.length }} registros</span>
          </header>

          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Gravedad</th>
                  <th>Estado</th>
                  <th>Ubicación</th>
                  <th>Villano</th>
                  <th class="col-actions">Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="cargando">
                  <td colspan="7" class="state-row">Cargando crímenes...</td>
                </tr>

                <tr v-else-if="error">
                  <td colspan="7" class="state-row state-row--error">
                    <span>{{ error.message }}</span>
                    <button class="btn btn-ghost btn--sm" type="button" @click="cargarCrimenes">
                      Reintentar
                    </button>
                  </td>
                </tr>

                <tr v-else-if="crimenes.length === 0">
                  <td colspan="7" class="state-row">No hay crímenes para los filtros seleccionados.</td>
                </tr>

                <template v-else>
                  <tr
                    v-for="crimen in crimenes"
                    :key="crimen.id"
                    class="crime-row"
                    :class="{ 'crime-row--selected': seleccionadoId === crimen.id }"
                    tabindex="0"
                    @click="seleccionarCrimen(crimen)"
                    @keydown.enter="seleccionarCrimen(crimen)"
                  >
                    <td class="cell-date">{{ formatDateTime(crimen.occurredAt) }}</td>
                    <td class="cell-name">{{ crimeTypeLabel(crimen.type) }}</td>
                    <td>
                      <VillainBadge
                        :label="severityMeta(crimen.severity).label"
                        :color="severityMeta(crimen.severity).color"
                        :solid="severityMeta(crimen.severity).solid"
                      />
                    </td>
                    <td>
                      <Chip
                        :label="crimeStatusMeta(crimen.status).label"
                        :variant="crimeStatusMeta(crimen.status).chip"
                      />
                    </td>
                    <td>{{ crimen.location?.name || '—' }}</td>
                    <td class="cell-villain">{{ crimen.villain?.name || '—' }}</td>
                    <td class="col-actions">
                      <div class="row-actions">
                        <button
                          class="icon-btn"
                          type="button"
                          :aria-label="`Editar crimen ${crimeTypeLabel(crimen.type)}`"
                          @click.stop="abrirEditar(crimen)"
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
                          :aria-label="`Eliminar crimen ${crimeTypeLabel(crimen.type)}`"
                          @click.stop="pedirEliminar(crimen)"
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
      </div>

      <CrimeDetailPanel class="crimes-side" :crime="seleccionado" :loading="cargandoDetalle" />
    </div>

    <CrimeFormModal
      :open="formAbierto"
      :crime="crimenEditando"
      :locations="ubicacionesCrimen"
      :villains="villanosDisponibles"
      :sightings="avistamientosDisponibles"
      :saving="guardando"
      :errors="erroresForm"
      @close="cerrarForm"
      @submit="guardarCrimen"
    />

    <ConfirmModal
      :open="Boolean(crimenAEliminar)"
      title="Eliminar crimen"
      :message="`¿Seguro que deseas eliminar este crimen (${crimenAEliminar ? crimeTypeLabel(crimenAEliminar.type) : ''})?`"
      details="La ubicación y el villano ligados no se eliminan."
      :loading="eliminando"
      @confirm="confirmarEliminar"
      @cancel="cancelarEliminar"
    />
  </section>
</template>

<style scoped>
.crimes-view {
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
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: clamp(1.45rem, 2.8vw, 2.15rem);
  letter-spacing: 0.1em;
}

.page-head h1::before {
  width: 9px;
  height: 9px;
  background: var(--color-brand);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--color-brand);
  content: '';
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

/* ---------- Distribución ---------- */
.crimes-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 1fr);
  gap: 1rem;
  align-items: start;
}

.crimes-main {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  min-width: 0;
}

.crimes-side {
  position: sticky;
  top: 1rem;
}

/* ---------- Mapa ---------- */
.map-card {
  overflow: hidden;
  background: var(--color-surface);
  border: var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
}

.map-card__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border-bottom: var(--border);
}

.map-card__head h2 {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
}

.map-card__head p {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.map-card__live {
  padding: 0.15rem 0.5rem;
  background: var(--color-accent-soft);
  border: 1px solid rgba(62, 199, 223, 0.35);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
}

.map-card__map {
  position: relative;
  height: 400px;
}

.map-card__map :deep(.base-map) {
  position: absolute;
  inset: 0;
}

.map-legend {
  position: absolute;
  bottom: 1.1rem;
  left: 0.8rem;
  z-index: 450;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem 0.8rem;
  padding: 0.45rem 0.65rem;
  background: rgba(8, 15, 26, 0.92);
  border: var(--border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  pointer-events: none;
}

.map-legend__label {
  width: 100%;
  color: var(--color-text-dim);
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

.crime-popup {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
  min-width: 220px;
  padding: 0.85rem;
}

.crime-popup__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.crime-popup h3 {
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: none;
}

.crime-popup p {
  color: var(--color-text-muted);
  font-size: 0.76rem;
}

.crime-popup__date {
  font-family: var(--font-mono);
  font-size: 0.62rem !important;
}

/* ---------- Filtros ---------- */
.filters {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  background: var(--color-surface);
  border: var(--border);
  border-radius: var(--radius-lg);
}

.filters__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.filters__head h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
}

.filters__head svg {
  width: 16px;
  height: 16px;
  color: var(--color-accent);
}

.filters__clear {
  padding: 0;
  background: transparent;
  border: 0;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.05em;
}

.filters__clear:hover {
  text-decoration: underline;
}

.filters__grid {
  display: grid;
  grid-template-columns: minmax(180px, 2fr) repeat(4, minmax(110px, 1fr));
  gap: 0.7rem;
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

.filters__range {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.filters__range-title {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.filters__range label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.78rem;
}

.filters__range .input {
  width: auto;
  min-height: 34px;
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
  border: 1px solid rgba(62, 199, 223, 0.35);
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
  min-width: 820px;
}

.table-scroll .data-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
}

.crime-row {
  cursor: pointer;
  transition: background var(--transition);
}

.crime-row td {
  vertical-align: middle;
}

.crime-row:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.crime-row--selected {
  background: var(--color-accent-soft);
}

.crime-row--selected td:first-child {
  box-shadow: inset 3px 0 0 var(--color-accent);
}

.cell-date {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  white-space: nowrap;
}

.cell-name {
  font-weight: 600;
}

.cell-villain {
  color: var(--color-brand);
  font-weight: 600;
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
  border-color: rgba(229, 72, 77, 0.5);
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
  .crimes-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .crimes-side {
    position: static;
  }

  .filters__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filters__search {
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
}
</style>