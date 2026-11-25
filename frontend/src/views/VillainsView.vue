<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api/axios'
import { useAlertsStore } from '@/stores/alerts'
import { getErrorMessage } from '@/utils/errors'
import BaseMap from '@/components/map/BaseMap.vue'
import Chip from '@/components/Chip.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import VillainBadge from '@/components/villains/VillainBadge.vue'
import VillainDetailPanel from '@/components/villains/VillainDetailPanel.vue'
import VillainFormModal from '@/components/villains/VillainFormModal.vue'
import { toLeaflet } from '@/utils/coordinates'
import { categoryColor, categoryMeta } from '@/utils/mapConfig'
import {
  THREAT_OPTIONS,
  VILLAIN_STATUS_OPTIONS,
  threatMeta,
  villainStatusMeta,
} from '@/utils/villainConfig'
const alerts = useAlertsStore()

/* ---------- Lista y estado de carga ---------- */
const villanos = ref([])
const cargando = ref(false)
// Cuando falle la carga: { message, details } (ver utils/errors.js).
const error = ref(null)

/* ---------- Filtros (query params de GET /villains) ---------- */
const busqueda = ref('')
const amenaza = ref('all')
const estado = ref('all')

// Espera a que el usuario deje de escribir antes de pedir la lista.
let timerBusqueda = null

function cargarVillanos() {
  clearTimeout(timerBusqueda)
  timerBusqueda = setTimeout(pedirVillanos, 300)
}

// GET /villains?search=&threatLevel=&status=. El filtrado lo hace el backend.
async function pedirVillanos() {
  cargando.value = true
  error.value = null

  try {
    const { data } = await api.get('/villains', {
      params: { search: busqueda.value.trim(), threatLevel: amenaza.value, status: estado.value },
    })
    villanos.value = data

    // Si el seleccionado ya no está en la lista, se selecciona el primero.
    if (!data.some((villano) => villano.id === seleccionadoId.value)) {
      seleccionadoId.value = null
      if (data[0]) seleccionarVillano(data[0])
    }
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    cargando.value = false
  }
}

/* ---------- Villano seleccionado (detalle + mapa) ---------- */
const seleccionadoId = ref(null)
const cargandoDetalle = ref(false)
// Historial de crímenes del villano seleccionado (viene de GET /villains/:id).
const crimenesSeleccionado = ref([])

const seleccionado = computed(() => {
  const villano = villanos.value.find((item) => item.id === seleccionadoId.value)
  return villano ? { ...villano, crimes: crimenesSeleccionado.value } : null
})

async function seleccionarVillano(villano) {
  seleccionadoId.value = villano.id
  crimenesSeleccionado.value = []
  cargandoDetalle.value = true

  try {
    const { data } = await api.get(`/villains/${villano.id}`)
    // Evita pintar el detalle de otro villano si el usuario ya cambió la selección.
    if (seleccionadoId.value === villano.id) {
      crimenesSeleccionado.value = data.crimes || []
    }
  } catch (err) {
    mostrarError(err)
  } finally {
    cargandoDetalle.value = false
  }
}

function mostrarError(err) {
  const { message, details } = getErrorMessage(err)
  alerts.error(message, details)
}

onMounted(() => {
  pedirVillanos()
  cargarGuaridas()
})

// Marcadores de guaridas del villano seleccionado (formato que pide BaseMap).
const marcadoresGuaridas = computed(() =>
  (seleccionado.value?.knownLocations || [])
    .map((guarida) => ({
      id: guarida.id,
      latlng: toLeaflet(guarida.point),
      category: 'guarida',
      color: categoryColor('guarida'),
      data: guarida,
    }))
    .filter((marcador) => marcador.latlng),
)

