<script setup>
import { computed, reactive, ref, watch } from 'vue'
import Modal from '@/components/Modal.vue'
import { CRIME_STATUS_OPTIONS, SEVERITY_OPTIONS, TYPE_OPTIONS } from '@/utils/crimeConfig'
import { formatDateTime } from '@/utils/dates'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  // null = crear. Con un crimen = editar (precarga el formulario).
  crime: {
    type: Object,
    default: null,
  },
  // Ubicaciones de categoría "crimen": [{ id, name }].
  locations: {
    type: Array,
    default: () => [],
  },
  // Villanos para el selector opcional: [{ id, name, alias }].
  villains: {
    type: Array,
    default: () => [],
  },
  // Avistamientos para el selector opcional: [{ id, seenAt, notes }].
  sightings: {
    type: Array,
    default: () => [],
  },
  saving: {
    type: Boolean,
    default: false,
  },
  // Errores por campo. Ej: { description: 'Mínimo 10 caracteres' }.
  errors: {
    type: Object,
    default: () => ({}),
  },
})

// 'submit' entrega el cuerpo listo para POST / PATCH /crimes.
const emit = defineEmits(['close', 'submit'])

const esEdicion = computed(() => Boolean(props.crime))

const form = reactive({
  location: '',
  type: 'asalto',
  severity: 'media',
  status: 'reportado',
  occurredAt: '',
  description: '',
  villain: '',
  sighting: '',
})

// Fecha máxima del input: el backend no acepta fechas futuras.
const ahora = ref('')

