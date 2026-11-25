<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import BaseMap from '@/components/map/BaseMap.vue'
import Chip from '@/components/Chip.vue'
import Modal from '@/components/Modal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { useLocationsStore } from '@/stores/locations'
import { useZonesStore } from '@/stores/zones'
import { useAlertsStore } from '@/stores/alerts'
import { getErrorMessage } from '@/utils/errors'
import { toLeaflet } from '@/utils/coordinates'
import { formatCoordinate, formatDateTime } from '@/utils/dates'
import {
  categoryColor,
  categoryMeta,
  DEFAULT_CENTER,
  LOCATION_CATEGORIES,
  LOCATION_CATEGORY_META,
  RISK_LEVELS,
  RISK_META,
  riskColor,
  riskMeta,
} from '@/utils/mapConfig'

const locations = useLocationsStore()
const zones = useZonesStore()
const alerts = useAlertsStore()

const baseMap = ref(null)

// ---------- Filtros ----------
const search = ref('')
const category = ref('all')
const zoneFilter = ref('all')
const selectedId = ref(null)

let searchTimer = null

const categorias = LOCATION_CATEGORIES.map((value) => ({
  value,
  ...LOCATION_CATEGORY_META[value],
}))

const riesgos = RISK_LEVELS.map((value) => ({
  value,
  ...RISK_META[value],
}))

// Marcadores que recibe BaseMap. La conversión [lng, lat] -> [lat, lng]
// se hace en un solo lugar: utils/coordinates.js.
const markers = computed(() =>
  locations.items
    .map((location) => ({
      id: location.id,
      latlng: toLeaflet(location.point),
      category: location.category,
      color: categoryColor(location.category),
      data: location,
    }))
    .filter((marker) => marker.latlng),
)

const zoneFeatures = computed(() => zones.features)

function mostrarError(err) {
  const { message, details } = getErrorMessage(err)
  alerts.error(message, details)
}

async function cargarUbicaciones() {
  try {
    await locations.fetch({
      search: search.value,
      category: category.value,
      zone: zoneFilter.value,
    })
  } catch (err) {
    mostrarError(err)
  }
}

async function cargarZonas() {
  try {
    await zones.fetchZones()
  } catch (err) {
    mostrarError(err)
  }
}

function alEscribirBusqueda() {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    cargarUbicaciones()
  }, 300)
}

function limpiarFiltros() {
  window.clearTimeout(searchTimer)
  search.value = ''
  category.value = 'all'
  zoneFilter.value = 'all'
  cargarUbicaciones()
}

function seleccionarUbicacion(location) {
  selectedId.value = location.id
}

// Si un cambio de filtros deja fuera la ubicación seleccionada, se limpia.
watch(
  () => locations.items,
  (items) => {
    if (selectedId.value && !items.some((item) => item.id === selectedId.value)) {
      selectedId.value = null
    }
  },
)

// ---------- Crear ubicación ----------
const crearAbierto = ref(false)
const creando = ref(false)

const crearForm = reactive({
  name: '',
  description: '',
  category: 'avistamiento',
  latitude: DEFAULT_CENTER[0],
  longitude: DEFAULT_CENTER[1],
})

const crearErrors = reactive({
  name: '',
  description: '',
  category: '',
})

function limpiarErroresCrear() {
  crearErrors.name = ''
  crearErrors.description = ''
  crearErrors.category = ''
}

function abrirCreacion(coordenadas) {
  crearForm.name = ''
  crearForm.description = ''
  crearForm.category = 'avistamiento'
  crearForm.latitude = Number(coordenadas.latitude)
  crearForm.longitude = Number(coordenadas.longitude)
  limpiarErroresCrear()
  crearAbierto.value = true
}

function abrirCreacionDesdeBoton() {
  const centro = baseMap.value?.getCenter() || {
    latitude: DEFAULT_CENTER[0],
    longitude: DEFAULT_CENTER[1],
  }

  abrirCreacion(centro)
}

function cerrarCreacion() {
  if (creando.value) {
    return
  }

  crearAbierto.value = false
}

function validarCreacion() {
  limpiarErroresCrear()

  const nombre = crearForm.name.trim()
  if (nombre.length < 3 || nombre.length > 80) {
    crearErrors.name = 'El nombre debe tener entre 3 y 80 caracteres.'
  }

  const descripcion = crearForm.description.trim()
  if (descripcion.length < 10 || descripcion.length > 500) {
    crearErrors.description = 'La descripción debe tener entre 10 y 500 caracteres.'
  }

  if (!LOCATION_CATEGORIES.includes(crearForm.category)) {
    crearErrors.category = 'Selecciona una categoría válida.'
  }

  return !crearErrors.name && !crearErrors.description && !crearErrors.category
}