/* ---------- Crear / editar ---------- */
const formAbierto = ref(false)
const villanoEditando = ref(null)
const guardando = ref(false)
// Errores por campo del formulario. Ej: { name: 'Ya existe un villano con ese nombre' }.
const erroresForm = ref({})
// Solo ubicaciones de categoría "guarida" (el backend rechaza otras).
const guaridasDisponibles = ref([])

async function cargarGuaridas() {
  try {
    const { data } = await api.get('/locations', { params: { category: 'guarida' } })
    guaridasDisponibles.value = data
  } catch (err) {
    mostrarError(err)
  }
}

function abrirCrear() {
  villanoEditando.value = null
  erroresForm.value = {}
  formAbierto.value = true
}

function abrirEditar(villano) {
  villanoEditando.value = villano
  erroresForm.value = {}
  formAbierto.value = true
}

function cerrarForm() {
  formAbierto.value = false
}

// El modal entrega el cuerpo listo: { name, alias, history, powers,
// threatLevel, status, knownLocations: [ids] }.
async function guardarVillano(payload) {
  guardando.value = true
  erroresForm.value = {}

  try {
    const editando = villanoEditando.value
    const { data } = editando
      ? await api.patch(`/villains/${editando.id}`, payload)
      : await api.post('/villains', payload)

    alerts.success(`Villano "${data.name}" guardado correctamente.`)
    cerrarForm()
    await pedirVillanos()
    seleccionarVillano(data)
  } catch (err) {
    // 409 = ya existe un villano con ese nombre.
    if (err.response?.status === 409) {
      erroresForm.value = { name: getErrorMessage(err).message }
    }
    mostrarError(err)
  } finally {
    guardando.value = false
  }
}

/* ---------- Eliminar ---------- */
const villanoAEliminar = ref(null)
const eliminando = ref(false)

function pedirEliminar(villano) {
  villanoAEliminar.value = villano
}

function cancelarEliminar() {
  villanoAEliminar.value = null
}

async function confirmarEliminar() {
  const villano = villanoAEliminar.value
  if (!villano) return

  eliminando.value = true

  try {
    // Sus crímenes se conservan, pero quedan sin villano asignado.
    await api.delete(`/villains/${villano.id}`)
    alerts.success(`Villano "${villano.name}" eliminado correctamente.`)
    villanoAEliminar.value = null
    await pedirVillanos()
  } catch (err) {
    mostrarError(err)
  } finally {
    eliminando.value = false
  }
}

/* ---------- Ayudas para la tabla ---------- */
const PODERES_VISIBLES = 2

function poderesVisibles(villano) {
  return (villano.powers || []).slice(0, PODERES_VISIBLES)
}

function poderesOcultos(villano) {
  return Math.max((villano.powers || []).length - PODERES_VISIBLES, 0)
}

function textoGuaridas(villano) {
  const guaridas = villano.knownLocations || []

  if (guaridas.length === 0) {
    return 'Sin guarida'
  }

  return guaridas.length === 1 ? guaridas[0].name : `${guaridas.length} guaridas`
}
</script>

