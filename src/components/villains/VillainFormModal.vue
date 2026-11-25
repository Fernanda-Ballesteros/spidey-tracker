<script setup>
import { computed, reactive, ref, watch } from 'vue'
import Modal from '@/components/Modal.vue'
import { THREAT_OPTIONS, VILLAIN_STATUS_OPTIONS } from '@/utils/villainConfig'
import { categoryMeta } from '@/utils/mapConfig'

// Límites que valida el backend.
const MAX_PODERES = 15
const MAX_LARGO_PODER = 40
const MAX_GUARIDAS = 20

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  // null = crear. Con un villano = editar (precarga el formulario).
  villain: {
    type: Object,
    default: null,
  },
  // Ubicaciones de categoría "guarida" disponibles: [{ id, name, category, point }].
  hideouts: {
    type: Array,
    default: () => [],
  },
  saving: {
    type: Boolean,
    default: false,
  },
  // Errores por campo para mostrar bajo cada input. Ej: { name: 'Nombre repetido' }.
  errors: {
    type: Object,
    default: () => ({}),
  },
})

// 'submit' entrega el cuerpo listo para POST / PATCH /villains.
const emit = defineEmits(['close', 'submit'])

const esEdicion = computed(() => Boolean(props.villain))

const form = reactive({
  name: '',
  alias: '',
  history: '',
  threatLevel: 'medio',
  status: 'activo',
  powers: [],
  knownLocations: [],
})

const nuevoPoder = ref('')