async function guardarUbicacion() {
  if (creando.value || !validarCreacion()) {
    return
  }

  creando.value = true

  try {
    const creada = await locations.create({
      name: crearForm.name.trim(),
      description: crearForm.description.trim(),
      category: crearForm.category,
      latitude: Number(crearForm.latitude),
      longitude: Number(crearForm.longitude),
    })

    alerts.success(`Ubicación "${creada.name}" registrada correctamente.`)
    crearAbierto.value = false
    selectedId.value = creada.id
  } catch (err) {
    mostrarError(err)
  } finally {
    creando.value = false
  }
}

// ---------- Editar ubicación desde su popup ----------
const popupEditId = ref(null)
const guardandoPopup = ref(false)

const popupForm = reactive({
  name: '',
  description: '',
  category: 'avistamiento',
})

const popupErrors = reactive({
  name: '',
  description: '',
  category: '',
})

function limpiarErroresPopup() {
  popupErrors.name = ''
  popupErrors.description = ''
  popupErrors.category = ''
}

function iniciarEdicionPopup(location) {
  popupEditId.value = location.id
  popupForm.name = location.name
  popupForm.description = location.description
  popupForm.category = location.category
  limpiarErroresPopup()
}

function cancelarEdicionPopup() {
  if (guardandoPopup.value) {
    return
  }

  popupEditId.value = null
  limpiarErroresPopup()
}

function validarPopup() {
  limpiarErroresPopup()

  const nombre = popupForm.name.trim()
  if (nombre.length < 3 || nombre.length > 80) {
    popupErrors.name = 'El nombre debe tener entre 3 y 80 caracteres.'
  }

  const descripcion = popupForm.description.trim()
  if (descripcion.length < 10 || descripcion.length > 500) {
    popupErrors.description = 'La descripción debe tener entre 10 y 500 caracteres.'
  }

  if (!LOCATION_CATEGORIES.includes(popupForm.category)) {
    popupErrors.category = 'Selecciona una categoría válida.'
  }

  return !popupErrors.name && !popupErrors.description && !popupErrors.category
}

async function guardarPopupEdicion(location) {
  if (guardandoPopup.value || !validarPopup()) {
    return
  }

  // Solo se envían los campos permitidos y que realmente cambiaron.
  const payload = {}
  const nombre = popupForm.name.trim()
  const descripcion = popupForm.description.trim()

  if (nombre !== location.name) {
    payload.name = nombre
  }

  if (descripcion !== location.description) {
    payload.description = descripcion
  }

  if (popupForm.category !== location.category) {
    payload.category = popupForm.category
  }

  if (Object.keys(payload).length === 0) {
    popupEditId.value = null
    return
  }

  guardandoPopup.value = true

  try {
    const actualizada = await locations.update(location.id, payload)
    alerts.success(`Ubicación "${actualizada.name}" actualizada correctamente.`)
    popupEditId.value = null
    selectedId.value = location.id
  } catch (err) {
    mostrarError(err)
  } finally {
    guardandoPopup.value = false
  }
}

// ---------- Eliminar ubicación ----------
const eliminarUbicacion = ref(null)
const eliminandoUbicacion = ref(false)

function pedirEliminarUbicacion(location) {
  eliminarUbicacion.value = location
}

function cancelarEliminarUbicacion() {
  if (!eliminandoUbicacion.value) {
    eliminarUbicacion.value = null
  }
}

async function confirmarEliminarUbicacion() {
  const location = eliminarUbicacion.value
  if (!location || eliminandoUbicacion.value) {
    return
  }

  eliminandoUbicacion.value = true

  try {
    const resultado = await locations.remove(location.id)
    const removed = resultado?.removed || {}

    alerts.success(
      `Ubicación "${location.name}" eliminada. ` +
        `Se quitaron ${removed.sightings ?? 0} avistamiento(s) y ${removed.crimes ?? 0} crimen(es).`,
    )

    if (selectedId.value === location.id) {
      selectedId.value = null
    }

    eliminarUbicacion.value = null
  } catch (err) {
    mostrarError(err)
  } finally {
    eliminandoUbicacion.value = false
  }
}

// ---------- Dibujar y crear zonas ----------
const dibujandoZona = ref(false)
const zonaAbierta = ref(false)
const creandoZona = ref(false)
const zonaGeometry = ref(null)

const zonaForm = reactive({
  name: '',
  description: '',
  riskLevel: 'medio',
})