<template>
  <section class="villains-view">
    <header class="page-head">
      <div class="page-head__title">
        <span class="page-head__icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 3a8 8 0 0 0-8 8c0 2.6 1.2 4.5 3 5.8V20h10v-3.2c1.8-1.3 3-3.2 3-5.8a8 8 0 0 0-8-8Z" />
            <circle cx="9" cy="11.5" r="1.4" />
            <circle cx="15" cy="11.5" r="1.4" />
            <path d="M10.5 16.5v2M13.5 16.5v2" />
          </svg>
        </span>

        <div>
          <h1>Villanos</h1>
          <p class="page-head__sub">Base de datos de hostiles metropolitanos</p>
        </div>
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
        Nuevo villano
      </button>
    </header>

    <div class="villains-layout">
      <section class="map-panel" aria-label="Mapa de guaridas del villano seleccionado">
        <BaseMap :markers="marcadoresGuaridas">
          <template #popup="{ marker }">
            <div v-if="marker" class="hideout-popup">
              <Chip
                :label="categoryMeta(marker.data.category).label"
                :variant="categoryMeta(marker.data.category).chip"
                dot
              />
              <h3>{{ marker.data.name }}</h3>
              <p v-if="seleccionado">{{ seleccionado.name }}</p>
            </div>
          </template>
        </BaseMap>

        <div class="map-overlay">
          <p class="map-overlay__title">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21Z" />
              <circle cx="12" cy="9.5" r="2.4" />
            </svg>
            Mapa táctico de guaridas
            <span>(Solo consulta)</span>
          </p>

          <p v-if="marcadoresGuaridas.length === 0" class="map-overlay__warning">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 4 3 20h18L12 4Z" />
              <path d="M12 10v5M12 17.5v.5" />
            </svg>
            {{
              seleccionado
                ? 'Este villano no tiene guaridas registradas'
                : 'Selecciona un villano para ver sus guaridas'
            }}
          </p>
        </div>

        <p class="map-legend">
          <span class="map-legend__label">Leyenda:</span>
          <span class="map-legend__item">
            <i :style="{ background: categoryColor('guarida') }"></i>
            Guarida conocida
          </span>
        </p>
      </section>

      <VillainDetailPanel
        :villain="seleccionado"
        :loading="cargandoDetalle"
        @edit="abrirEditar"
      />
    </div>

    <section class="filters" aria-label="Filtros de villanos">
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
          v-model="busqueda"
          class="input"
          type="search"
          placeholder="Buscar por nombre o alias..."
          aria-label="Buscar por nombre o alias"
          @input="cargarVillanos"
        />
      </div>

      <label class="filters__select">
        <span>Amenaza:</span>
        <select v-model="amenaza" class="select" @change="cargarVillanos">
          <option value="all">Todas</option>
          <option v-for="item in THREAT_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </label>

      <label class="filters__select">
        <span>Estado:</span>
        <select v-model="estado" class="select" @change="cargarVillanos">
          <option value="all">Todos</option>
          <option v-for="item in VILLAIN_STATUS_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </label>

      <p class="filters__count">
        <span aria-hidden="true"></span>
        {{ villanos.length }} {{ villanos.length === 1 ? 'villano encontrado' : 'villanos encontrados' }}
      </p>
    </section>

    <section class="table-panel" aria-label="Villanos registrados">
      <header class="table-panel__head">
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
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M4 10h16M10 10v10" />
          </svg>
          Villanos registrados
        </h2>
      </header>

      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Alias</th>
              <th>Amenaza</th>
              <th>Estado</th>
              <th>Poderes</th>
              <th>Guaridas</th>
              <th class="col-actions">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="cargando">
              <td colspan="7" class="state-row">Cargando villanos...</td>
            </tr>

            <tr v-else-if="error">
              <td colspan="7" class="state-row state-row--error">
                <span>{{ error.message }}</span>
                <button class="btn btn-ghost btn--sm" type="button" @click="cargarVillanos">
                  Reintentar
                </button>
              </td>
            </tr>

            <tr v-else-if="villanos.length === 0">
              <td colspan="7" class="state-row">No hay villanos para los filtros seleccionados.</td>
            </tr>

            <template v-else>
              <tr
                v-for="villano in villanos"
                :key="villano.id"
                class="villain-row"
                :class="{ 'villain-row--selected': seleccionadoId === villano.id }"
                tabindex="0"
                @click="seleccionarVillano(villano)"
                @keydown.enter="seleccionarVillano(villano)"
              >
                <td class="cell-name">{{ villano.name }}</td>
                <td class="cell-alias">{{ villano.alias || '—' }}</td>
                <td>
                  <VillainBadge
                    :label="threatMeta(villano.threatLevel).label"
                    :color="threatMeta(villano.threatLevel).color"
                    :solid="threatMeta(villano.threatLevel).solid"
                  />
                </td>
                <td>
                  <Chip
                    :label="villainStatusMeta(villano.status).label"
                    :variant="villainStatusMeta(villano.status).chip"
                  />
                </td>
                <td>
                  <ul class="cell-powers">
                    <li v-for="poder in poderesVisibles(villano)" :key="poder">{{ poder }}</li>
                    <li v-if="poderesOcultos(villano)" class="cell-powers__more">
                      +{{ poderesOcultos(villano) }}
                    </li>
                    <li v-if="!villano.powers?.length" class="cell-powers__none">—</li>
                  </ul>
                </td>
                <td
                  class="cell-hideouts"
                  :class="{ 'cell-hideouts--link': villano.knownLocations?.length > 1 }"
                >
                  {{ textoGuaridas(villano) }}
                </td>
                <td class="col-actions">
                  <div class="row-actions">
                    <button
                      class="icon-btn"
                      type="button"
                      :aria-label="`Editar a ${villano.name}`"
                      @click.stop="abrirEditar(villano)"
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
                      :aria-label="`Eliminar a ${villano.name}`"
                      @click.stop="pedirEliminar(villano)"
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

      <footer class="table-panel__foot">
        <span class="table-panel__sync">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3M18 3v4h-4M6 21v-4h4" />
          </svg>
          Sincronización activa con Central de Policía
        </span>

        <span class="table-panel__total">
          Mostrando {{ villanos.length }} de {{ villanos.length }} registros
          <button type="button" @click="cargarVillanos">Recargar lista</button>
        </span>
      </footer>
    </section>

    <VillainFormModal
      :open="formAbierto"
      :villain="villanoEditando"
      :hideouts="guaridasDisponibles"
      :saving="guardando"
      :errors="erroresForm"
      @close="cerrarForm"
      @submit="guardarVillano"
    />

    <ConfirmModal
      :open="Boolean(villanoAEliminar)"
      title="Eliminar villano"
      :message="`¿Seguro que deseas eliminar a &quot;${villanoAEliminar?.name || ''}&quot;?`"
      details="Sus crímenes se conservan en el historial, pero quedarán sin villano asignado."
      :loading="eliminando"
      @confirm="confirmarEliminar"
      @cancel="cancelarEliminar"
    />
  </section>
