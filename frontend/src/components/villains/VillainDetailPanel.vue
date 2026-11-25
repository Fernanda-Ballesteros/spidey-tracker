<script setup>
import { computed } from 'vue'
import Chip from '@/components/Chip.vue'
import VillainBadge from '@/components/villains/VillainBadge.vue'
import { categoryMeta } from '@/utils/mapConfig'
import { formatDateTime } from '@/utils/dates'
import {
  crimeSeverityMeta,
  crimeStatusLabel,
  crimeTypeLabel,
  threatMeta,
  villainStatusMeta,
} from '@/utils/villainConfig'

const props = defineProps({
  // Villano de GET /villains/:id (incluye `crimes` y `knownLocations` poblados).
  villain: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

// El botón de lápiz pide editar al villano mostrado.
const emit = defineEmits(['edit'])

const amenaza = computed(() => threatMeta(props.villain?.threatLevel))
const estado = computed(() => villainStatusMeta(props.villain?.status))
const crimenes = computed(() => props.villain?.crimes || [])
const guaridas = computed(() => props.villain?.knownLocations || [])
const poderes = computed(() => props.villain?.powers || [])
</script>

<template>
  <aside class="detail" aria-label="Detalle del villano">
    <p v-if="loading" class="detail__state" role="status">Cargando expediente...</p>

    <p v-else-if="!villain" class="detail__state">
      Selecciona un villano de la tabla para ver su expediente.
    </p>

    <template v-else>
      <header class="detail__head">
        <span class="detail__avatar" aria-hidden="true">
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

        <div class="detail__id">
          <div class="detail__badges">
            <VillainBadge :label="amenaza.label" :color="amenaza.color" :solid="amenaza.solid" />
            <Chip :label="estado.label" :variant="estado.chip" />
          </div>
          <h2 class="detail__name">{{ villain.name }}</h2>
          <p v-if="villain.alias" class="detail__alias">{{ villain.alias }}</p>
        </div>

        <button
          class="detail__edit"
          type="button"
          :aria-label="`Editar a ${villain.name}`"
          @click="emit('edit', villain)"
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
      </header>

      <section class="detail__history">
        <h3 class="detail__label">Historial del villano</h3>
        <p>{{ villain.history }}</p>
      </section>

      <section class="detail__section">
        <h3 class="detail__label">Poderes registrados</h3>
        <ul v-if="poderes.length" class="power-list">
          <li v-for="poder in poderes" :key="poder" class="power-tag">{{ poder }}</li>
        </ul>
        <p v-else class="detail__empty">Sin poderes registrados.</p>
      </section>

      <section class="detail__section">
        <h3 class="detail__label">Guaridas conocidas</h3>
        <ul v-if="guaridas.length" class="hideout-list">
          <li v-for="guarida in guaridas" :key="guarida.id" class="hideout-card">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21Z" />
              <circle cx="12" cy="9.5" r="2.4" />
            </svg>
            <div>
              <strong>{{ guarida.name }}</strong>
              <span>{{ categoryMeta(guarida.category).label }}</span>
            </div>
          </li>
        </ul>
        <p v-else class="detail__empty">Sin guaridas registradas.</p>
      </section>

      <section class="detail__section detail__section--crimes">
        <div class="detail__crimes-head">
          <h3 class="detail__label">Historial de crímenes</h3>
          <span class="detail__count">
            {{ crimenes.length }} {{ crimenes.length === 1 ? 'incidente ligado' : 'incidentes ligados' }}
          </span>
        </div>

        <ul v-if="crimenes.length" class="crime-list">
          <li v-for="crimen in crimenes" :key="crimen.id" class="crime-item">
            <div class="crime-item__info">
              <strong>{{ crimeTypeLabel(crimen.type) }}</strong>
              <span>{{ formatDateTime(crimen.occurredAt) }}</span>
            </div>
            <div class="crime-item__state">
              <Chip
                :label="crimeSeverityMeta(crimen.severity).label"
                :variant="crimeSeverityMeta(crimen.severity).chip"
              />
              <span>{{ crimeStatusLabel(crimen.status) }}</span>
            </div>
          </li>
        </ul>
        <p v-else class="detail__empty">Este villano no tiene crímenes ligados.</p>
      </section>
    </template>
  </aside>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  padding: 1.1rem;
  overflow-y: auto;
  background: var(--color-surface);
  border: var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
}

.detail__state {
  display: grid;
  min-height: 200px;
  place-items: center;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  text-align: center;
}

/* ---------- Cabecera ---------- */
.detail__head {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.detail__avatar {
  display: grid;
  flex: 0 0 auto;
  width: 56px;
  height: 56px;
  place-items: center;
  background: var(--color-surface-3);
  border: var(--border-strong);
  border-radius: var(--radius-md);
  color: var(--color-brand);
}

.detail__avatar svg {
  width: 28px;
  height: 28px;
}

.detail__id {
  flex: 1;
  min-width: 0;
}

.detail__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.35rem;
}

.detail__name {
  font-size: 1.35rem;
  letter-spacing: 0.04em;
  text-transform: none;
  overflow-wrap: anywhere;
}

.detail__alias {
  margin-top: 0.15rem;
  color: var(--color-brand);
  font-size: 0.95rem;
  font-weight: 600;
}

.detail__edit {
  display: grid;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  place-items: center;
  background: var(--color-surface-2);
  border: var(--border);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  transition:
    background var(--transition),
    border-color var(--transition);
}

.detail__edit:hover {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
}

.detail__edit svg {
  width: 16px;
  height: 16px;
}

/* ---------- Secciones ---------- */
.detail__label {
  margin-bottom: 0.45rem;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 400;
  letter-spacing: 0.12em;
}

.detail__history {
  padding: 0.85rem 0.95rem;
  background: var(--color-bg-soft);
  border: var(--border);
  border-radius: var(--radius-md);
}

.detail__history p {
  color: var(--color-text);
  font-size: 0.88rem;
  line-height: 1.55;
}

.detail__empty {
  color: var(--color-text-dim);
  font-size: 0.78rem;
}

/* ---------- Poderes ---------- */
.power-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.power-tag {
  padding: 0.22rem 0.6rem;
  background: var(--color-surface-3);
  border: var(--border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.74rem;
}

/* ---------- Guaridas ---------- */
.hideout-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.hideout-card {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
  padding: 0.6rem 0.7rem;
  background: var(--color-bg-soft);
  border: var(--border);
  border-radius: var(--radius-md);
}

.hideout-card svg {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  color: var(--color-brand);
}

.hideout-card div {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.hideout-card strong {
  overflow: hidden;
  font-size: 0.8rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hideout-card span {
  color: var(--color-text-dim);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* ---------- Crímenes ---------- */
.detail__crimes-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.4rem;
}

.detail__count {
  color: var(--color-text-dim);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.05em;
}

.crime-list {
  display: flex;
  flex-direction: column;
  max-height: 220px;
  overflow-y: auto;
}

.crime-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(36, 52, 78, 0.65);
}

.crime-item:last-child {
  border-bottom: 0;
}

.crime-item__info,
.crime-item__state {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.crime-item__state {
  align-items: flex-end;
}

.crime-item__info strong {
  font-size: 0.86rem;
}

.crime-item__info span,
.crime-item__state span {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.04em;
}

@media (max-width: 520px) {
  .hideout-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