const zonaErrors = reactive({
  name: '',
  description: '',
  riskLevel: '',
  area: '',
})

function limpiarErroresZona() {
  zonaErrors.name = ''
  zonaErrors.description = ''
  zonaErrors.riskLevel = ''
  zonaErrors.area = ''
}

function iniciarDibujoZona() {
  if (crearAbierto.value || zonaAbierta.value) {
    return
  }

  dibujandoZona.value = true
  baseMap.value?.enableZoneDrawing()
}

function alDibujarZona(geometry) {
  dibujandoZona.value = false
  zonaGeometry.value = geometry
  zonaForm.name = ''
  zonaForm.description = ''
  zonaForm.riskLevel = 'medio'
  limpiarErroresZona()
  zonaAbierta.value = true
}

function cancelarDibujoZona() {
  dibujandoZona.value = false
}

function cerrarZona() {
  if (creandoZona.value) {
    return
  }

  zonaAbierta.value = false
  zonaGeometry.value = null
  baseMap.value?.clearDraft()
}

function validarZona() {
  limpiarErroresZona()

  const nombre = zonaForm.name.trim()
  if (nombre.length < 3 || nombre.length > 80) {
    zonaErrors.name = 'El nombre de la zona debe tener entre 3 y 80 caracteres.'
  }

  if (zonaForm.description.trim().length > 500) {
    zonaErrors.description = 'La descripción no puede superar 500 caracteres.'
  }

  if (!RISK_LEVELS.includes(zonaForm.riskLevel)) {
    zonaErrors.riskLevel = 'Selecciona un nivel de riesgo válido.'
  }

  if (!zonaGeometry.value?.coordinates?.length) {
    zonaErrors.area = 'No se recibió el polígono dibujado. Intenta nuevamente.'
  }

  return (
    !zonaErrors.name && !zonaErrors.description && !zonaErrors.riskLevel && !zonaErrors.area
  )
}

async function guardarZona() {
  if (creandoZona.value || !validarZona()) {
    return
  }

  creandoZona.value = true

  try {
    const creada = await zones.create({
      name: zonaForm.name.trim(),
      description: zonaForm.description.trim(),
      riskLevel: zonaForm.riskLevel,
      area: {
        type: 'Polygon',
        coordinates: zonaGeometry.value.coordinates,
      },
    })

    alerts.success(`Zona "${creada.name}" creada correctamente.`)
    zonaAbierta.value = false
    zonaGeometry.value = null
    baseMap.value?.clearDraft()
  } catch (err) {
    mostrarError(err)
  } finally {
    creandoZona.value = false
  }
}

// ---------- Eliminar zona ----------
const eliminarZona = ref(null)
const eliminandoZona = ref(false)

function pedirEliminarZona(zone) {
  eliminarZona.value = zone
}

function cancelarEliminarZona() {
  if (!eliminandoZona.value) {
    eliminarZona.value = null
  }
}

async function confirmarEliminarZona() {
  const zone = eliminarZona.value
  if (!zone || eliminandoZona.value) {
    return
  }

  eliminandoZona.value = true

  try {
    await zones.remove(zone.id)
    alerts.success(`Zona "${zone.name}" eliminada correctamente.`)

    // Si se estaba filtrando por esta zona, el filtro deja de ser válido.
    if (zoneFilter.value === zone.id) {
      zoneFilter.value = 'all'
      await cargarUbicaciones()
    }

    eliminarZona.value = null
  } catch (err) {
    mostrarError(err)
  } finally {
    eliminandoZona.value = false
  }
}

onMounted(() => {
  cargarUbicaciones()
  cargarZonas()
})

onBeforeUnmount(() => {
  window.clearTimeout(searchTimer)
})
</script>