</template>

<style scoped>
.villains-view {
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

.page-head__title {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.page-head__icon {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  background: var(--color-brand-soft);
  border: 1px solid rgba(255, 90, 95, 0.4);
  border-radius: var(--radius-md);
  color: var(--color-brand);
}

.page-head__icon svg {
  width: 24px;
  height: 24px;
}

.page-head h1 {
  font-size: clamp(1.45rem, 2.8vw, 2.15rem);
  letter-spacing: 0.1em;
}

.page-head__sub {
  margin-top: 0.25rem;
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

/* ---------- Mapa + detalle ---------- */
.villains-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 1rem;
  align-items: stretch;
}

.map-panel {
  position: relative;
  min-height: 460px;
  overflow: hidden;
  background: var(--color-surface);
  border: var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
}

.map-panel :deep(.base-map) {
  position: absolute;
  inset: 0;
}

.map-overlay {
  position: absolute;
  top: 0.8rem;
  left: 0.8rem;
  z-index: 450;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-width: calc(100% - 4rem);
  pointer-events: none;
}

.map-overlay__title,
.map-overlay__warning {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: fit-content;
  padding: 0.4rem 0.65rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  line-height: 1.35;
  text-transform: uppercase;
}

.map-overlay__title {
  background: rgba(8, 15, 26, 0.92);
  border: 1px solid rgba(62, 199, 223, 0.35);
  color: var(--color-text);
}

.map-overlay__title span {
  color: var(--color-text-dim);
  text-transform: none;
}

.map-overlay__title svg {
  color: var(--color-accent);
}

.map-overlay__warning {
  background: rgba(40, 28, 8, 0.94);
  border: 1px solid rgba(242, 181, 68, 0.45);
  color: var(--color-warning);
  text-transform: none;
}

.map-overlay svg {
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
}

.map-legend {
  position: absolute;
  bottom: 1.1rem;
  left: 0.8rem;
  z-index: 450;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.4rem 0.65rem;
  background: rgba(8, 15, 26, 0.92);
  border: var(--border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.05em;
  pointer-events: none;
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

.hideout-popup {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  min-width: 200px;
  padding: 0.85rem;
}

.hideout-popup h3 {
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: none;
}

.hideout-popup p {
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

/* ---------- Filtros ---------- */
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  background: var(--color-surface);
  border: var(--border);
  border-radius: var(--radius-lg);
}

.filters__search {
  position: relative;
  flex: 1 1 260px;
  min-width: 200px;
}

.filters__search svg {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  width: 16px;
  height: 16px;
  color: var(--color-accent);
  transform: translateY(-50%);
  pointer-events: none;
}

.filters__search .input {
  padding-left: 2.35rem;
}

.filters__select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 0.75rem;
  background: var(--color-surface-2);
  border: var(--border);
  border-radius: var(--radius-sm);
}

.filters__select span {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.64rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.filters__select .select {
  min-width: 120px;
  background: transparent;
  border: 0;
  box-shadow: none;
}

.filters__count {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-left: auto;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.64rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.filters__count span {
  width: 6px;
  height: 6px;
  background: var(--color-accent);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--color-accent);
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
  padding: 0.85rem 1rem;
  border-bottom: var(--border);
}

.table-panel__head h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
}

.table-panel__head svg {
  width: 18px;
  height: 18px;
  color: var(--color-accent);
}

.table-scroll {
  max-height: 420px;
  overflow: auto;
}

.table-scroll .data-table {
  min-width: 900px;
}

.table-scroll .data-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
}

.villain-row {
  cursor: pointer;
  transition: background var(--transition);
}

.villain-row td {
  vertical-align: middle;
}

.villain-row:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.villain-row--selected {
  background: var(--color-accent-soft);
}

.villain-row--selected td:first-child {
  box-shadow: inset 3px 0 0 var(--color-accent);
}

.cell-name {
  min-width: 150px;
  font-weight: 600;
}

.cell-alias {
  color: var(--color-brand);
  font-weight: 600;
}

.cell-powers {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  max-width: 260px;
}

.cell-powers li {
  padding: 0.12rem 0.45rem;
  background: var(--color-surface-3);
  border: var(--border);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  white-space: nowrap;
}

.cell-powers .cell-powers__more {
  color: var(--color-accent);
}

.cell-powers .cell-powers__none {
  padding: 0;
  background: transparent;
  border: 0;
  color: var(--color-text-dim);
}

.cell-hideouts {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  white-space: nowrap;
}

.cell-hideouts--link {
  color: var(--color-accent);
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
    border-color var(--transition),
    color var(--transition);
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

.table-panel__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: var(--color-bg-soft);
  border-top: var(--border);
  color: var(--color-text-dim);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.05em;
}

.table-panel__sync,
.table-panel__total {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-panel__sync svg {
  width: 13px;
  height: 13px;
  color: var(--color-accent);
}

.table-panel__total button {
  padding: 0;
  background: transparent;
  border: 0;
  color: var(--color-accent);
  font: inherit;
  letter-spacing: inherit;
}

.table-panel__total button:hover {
  text-decoration: underline;
}

/* ---------- Responsivo ---------- */
@media (max-width: 1100px) {
  .villains-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .map-panel {
    min-height: 380px;
  }
}

@media (max-width: 680px) {
  .page-head .btn {
    width: 100%;
  }

  .filters__select,
  .filters__search {
    flex: 1 1 100%;
  }

  .filters__select .select {
    flex: 1;
  }

  .filters__count {
    margin-left: 0;
  }

  .table-panel__foot {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