// Llena el formulario al abrir el modal (vacío o con el villano a editar).
function cargarFormulario() {
  const villano = props.villain

  form.name = villano?.name || ''
  form.alias = villano?.alias || ''
  form.history = villano?.history || ''
  form.threatLevel = villano?.threatLevel || 'medio'
  form.status = villano?.status || 'activo'
  form.powers = [...(villano?.powers || [])]
  // El backend espera ids, no los objetos poblados.
  form.knownLocations = (villano?.knownLocations || []).map((ubicacion) => ubicacion.id)
  nuevoPoder.value = ''
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

const limitePoderes = computed(() => form.powers.length >= MAX_PODERES)
const limiteGuaridas = computed(() => form.knownLocations.length >= MAX_GUARIDAS)

function agregarPoder() {
  const poder = nuevoPoder.value.trim()

  if (!poder || poder.length > MAX_LARGO_PODER || limitePoderes.value) {
    return
  }

  const repetido = form.powers.some((item) => item.toLowerCase() === poder.toLowerCase())

  if (!repetido) {
    form.powers.push(poder)
  }

  nuevoPoder.value = ''
}

function quitarPoder(index) {
  form.powers.splice(index, 1)
}

function enviar() {
  // Si dejó un poder escrito sin presionar "Agregar", se incluye.
  agregarPoder()

  emit('submit', {
    name: form.name.trim(),
    alias: form.alias.trim(),
    history: form.history.trim(),
    powers: [...form.powers],
    threatLevel: form.threatLevel,
    status: form.status,
    knownLocations: [...form.knownLocations],
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
    :title="esEdicion ? 'Editar villano' : 'Registrar villano'"
    :eyebrow="esEdicion ? 'Modificar expediente' : 'Nuevo expediente'"
    subtitle="Completa los datos del hostil. Los campos con * son obligatorios."
    size="lg"
    :close-on-backdrop="!saving"
    @close="cerrar"
  >
    <form id="form-villano" class="form-stack" novalidate @submit.prevent="enviar">
      <div class="form-grid">
        <div class="form-field">
          <label class="form-label" for="villano-nombre">Nombre *</label>
          <input
            id="villano-nombre"
            v-model="form.name"
            class="input"
            :class="{ 'input--error': errors.name }"
            type="text"
            maxlength="80"
            placeholder="Ej. Norman Osborn"
          />
          <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
        </div>

        <div class="form-field">
          <label class="form-label" for="villano-alias">Alias</label>
          <input
            id="villano-alias"
            v-model="form.alias"
            class="input"
            :class="{ 'input--error': errors.alias }"
            type="text"
            maxlength="80"
            placeholder="Ej. Duende Verde"
          />
          <p v-if="errors.alias" class="field-error">{{ errors.alias }}</p>
        </div>
      </div>

      <div class="form-field">
        <label class="form-label" for="villano-historial">Historial *</label>
        <textarea
          id="villano-historial"
          v-model="form.history"
          class="textarea"
          :class="{ 'input--error': errors.history }"
          maxlength="2500"
          placeholder="Origen, motivaciones y actividad conocida del villano"
        ></textarea>
        <p v-if="errors.history" class="field-error">{{ errors.history }}</p>
        <p class="form-hint">{{ form.history.trim().length }}/2500 caracteres · mínimo 10</p>
      </div>

      <div class="form-grid">
        <div class="form-field">
          <label class="form-label" for="villano-amenaza">Nivel de amenaza *</label>
          <select
            id="villano-amenaza"
            v-model="form.threatLevel"
            class="select"
            :class="{ 'input--error': errors.threatLevel }"
          >
            <option v-for="item in THREAT_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
          <p v-if="errors.threatLevel" class="field-error">{{ errors.threatLevel }}</p>
        </div>

        <div class="form-field">
          <label class="form-label" for="villano-estado">Estado</label>
          <select
            id="villano-estado"
            v-model="form.status"
            class="select"
            :class="{ 'input--error': errors.status }"
          >
            <option v-for="item in VILLAIN_STATUS_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
          <p v-if="errors.status" class="field-error">{{ errors.status }}</p>
        </div>
      </div>

      <div class="form-field">
        <label class="form-label" for="villano-poder">Poderes</label>
        <div class="powers-input">
          <input
            id="villano-poder"
            v-model="nuevoPoder"
            class="input"
            type="text"
            :maxlength="MAX_LARGO_PODER"
            :disabled="limitePoderes"
            placeholder="Escribe un poder y presiona Enter"
            @keydown.enter.prevent="agregarPoder"
          />
          <button
            class="btn btn-secondary"
            type="button"
            :disabled="limitePoderes || !nuevoPoder.trim()"
            @click="agregarPoder"
          >
            Agregar
          </button>
        </div>

        <ul v-if="form.powers.length" class="powers-list">
          <li v-for="(poder, index) in form.powers" :key="poder" class="power-tag">
            <span>{{ poder }}</span>
            <button
              type="button"
              :aria-label="`Quitar poder ${poder}`"
              @click="quitarPoder(index)"
            >
              ×
            </button>
          </li>
        </ul>

        <p v-if="errors.powers" class="field-error">{{ errors.powers }}</p>
        <p class="form-hint">
          {{ form.powers.length }}/{{ MAX_PODERES }} poderes · máximo {{ MAX_LARGO_PODER }} caracteres
          cada uno
        </p>
      </div>

      <div class="form-field">
        <span class="form-label">Guaridas conocidas</span>

        <ul v-if="hideouts.length" class="hideouts-list">
          <li v-for="ubicacion in hideouts" :key="ubicacion.id">
            <label
              class="hideout-option"
              :class="{ 'hideout-option--disabled': limiteGuaridas && !form.knownLocations.includes(ubicacion.id) }"
            >
              <input
                v-model="form.knownLocations"
                type="checkbox"
                :value="ubicacion.id"
                :disabled="limiteGuaridas && !form.knownLocations.includes(ubicacion.id)"
              />
              <span class="hideout-option__name">{{ ubicacion.name }}</span>
              <span class="hideout-option__cat">{{ categoryMeta(ubicacion.category).label }}</span>
            </label>
          </li>
        </ul>

        <p v-else class="hideouts-empty">
          No hay ubicaciones de categoría Guarida. Regístralas primero en el mapa.
        </p>

        <p v-if="errors.knownLocations" class="field-error">{{ errors.knownLocations }}</p>
        <p class="form-hint">
          Solo se pueden elegir ubicaciones de categoría Guarida · máximo {{ MAX_GUARIDAS }}.
        </p>
      </div>
    </form>

    <template #footer>
      <button class="btn btn-ghost" type="button" :disabled="saving" @click="cerrar">
        Cancelar
      </button>
      <button class="btn btn-primary" type="submit" form="form-villano" :disabled="saving">
        {{ saving ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Registrar villano' }}
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

/* ---------- Poderes ---------- */
.powers-input {
  display: flex;
  gap: 0.5rem;
}

.powers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.2rem;
}

.power-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.3rem 0.2rem 0.6rem;
  background: var(--color-surface-3);
  border: var(--border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.76rem;
}

.power-tag button {
  width: 20px;
  height: 20px;
  padding: 0;
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1;
}

.power-tag button:hover {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

/* ---------- Guaridas ---------- */
.hideouts-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  max-height: 190px;
  overflow-y: auto;
}

.hideout-option {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.7rem;
  background: var(--color-surface-2);
  border: var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    border-color var(--transition),
    background var(--transition);
}

.hideout-option:hover {
  border-color: var(--color-accent);
}

.hideout-option:has(input:checked) {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
}

.hideout-option--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.hideout-option input {
  flex: 0 0 auto;
  accent-color: var(--color-accent);
}

.hideout-option__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 0.82rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hideout-option__cat {
  color: var(--color-text-dim);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.hideouts-empty {
  padding: 0.8rem;
  background: var(--color-bg-soft);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 0.78rem;
}

@media (max-width: 600px) {
  .form-grid,
  .hideouts-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .powers-input {
    flex-direction: column;
  }
}
</style>