<template>
  <section class="map-view">
    <header class="page-head">
      <div>
        <p class="page-head__eyebrow">// SPYDER_CORE · MAPA TÁCTICO</p>
        <h1>Centro de Mando Táctico</h1>
        <p class="page-head__sub">Vigilancia urbana // León activo</p>
      </div>

      <div class="page-head__actions">
        <button
          class="btn btn-secondary"
          type="button"
          :disabled="dibujandoZona"
          @click="iniciarDibujoZona"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m4 7 6-3 7 3 3 8-7 4-7-4Z" />
            <path d="M4 7v8l6 4M17 7v8" />
          </svg>
          {{ dibujandoZona ? 'Dibujando...' : 'Dibujar zona' }}
        </button>

        <button class="btn btn-primary" type="button" @click="abrirCreacionDesdeBoton">
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
          Nueva ubicación
        </button>
      </div>
    </header>

    <div class="map-layout">
      <section class="map-panel" aria-label="Mapa de ubicaciones y zonas">
        <BaseMap
          ref="baseMap"
          :markers="markers"
          :zones="zoneFeatures"
          :selected-id="selectedId"
          @map-click="abrirCreacion"
          @zone-drawn="alDibujarZona"
          @zone-draw-cancelled="cancelarDibujoZona"
        >
          <template #popup="{ marker }">
            <div v-if="marker" class="popup">
              <template v-if="popupEditId === marker.id">
                <form class="popup__form" novalidate @submit.prevent="guardarPopupEdicion(marker.data)">
                  <div class="form-field">
                    <label class="form-label" :for="`popup-nombre-${marker.id}`">Nombre</label>
                    <input
                      :id="`popup-nombre-${marker.id}`"
                      v-model="popupForm.name"
                      class="input"
                      :class="{ 'input--error': popupErrors.name }"
                      type="text"
                      maxlength="80"
                    />
                    <p v-if="popupErrors.name" class="field-error">{{ popupErrors.name }}</p>
                  </div>

                  <div class="form-field">
                    <label class="form-label" :for="`popup-descripcion-${marker.id}`">
                      Descripción
                    </label>
                    <textarea
                      :id="`popup-descripcion-${marker.id}`"
                      v-model="popupForm.description"
                      class="textarea"
                      :class="{ 'input--error': popupErrors.description }"
                      maxlength="500"
                    ></textarea>
                    <p v-if="popupErrors.description" class="field-error">
                      {{ popupErrors.description }}
                    </p>
                  </div>

                  <div class="form-field">
                    <label class="form-label" :for="`popup-categoria-${marker.id}`">
                      Categoría
                    </label>
                    <select
                      :id="`popup-categoria-${marker.id}`"
                      v-model="popupForm.category"
                      class="select"
                      :class="{ 'input--error': popupErrors.category }"
                    >
                      <option v-for="item in categorias" :key="item.value" :value="item.value">
                        {{ item.label }}
                      </option>
                    </select>
                    <p v-if="popupErrors.category" class="field-error">
                      {{ popupErrors.category }}
                    </p>
                  </div>

                  <div class="popup__actions">
                    <button
                      class="btn btn-ghost btn--sm"
                      type="button"
                      :disabled="guardandoPopup"
                      @click="cancelarEdicionPopup"
                    >
                      Cancelar
                    </button>
                    <button class="btn btn-primary btn--sm" type="submit" :disabled="guardandoPopup">
                      {{ guardandoPopup ? 'Guardando...' : 'Guardar cambios' }}
                    </button>
                  </div>
                </form>
              </template>

              <template v-else>
                <div class="popup__head">
                  <Chip
                    :label="categoryMeta(marker.data.category).label"
                    :variant="categoryMeta(marker.data.category).chip"
                    dot
                  />
                  <span class="popup__id">#{{ String(marker.id).slice(-6).toUpperCase() }}</span>
                </div>

                <h3 class="popup__title">{{ marker.data.name }}</h3>
                <p class="popup__description">{{ marker.data.description }}</p>

                <dl class="popup__meta">
                  <div>
                    <dt>Registrado por</dt>
                    <dd>{{ marker.data.createdBy?.name || '—' }}</dd>
                  </div>
                  <div>
                    <dt>Fecha</dt>
                    <dd>{{ formatDateTime(marker.data.createdAt) }}</dd>
                  </div>
                  <div>
                    <dt>Coordenadas</dt>
                    <dd>
                      {{ formatCoordinate(marker.data.point?.coordinates?.[1]) }},
                      {{ formatCoordinate(marker.data.point?.coordinates?.[0]) }}
                    </dd>
                  </div>
                </dl>

                <div class="popup__actions">
                  <button
                    class="btn btn-ghost btn--sm"
                    type="button"
                    @click="pedirEliminarUbicacion(marker.data)"
                  >
                    Eliminar
                  </button>
                  <button
                    class="btn btn-primary btn--sm"
                    type="button"
                    @click="iniciarEdicionPopup(marker.data)"
                  >
                    Editar
                  </button>
                </div>
              </template>
            </div>
          </template>
        </BaseMap>

        <p class="map-hint">
          <span class="map-hint__dot" aria-hidden="true"></span>
          {{
            dibujandoZona
              ? 'Dibuja el polígono y ciérralo en el primer punto.'
              : 'Haz clic en el mapa para registrar una ubicación.'
          }}
        </p>

        <div v-if="locations.loading" class="map-loading" role="status">
          <span class="spinner" aria-hidden="true"></span>
          Actualizando mapa...
        </div>
      </section>

      <aside class="zones-panel" aria-label="Zonas guardadas">
        <header class="zones-panel__head">
          <div>
            <p class="zones-panel__eyebrow">// Perímetro</p>
            <h2 class="zones-panel__title">Zonas guardadas</h2>
          </div>
          <span class="zones-panel__count">{{ zones.zones.length }}</span>
        </header>

        <p v-if="zones.loading" class="zones-panel__state">Cargando zonas...</p>

        <div v-else-if="zones.error" class="zones-panel__state zones-panel__state--error">
          <p>{{ zones.error.message }}</p>
          <button class="btn btn-ghost btn--sm" type="button" @click="cargarZonas">
            Reintentar
          </button>
        </div>

        <p v-else-if="zones.zones.length === 0" class="zones-panel__state">
          No hay zonas dibujadas todavía.
        </p>

        <ul v-else class="zones-list">
          <li
            v-for="zone in zones.zones"
            :key="zone.id"
            class="zone-item"
            :style="{ '--zone-color': riskColor(zone.riskLevel) }"
          >
            <div class="zone-item__top">
              <div class="zone-item__info">
                <p class="zone-item__name">{{ zone.name }}</p>
                <Chip
                  :label="riskMeta(zone.riskLevel).label"
                  :variant="riskMeta(zone.riskLevel).chip"
                  dot
                />
              </div>

              <button
                class="zone-item__delete"
                type="button"
                :aria-label="`Eliminar zona ${zone.name}`"
                @click="pedirEliminarZona(zone)"
              >
                ×
              </button>
            </div>

            <p v-if="zone.description" class="zone-item__desc">{{ zone.description }}</p>
          </li>
        </ul>

        <div class="zones-panel__footer">
          <button
            class="btn btn-secondary"
            type="button"
            :disabled="dibujandoZona"
            @click="iniciarDibujoZona"
          >
            {{ dibujandoZona ? 'Dibujando...' : 'Dibujar zona' }}
          </button>
        </div>
      </aside>
    </div>

    <section class="filters" aria-label="Filtros de ubicaciones">
      <div class="filters__field filters__field--search">
        <label class="form-label" for="filtro-busqueda">Buscar por nombre</label>
        <div class="filters__search">
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
            v-model="search"
            class="input"
            type="search"
            placeholder="Buscar por nombre de ubicación..."
            @input="alEscribirBusqueda"
          />
        </div>
      </div>

      <div class="filters__field">
        <label class="form-label" for="filtro-categoria">Categoría</label>
        <select
          id="filtro-categoria"
          v-model="category"
          class="select"
          @change="cargarUbicaciones"
        >
          <option value="all">Todas</option>
          <option v-for="item in categorias" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>

      <div class="filters__field">
        <label class="form-label" for="filtro-zona">Zona</label>
        <select
          id="filtro-zona"
          v-model="zoneFilter"
          class="select"
          @change="cargarUbicaciones"
        >
          <option value="all">Todas las zonas</option>
          <option v-for="zone in zones.zones" :key="zone.id" :value="zone.id">
            {{ zone.name }}
          </option>
        </select>
      </div>

      <button class="btn btn-ghost filters__clear" type="button" @click="limpiarFiltros">
        Limpiar filtros
      </button>
    </section>

    <section class="locations-panel" aria-label="Ubicaciones registradas">
      <header class="locations-panel__head">
        <div>
          <p class="locations-panel__eyebrow">// Registro</p>
          <h2 class="locations-panel__title">Ubicaciones registradas</h2>
        </div>
        <span class="locations-panel__meta">{{ locations.items.length }} resultado(s)</span>
      </header>

      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Latitud</th>
              <th>Longitud</th>
              <th>Registrado por</th>
              <th>Fecha</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="locations.loading">
              <td colspan="7" class="state-row">Cargando ubicaciones...</td>
            </tr>

            <tr v-else-if="locations.error">
              <td colspan="7" class="state-row state-row--error">
                <span>{{ locations.error.message }}</span>
                <button class="btn btn-ghost btn--sm" type="button" @click="cargarUbicaciones">
                  Reintentar
                </button>
              </td>
            </tr>

            <tr v-else-if="locations.items.length === 0">
              <td colspan="7" class="state-row">Sin resultados para los filtros seleccionados.</td>
            </tr>

            <template v-else>
              <tr
                v-for="location in locations.items"
                :key="location.id"
                class="location-row"
                :class="{ 'location-row--selected': selectedId === location.id }"
                tabindex="0"
                @click="seleccionarUbicacion(location)"
                @keydown.enter="seleccionarUbicacion(location)"
              >
                <td class="cell-name">{{ location.name }}</td>
                <td class="cell-desc">{{ location.description }}</td>
                <td>
                  <Chip
                    :label="categoryMeta(location.category).label"
                    :variant="categoryMeta(location.category).chip"
                  />
                </td>
                <td class="cell-mono">{{ formatCoordinate(location.point?.coordinates?.[1]) }}</td>
                <td class="cell-mono">{{ formatCoordinate(location.point?.coordinates?.[0]) }}</td>
                <td>{{ location.createdBy?.name || '—' }}</td>
                <td class="cell-date">{{ formatDateTime(location.createdAt) }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>

    <Modal
      :open="crearAbierto"
      title="Registrar ubicación"
      eyebrow="Nueva entrada"
      subtitle="Completa los datos del punto seleccionado en el mapa."
      :close-on-backdrop="!creando"
      @close="cerrarCreacion"
    >
      <form id="form-crear-ubicacion" class="form-stack" novalidate @submit.prevent="guardarUbicacion">
        <div class="form-field">
          <label class="form-label" for="crear-nombre">Nombre</label>
          <input
            id="crear-nombre"
            v-model="crearForm.name"
            class="input"
            :class="{ 'input--error': crearErrors.name }"
            type="text"
            maxlength="80"
            placeholder="Nombre de la ubicación"
          />
          <p v-if="crearErrors.name" class="field-error">{{ crearErrors.name }}</p>
        </div>

        <div class="form-field">
          <label class="form-label" for="crear-descripcion">Descripción</label>
          <textarea
            id="crear-descripcion"
            v-model="crearForm.description"
            class="textarea"
            :class="{ 'input--error': crearErrors.description }"
            maxlength="500"
            placeholder="Describe qué ocurre en este punto"
          ></textarea>
          <p v-if="crearErrors.description" class="field-error">{{ crearErrors.description }}</p>
          <p class="form-hint">
            {{ crearForm.description.trim().length }}/500 caracteres · mínimo 10
          </p>
        </div>

        <div class="form-field">
          <label class="form-label" for="crear-categoria">Categoría</label>
          <select
            id="crear-categoria"
            v-model="crearForm.category"
            class="select"
            :class="{ 'input--error': crearErrors.category }"
          >
            <option v-for="item in categorias" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
          <p v-if="crearErrors.category" class="field-error">{{ crearErrors.category }}</p>
        </div>

        <div class="form-grid">
          <div class="form-field">
            <label class="form-label" for="crear-latitud">Latitud</label>
            <input
              id="crear-latitud"
              class="input input--readonly"
              :value="formatCoordinate(crearForm.latitude)"
              readonly
            />
          </div>

          <div class="form-field">
            <label class="form-label" for="crear-longitud">Longitud</label>
            <input
              id="crear-longitud"
              class="input input--readonly"
              :value="formatCoordinate(crearForm.longitude)"
              readonly
            />
          </div>
        </div>

        <p class="form-hint">Las coordenadas provienen del punto seleccionado en el mapa.</p>
      </form>

      <template #footer>
        <button class="btn btn-ghost" type="button" :disabled="creando" @click="cerrarCreacion">
          Cancelar
        </button>
        <button
          class="btn btn-primary"
          type="submit"
          form="form-crear-ubicacion"
          :disabled="creando"
        >
          {{ creando ? 'Registrando...' : 'Registrar ubicación' }}
        </button>
      </template>
    </Modal>

    <Modal
      :open="zonaAbierta"
      title="Guardar zona"
      eyebrow="Perímetro dibujado"
      subtitle="El polígono se enviará al backend como GeoJSON."
      :close-on-backdrop="!creandoZona"
      @close="cerrarZona"
    >
      <form id="form-zona" class="form-stack" novalidate @submit.prevent="guardarZona">
        <div class="form-field">
          <label class="form-label" for="zona-nombre">Nombre</label>
          <input
            id="zona-nombre"
            v-model="zonaForm.name"
            class="input"
            :class="{ 'input--error': zonaErrors.name }"
            type="text"
            maxlength="80"
            placeholder="Nombre de la zona"
          />
          <p v-if="zonaErrors.name" class="field-error">{{ zonaErrors.name }}</p>
        </div>

        <div class="form-field">
          <label class="form-label" for="zona-descripcion">Descripción (opcional)</label>
          <textarea
            id="zona-descripcion"
            v-model="zonaForm.description"
            class="textarea"
            :class="{ 'input--error': zonaErrors.description }"
            maxlength="500"
            placeholder="Describe el perímetro o su nivel de riesgo"
          ></textarea>
          <p v-if="zonaErrors.description" class="field-error">{{ zonaErrors.description }}</p>
        </div>

        <div class="form-field">
          <label class="form-label" for="zona-riesgo">Nivel de riesgo</label>
          <select
            id="zona-riesgo"
            v-model="zonaForm.riskLevel"
            class="select"
            :class="{ 'input--error': zonaErrors.riskLevel }"
          >
            <option v-for="item in riesgos" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
          <p v-if="zonaErrors.riskLevel" class="field-error">{{ zonaErrors.riskLevel }}</p>
        </div>

        <p v-if="zonaErrors.area" class="field-error">{{ zonaErrors.area }}</p>
      </form>

      <template #footer>
        <button class="btn btn-ghost" type="button" :disabled="creandoZona" @click="cerrarZona">
          Cancelar
        </button>
        <button class="btn btn-primary" type="submit" form="form-zona" :disabled="creandoZona">
          {{ creandoZona ? 'Guardando...' : 'Guardar zona' }}
        </button>
      </template>
    </Modal>

    <ConfirmModal
      :open="Boolean(eliminarUbicacion)"
      title="Eliminar ubicación"
      :message="`¿Seguro que deseas eliminar &quot;${eliminarUbicacion?.name || ''}&quot;?`"
      :details="[
        'Se eliminarán en cascada sus avistamientos y crímenes asociados.',
        'Los villanos que la usaban como guarida perderán esa referencia.',
      ]"
      :loading="eliminandoUbicacion"
      @confirm="confirmarEliminarUbicacion"
      @cancel="cancelarEliminarUbicacion"
    />

    <ConfirmModal
      :open="Boolean(eliminarZona)"
      title="Eliminar zona"
      :message="`¿Seguro que deseas eliminar la zona &quot;${eliminarZona?.name || ''}&quot;?`"
      details="El polígono desaparecerá del mapa. Las ubicaciones registradas no se eliminan."
      :loading="eliminandoZona"
      @confirm="confirmarEliminarZona"
      @cancel="cancelarEliminarZona"
    />
  </section>