// Convierte una fecha ISO al formato de <input type="datetime-local"> (hora local).
function aInputLocal(valor) {
  const fecha = valor ? new Date(valor) : null

  if (!fecha || Number.isNaN(fecha.getTime())) {
    return ''
  }

  const dos = (numero) => String(numero).padStart(2, '0')

  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}T${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`
}

function cargarFormulario() {
  const crimen = props.crime

  ahora.value = aInputLocal(new Date())

  // El backend espera ids, no los objetos poblados.
  form.location = crimen?.location?.id || ''
  form.type = crimen?.type || 'asalto'
  form.severity = crimen?.severity || 'media'
  form.status = crimen?.status || 'reportado'
  form.occurredAt = aInputLocal(crimen?.occurredAt)
  form.description = crimen?.description || ''
  form.villain = crimen?.villain?.id || ''
  form.sighting = crimen?.sighting?.id || ''
}

watch(
  () => props.open,
  (abierto) => {
    if (abierto) {
      cargarFormulario()
    }
  },
  { immediate: true },
)

function textoAvistamiento(avistamiento) {
  const notas = (avistamiento.notes || '').slice(0, 40)
  return `${formatDateTime(avistamiento.seenAt)} · ${notas}`
}

function enviar() {
  emit('submit', {
    location: form.location,
    type: form.type,
    description: form.description.trim(),
    // El backend pide fecha ISO 8601.
    occurredAt: form.occurredAt ? new Date(form.occurredAt).toISOString() : '',
    severity: form.severity,
    status: form.status,
    // null = sin relación (el backend lo acepta tanto al crear como al editar).
    villain: form.villain || null,
    sighting: form.sighting || null,
  })
}

function cerrar() {
  if (!props.saving) {
    emit('close')
  }
}
</script>

<template>
  <Modal
    :open="open"
    :title="esEdicion ? 'Editar crimen' : 'Registrar crimen'"
    :eyebrow="esEdicion ? 'Modificar incidente' : 'Nuevo incidente'"
    subtitle="Completa los datos del incidente. Los campos con * son obligatorios."
    size="lg"
    :close-on-backdrop="!saving"
    @close="cerrar"
  >
    <form id="form-crimen" class="form-stack" novalidate @submit.prevent="enviar">
      <div class="form-field">
        <label class="form-label" for="crimen-ubicacion">Ubicación *</label>
        <select
          id="crimen-ubicacion"
          v-model="form.location"
          class="select"
          :class="{ 'input--error': errors.location }"
        >
          <option value="" disabled>Selecciona una ubicación</option>
          <option v-for="ubicacion in locations" :key="ubicacion.id" :value="ubicacion.id">
            {{ ubicacion.name }}
          </option>
        </select>
        <p v-if="errors.location" class="field-error">{{ errors.location }}</p>
        <p class="form-hint">
          {{
            locations.length
              ? 'Solo aparecen ubicaciones de categoría Crimen.'
              : 'No hay ubicaciones de categoría Crimen. Regístrala primero en el mapa.'
          }}
        </p>
      </div>

      <div class="form-grid">
        <div class="form-field">
          <label class="form-label" for="crimen-tipo">Tipo *</label>
          <select
            id="crimen-tipo"
            v-model="form.type"
            class="select"
            :class="{ 'input--error': errors.type }"
          >
            <option v-for="item in TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
          <p v-if="errors.type" class="field-error">{{ errors.type }}</p>
        </div>

        <div class="form-field">
          <label class="form-label" for="crimen-gravedad">Gravedad *</label>
          <select
            id="crimen-gravedad"
            v-model="form.severity"
            class="select"
            :class="{ 'input--error': errors.severity }"
          >
            <option v-for="item in SEVERITY_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
          <p v-if="errors.severity" class="field-error">{{ errors.severity }}</p>
        </div>

        <div class="form-field">
          <label class="form-label" for="crimen-estado">Estado</label>
          <select
            id="crimen-estado"
            v-model="form.status"
            class="select"
            :class="{ 'input--error': errors.status }"
          >
            <option v-for="item in CRIME_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
          <p v-if="errors.status" class="field-error">{{ errors.status }}</p>
        </div>

        <div class="form-field">
          <label class="form-label" for="crimen-fecha">Fecha y hora *</label>
          <input
            id="crimen-fecha"
            v-model="form.occurredAt"
            class="input"
            :class="{ 'input--error': errors.occurredAt }"
            type="datetime-local"
            :max="ahora"
          />
          <p v-if="errors.occurredAt" class="field-error">{{ errors.occurredAt }}</p>
        </div>
      </div>

      <div class="form-field">
        <label class="form-label" for="crimen-descripcion">Descripción *</label>
        <textarea
          id="crimen-descripcion"
          v-model="form.description"
          class="textarea"
          :class="{ 'input--error': errors.description }"
          maxlength="1000"
          placeholder="Describe qué ocurrió en el incidente"
        ></textarea>
        <p v-if="errors.description" class="field-error">{{ errors.description }}</p>
        <p class="form-hint">{{ form.description.trim().length }}/1000 caracteres · mínimo 10</p>
      </div>

      <div class="form-grid">
        <div class="form-field">
          <label class="form-label" for="crimen-villano">Villano (opcional)</label>
          <select
            id="crimen-villano"
            v-model="form.villain"
            class="select"
            :class="{ 'input--error': errors.villain }"
          >
            <option value="">Sin villano</option>
            <option v-for="villano in villains" :key="villano.id" :value="villano.id">
              {{ villano.name }}{{ villano.alias ? ` (${villano.alias})` : '' }}
            </option>
          </select>
          <p v-if="errors.villain" class="field-error">{{ errors.villain }}</p>
        </div>

        <div class="form-field">
          <label class="form-label" for="crimen-avistamiento">Avistamiento (opcional)</label>
          <select
            id="crimen-avistamiento"
            v-model="form.sighting"
            class="select"
            :class="{ 'input--error': errors.sighting }"
          >
            <option value="">Sin avistamiento</option>
            <option v-for="avistamiento in sightings" :key="avistamiento.id" :value="avistamiento.id">
              {{ textoAvistamiento(avistamiento) }}
            </option>
          </select>
          <p v-if="errors.sighting" class="field-error">{{ errors.sighting }}</p>
        </div>
      </div>
    </form>

    <template #footer>
      <button class="btn btn-ghost" type="button" :disabled="saving" @click="cerrar">
        Cancelar
      </button>
      <button class="btn btn-primary" type="submit" form="form-crimen" :disabled="saving">
        {{ saving ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Registrar crimen' }}
      </button>
    </template>
  </Modal>
</template>

<style scoped>
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

.input--error {
  border-color: var(--color-danger);
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>