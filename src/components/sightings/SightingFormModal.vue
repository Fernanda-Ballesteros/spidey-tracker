<script setup>
import { computed, reactive, ref, watch } from 'vue'
import Modal from '@/components/Modal.vue'
import { SIGHTING_STATUS_OPTIONS } from '@/utils/sightingConfig'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  // null = crear. Con un avistamiento = editar (precarga el formulario).
  sighting: {
    type: Object,
    default: null,
  },
  // Ubicaciones de categoría "avistamiento": [{ id, name }].
  locations: {
    type: Array,
    default: () => [],
  },
  saving: {
    type: Boolean,
    default: false,
  },
  // Errores por campo. Ej: { notes: 'Mínimo 5 caracteres' }.
  errors: {
    type: Object,
    default: () => ({}),
  },
})

// 'submit' entrega el cuerpo listo para POST / PATCH /sightings.
const emit = defineEmits(['close', 'submit'])

const esEdicion = computed(() => Boolean(props.sighting))

const form = reactive({
  location: '',
  seenAt: '',
  status: 'por-verificar',
  witness: '',
  notes: '',
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
  const avistamiento = props.sighting

  ahora.value = aInputLocal(new Date())

  // El backend espera el id de la ubicación, no el objeto poblado.
  form.location = avistamiento?.location?.id || ''
  form.seenAt = aInputLocal(avistamiento?.seenAt)
  form.status = avistamiento?.status || 'por-verificar'
  form.witness = avistamiento?.witness || ''
  form.notes = avistamiento?.notes || ''
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

function enviar() {
  emit('submit', {
    location: form.location,
    // El backend pide fecha ISO 8601.
    seenAt: form.seenAt ? new Date(form.seenAt).toISOString() : '',
    status: form.status,
    witness: form.witness.trim(),
    notes: form.notes.trim(),
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
    :title="esEdicion ? 'Editar avistamiento' : 'Registrar avistamiento'"
    :eyebrow="esEdicion ? 'Modificar reporte' : 'Nuevo reporte'"
    subtitle="Completa los datos del contacto visual. Los campos con * son obligatorios."
    :close-on-backdrop="!saving"
    @close="cerrar"
  >
    <form id="form-avistamiento" class="form-stack" novalidate @submit.prevent="enviar">
      <div class="form-field">
        <label class="form-label" for="avistamiento-ubicacion">Ubicación *</label>
        <select
          id="avistamiento-ubicacion"
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
              ? 'Solo aparecen ubicaciones de categoría Avistamiento.'
              : 'No hay ubicaciones de categoría Avistamiento. Regístrala primero en el mapa.'
          }}
        </p>
      </div>

      <div class="form-grid">
        <div class="form-field">
          <label class="form-label" for="avistamiento-fecha">Fecha y hora *</label>
          <input
            id="avistamiento-fecha"
            v-model="form.seenAt"
            class="input"
            :class="{ 'input--error': errors.seenAt }"
            type="datetime-local"
            :max="ahora"
          />
          <p v-if="errors.seenAt" class="field-error">{{ errors.seenAt }}</p>
        </div>

        <div class="form-field">
          <label class="form-label" for="avistamiento-estado">Estado</label>
          <select
            id="avistamiento-estado"
            v-model="form.status"
            class="select"
            :class="{ 'input--error': errors.status }"
          >
            <option v-for="item in SIGHTING_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
          <p v-if="errors.status" class="field-error">{{ errors.status }}</p>
        </div>
      </div>

      <div class="form-field">
        <label class="form-label" for="avistamiento-testigo">Testigo (opcional)</label>
        <input
          id="avistamiento-testigo"
          v-model="form.witness"
          class="input"
          :class="{ 'input--error': errors.witness }"
          type="text"
          maxlength="80"
          placeholder="Ej. Oficial NYPD Davis"
        />
        <p v-if="errors.witness" class="field-error">{{ errors.witness }}</p>
      </div>

      <div class="form-field">
        <label class="form-label" for="avistamiento-notas">Notas *</label>
        <textarea
          id="avistamiento-notas"
          v-model="form.notes"
          class="textarea"
          :class="{ 'input--error': errors.notes }"
          maxlength="1000"
          placeholder="Describe lo que se observó"
        ></textarea>
        <p v-if="errors.notes" class="field-error">{{ errors.notes }}</p>
        <p class="form-hint">{{ form.notes.trim().length }}/1000 caracteres · mínimo 5</p>
      </div>
    </form>

    <template #footer>
      <button class="btn btn-ghost" type="button" :disabled="saving" @click="cerrar">
        Cancelar
      </button>
      <button class="btn btn-primary" type="submit" form="form-avistamiento" :disabled="saving">
        {{ saving ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Registrar avistamiento' }}
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