</template>

<style scoped>
.map-view {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.page-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.page-head__eyebrow,
.zones-panel__eyebrow,
.locations-panel__eyebrow {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.page-head h1 {
  margin-top: 0.25rem;
  font-size: clamp(1.45rem, 2.8vw, 2.15rem);
  letter-spacing: 0.1em;
}

.page-head__sub {
  margin-top: 0.35rem;
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.page-head__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.page-head__actions svg {
  width: 16px;
  height: 16px;
}

/* ---------- Mapa y panel de zonas ---------- */
.map-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 285px;
  gap: 1rem;
  align-items: stretch;
}

.map-panel {
  position: relative;
  height: clamp(440px, 56vh, 620px);
  overflow: hidden;
  background: var(--color-surface);
  border: var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
}

.map-hint {
  position: absolute;
  bottom: 1.1rem;
  left: 0.9rem;
  z-index: 450;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  max-width: calc(100% - 1.8rem);
  padding: 0.45rem 0.65rem;
  background: rgba(19, 35, 92, 0.9);
  border: 1px solid rgba(127, 196, 238, 0.35);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  line-height: 1.35;
  pointer-events: none;
}

.map-hint__dot {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  background: var(--color-accent);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--color-accent);
}

.map-loading {
  position: absolute;
  top: 0.9rem;
  right: 0.9rem;
  z-index: 450;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.65rem;
  background: rgba(19, 35, 92, 0.9);
  border: var(--border);
  border-radius: var(--radius-pill);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  pointer-events: none;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-border-strong);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: girar 700ms linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

/* ---------- Zonas ---------- */
.zones-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: var(--color-surface);
  border: var(--border);
  border-radius: var(--radius-lg);
}

