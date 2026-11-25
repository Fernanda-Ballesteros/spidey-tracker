<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Chip from '@/components/Chip.vue'
import VillainBadge from '@/components/villains/VillainBadge.vue'
import { crimeStatusMeta, crimeTypeLabel, severityMeta, SIGHTING_STATUS_LABELS } from '@/utils/crimeConfig'
import { formatCoordinate, formatDateTime } from '@/utils/dates'
import { riskMeta } from '@/utils/mapConfig'
import { threatMeta } from '@/utils/villainConfig'

const props = defineProps({
  // Crimen de GET /crimes/:id (con location, villain, sighting y reportedBy poblados).
  crime: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const gravedad = computed(() => severityMeta(props.crime?.severity))
const estado = computed(() => crimeStatusMeta(props.crime?.status))
const codigo = computed(() => `INC-${String(props.crime?.id || '').slice(-4).toUpperCase()}`)
const zonas = computed(() => props.crime?.location?.zones || [])
const amenazaVillano = computed(() => threatMeta(props.crime?.villain?.threatLevel))
</script>

<template>
  <aside class="detail" aria-label="Detalle del crimen">
    <p v-if="loading" class="detail__state" role="status">Cargando crimen...</p>

    <p v-else-if="!crime" class="detail__state">
      Selecciona un crimen de la tabla o del mapa para ver su detalle.
    </p>

    <template v-else>
      <header class="detail__head">
        <div>
          <p class="detail__eyebrow">Telemetría de crimen</p>
          <h2 class="detail__title">// {{ codigo }}</h2>
        </div>
        <span class="detail__dot" :style="{ background: gravedad.color }" aria-hidden="true"></span>
      </header>

      <section class="detail__box">
        <div class="detail__class">
          <span class="detail__label">Clasificación</span>
          <VillainBadge :label="gravedad.label" :color="gravedad.color" :solid="gravedad.solid" />
          <Chip :label="estado.label" :variant="estado.chip" />
        </div>
        <h3 class="detail__type">{{ crimeTypeLabel(crime.type) }}</h3>
      </section>

      <section>
        <h4 class="detail__label">Descripción de los hechos</h4>
        <p class="detail__text">{{ crime.description }}</p>
      </section>

      <div class="detail__grid">
        <section class="detail__cell">
          <h4 class="detail__label">Ubicación exacta</h4>
          <strong>{{ crime.location?.name || '—' }}</strong>
          <span class="detail__mono">
            {{ formatCoordinate(crime.location?.point?.coordinates?.[1]) }},
            {{ formatCoordinate(crime.location?.point?.coordinates?.[0]) }}
          </span>
        </section>

        <section class="detail__cell">
          <h4 class="detail__label">Zona vinculada</h4>
          <template v-if="zonas.length">
            <div v-for="zona in zonas" :key="zona.id" class="detail__zone">
              <strong>{{ zona.name }}</strong>
              <span :style="{ color: riskMeta(zona.riskLevel).color }">
                {{ riskMeta(zona.riskLevel).label }}
              </span>
            </div>
          </template>
          <span v-else class="detail__muted">Sin zona asociada</span>
        </section>
      </div>

      <section class="detail__box">
        <h4 class="detail__label">Villano vinculado</h4>

        <div v-if="crime.villain" class="detail__villain">
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

          <div class="detail__villain-info">
            <strong>{{ crime.villain.name }}</strong>
            <span v-if="crime.villain.alias">Alias: {{ crime.villain.alias }}</span>
            <VillainBadge
              :label="amenazaVillano.label"
              :color="amenazaVillano.color"
              :solid="amenazaVillano.solid"
            />
          </div>

          <RouterLink :to="{ name: 'villains' }" class="detail__link">Ver perfil del villano</RouterLink>
        </div>

        <p v-else class="detail__muted">Sin villano asignado.</p>
      </section>

      <section class="detail__box">
        <h4 class="detail__label">Avistamiento de Spider-Man asociado</h4>

        <template v-if="crime.sighting">
          <p class="detail__text">{{ formatDateTime(crime.sighting.seenAt) }}</p>
          <Chip
            :label="SIGHTING_STATUS_LABELS[crime.sighting.status] || crime.sighting.status"
            variant="info"
          />
        </template>

        <p v-else class="detail__muted">Sin avistamiento asociado.</p>
      </section>

      <p class="detail__foot">
        Reportado por {{ crime.reportedBy?.name || '—' }} · {{ formatDateTime(crime.createdAt) }}
      </p>
    </template>
  </aside>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  min-width: 0;
  padding: 1.1rem;
  background: var(--color-surface);
  border: var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
}

.detail__state {
  display: grid;
  min-height: 220px;
  place-items: center;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  text-align: center;
}

.detail__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.detail__eyebrow,
.detail__label {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  font-weight: 400;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.detail__title {
  margin-top: 0.25rem;
  font-size: 1.05rem;
  letter-spacing: 0.06em;
}

.detail__dot {
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  margin-top: 0.4rem;
  border-radius: 50%;
  box-shadow: 0 0 10px currentColor;
}

.detail__box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.8rem 0.9rem;
  background: var(--color-bg-soft);
  border: var(--border);
  border-radius: var(--radius-md);
}

.detail__class {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.detail__type {
  font-size: 1.15rem;
  letter-spacing: 0.04em;
  text-transform: none;
}

.detail__text {
  margin-top: 0.35rem;
  color: var(--color-text);
  font-size: 0.86rem;
  line-height: 1.55;
}

.detail__box .detail__text {
  margin-top: 0;
}

.detail__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.detail__cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.7rem 0.8rem;
  background: var(--color-bg-soft);
  border: var(--border);
  border-radius: var(--radius-md);
}

.detail__cell strong {
  font-size: 0.85rem;
  line-height: 1.25;
}

.detail__mono {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.62rem;
}

.detail__zone {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.detail__zone span {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  text-transform: uppercase;
}

.detail__muted {
  color: var(--color-text-dim);
  font-size: 0.78rem;
}

.detail__villain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.7rem;
}

.detail__avatar {
  display: grid;
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  place-items: center;
  background: var(--color-brand-soft);
  border: 1px solid rgba(255, 90, 95, 0.4);
  border-radius: var(--radius-sm);
  color: var(--color-brand);
}

.detail__avatar svg {
  width: 22px;
  height: 22px;
}

.detail__villain-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  min-width: 0;
}

.detail__villain-info strong {
  font-size: 0.92rem;
}

.detail__villain-info span {
  color: var(--color-brand);
  font-size: 0.74rem;
}

.detail__link {
  padding: 0.4rem 0.65rem;
  background: var(--color-accent-soft);
  border: 1px solid rgba(62, 199, 223, 0.35);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.detail__link:hover {
  background: rgba(62, 199, 223, 0.22);
}

.detail__foot {
  color: var(--color-text-dim);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.04em;
}

@media (max-width: 520px) {
  .detail__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>