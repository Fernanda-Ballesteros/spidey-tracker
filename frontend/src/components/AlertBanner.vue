<script setup>
import { useAlertsStore } from '@/stores/alerts'

const alertsStore = useAlertsStore()
</script>

<template>
  <TransitionGroup name="alert" tag="div" class="alert-stack" aria-live="polite">
    <article
      v-for="alert in alertsStore.alerts"
      :key="alert.id"
      class="alert"
      :class="`alert--${alert.type}`"
      role="alert"
    >
      <span class="alert__icon" aria-hidden="true">
        {{ alert.type === 'success' ? '✓' : '!' }}
      </span>

      <div class="alert__body">
        <p class="alert__message">{{ alert.message }}</p>

        <ul v-if="alert.details.length" class="alert__details">
          <li v-for="(detail, index) in alert.details" :key="index">{{ detail }}</li>
        </ul>
      </div>

      <button
        class="alert__close"
        type="button"
        aria-label="Cerrar alerta"
        @click="alertsStore.remove(alert.id)"
      >
        ×
      </button>
    </article>
  </TransitionGroup>
</template>

<style scoped>
.alert-stack {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 2100;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: min(380px, calc(100vw - 2rem));
  pointer-events: none;
}

.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.8rem 0.9rem;
  background: var(--color-surface);
  border: 1px solid;
  border-left-width: 4px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  pointer-events: auto;
}

.alert--success {
  background: rgba(11, 32, 24, 0.96);
  border-color: rgba(53, 199, 122, 0.55);
}

.alert--error {
  background: rgba(38, 14, 20, 0.96);
  border-color: rgba(255, 92, 92, 0.6);
}

.alert__icon {
  display: grid;
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 50%;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
}

.alert--success .alert__icon {
  background: var(--color-success);
  color: #04170d;
}

.alert--error .alert__icon {
  background: var(--color-danger);
  color: #ffffff;
}

.alert__body {
  flex: 1;
  min-width: 0;
}

.alert__message {
  font-size: 0.85rem;
  line-height: 1.35;
}

.alert--success .alert__message {
  color: #a9f0c8;
}

.alert--error .alert__message {
  color: #ffc2c4;
}

.alert__details {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-top: 0.35rem;
  padding-left: 1rem;
  list-style: disc;
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

.alert__close {
  flex: 0 0 auto;
  padding: 0 0.15rem;
  background: transparent;
  border: 0;
  color: currentColor;
  font-size: 1.15rem;
  line-height: 1;
  opacity: 0.7;
  transition: opacity var(--transition);
}

.alert__close:hover {
  opacity: 1;
}

.alert-enter-active,
.alert-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.alert-enter-from,
.alert-leave-to {
  opacity: 0;
  transform: translateX(18px);
}

.alert-move {
  transition: transform 180ms ease;
}

@media (max-width: 820px) {
  .alert-stack {
    top: calc(56px + 0.75rem);
    right: 0.75rem;
    width: calc(100vw - 1.5rem);
  }
}
</style>