.zones-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.9rem 1rem;
  border-bottom: var(--border);
}

.zones-panel__title {
  margin-top: 0.2rem;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
}

.zones-panel__count {
  display: grid;
  min-width: 26px;
  height: 26px;
  place-items: center;
  padding: 0 0.35rem;
  background: var(--color-accent-soft);
  border: 1px solid rgba(127, 196, 238, 0.35);
  border-radius: var(--radius-pill);
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.68rem;
}

.zones-panel__state {
  padding: 1rem;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  line-height: 1.4;
}

.zones-panel__state--error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  color: #ffb4b6;
}

.zones-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.7rem;
  overflow-y: auto;
}

.zone-item {
  padding: 0.65rem 0.7rem;
  background: var(--color-bg-soft);
  border: var(--border);
  border-left: 3px solid var(--zone-color);
  border-radius: var(--radius-sm);
}

.zone-item__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.zone-item__info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  min-width: 0;
}

.zone-item__name {
  overflow: hidden;
  color: var(--color-text);
  font-size: 0.82rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.zone-item__desc {
  display: -webkit-box;
  margin-top: 0.35rem;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.zone-item__delete {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--color-text-dim);
  font-size: 1rem;
  line-height: 1;
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition);
}

.zone-item__delete:hover {
  background: var(--color-danger-soft);
  border-color: rgba(255, 92, 92, 0.4);
  color: var(--color-danger);
}

.zones-panel__footer {
  padding: 0.7rem;
  border-top: var(--border);
}

.zones-panel__footer .btn {
  width: 100%;
}

/* ---------- Filtros ---------- */
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--color-surface);
  border: var(--border);
  border-radius: var(--radius-lg);
}

.filters__field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.filters__field--search {
  flex: 1 1 260px;
  min-width: 200px;
}

.filters__search {
  position: relative;
}

.filters__search svg {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  width: 16px;
  height: 16px;
  color: var(--color-text-dim);
  transform: translateY(-50%);
  pointer-events: none;
}

.filters__search .input {
  padding-left: 2.35rem;
}

.filters__field .select {
  min-width: 170px;
}

.filters__clear {
  margin-left: auto;
}

/* ---------- Tabla ---------- */
.locations-panel {
  overflow: hidden;
  background: var(--color-surface);
  border: var(--border);
  border-radius: var(--radius-lg);
}

.locations-panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-bottom: var(--border);
}

.locations-panel__title {
  margin-top: 0.2rem;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
}

.locations-panel__meta {
  color: var(--color-text-dim);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.table-scroll {
  max-height: 360px;
  overflow: auto;
}

.table-scroll .data-table {
  min-width: 920px;
}

.table-scroll .data-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
}

.location-row {
  cursor: pointer;
  transition: background var(--transition);
}

.location-row:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.location-row--selected {
  background: var(--color-accent-soft);
}

.location-row--selected td:first-child {
  box-shadow: inset 3px 0 0 var(--color-accent);
}

.cell-name {
  min-width: 150px;
  font-weight: 600;
}

.cell-desc {
  max-width: 330px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  line-height: 1.35;
}

.cell-mono {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  white-space: nowrap;
}

.cell-date {
  color: var(--color-text-muted);
  font-size: 0.76rem;
  white-space: nowrap;
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

/* ---------- Popup ---------- */
.popup {
  min-width: 255px;
  padding: 0.9rem;
  color: var(--color-text);
  font-family: var(--font-body);
}

.popup__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.popup__id {
  color: var(--color-text-dim);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.05em;
}

.popup__title {
  margin-bottom: 0.35rem;
  font-size: 1rem;
  letter-spacing: 0.04em;
}

.popup__description {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  line-height: 1.4;
}

.popup__meta {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.6rem 0;
  margin: 0.75rem 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.popup__meta div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.popup__meta dt {
  color: var(--color-text-dim);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.popup__meta dd {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  text-align: right;
}

.popup__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.45rem;
}

.popup__form {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.popup__form .form-label {
  font-size: 0.6rem;
}

.popup__form .input,
.popup__form .select,
.popup__form .textarea {
  min-height: 34px;
  padding: 0.42rem 0.55rem;
  font-size: 0.8rem;
}

.popup__form .textarea {
  min-height: 70px;
}

/* ---------- Formularios de modal ---------- */
.form-stack {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.form-hint {
  color: var(--color-text-dim);
  font-size: 0.7rem;
  line-height: 1.35;
}

.field-error {
  color: #ff8a8e;
  font-size: 0.72rem;
  line-height: 1.35;
}

.input--readonly {
  background: var(--color-bg-soft);
  color: var(--color-text-muted);
  cursor: default;
}

/* ---------- Responsivo ---------- */
@media (max-width: 1100px) {
  .map-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .zones-panel {
    max-height: 300px;
  }

  .zones-list {
    max-height: 190px;
  }
}

@media (max-width: 680px) {
  .page-head__actions {
    width: 100%;
  }

  .page-head__actions .btn {
    flex: 1 1 auto;
  }

  .map-panel {
    height: 430px;
  }

  .filters__field,
  .filters__field--search {
    flex: 1 1 100%;
  }

  .filters__field .select {
    min-width: 0;
  }

  .filters__clear {
    width: 100%;
    margin-left: 0;
  }

  .form-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
