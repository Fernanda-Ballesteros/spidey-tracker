<script setup>
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  eyebrow: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close'])

let overflowAnterior = ''

function cerrar() {
  emit('close')
}

function alPresionarTecla(event) {
  if (event.key === 'Escape' && props.open) {
    cerrar()
  }
}

function alHacerClicFondo() {
  if (props.closeOnBackdrop) {
    cerrar()
  }
}

watch(
  () => props.open,
  (abierto) => {
    if (abierto) {
      overflowAnterior = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', alPresionarTecla)
      return
    }

    document.body.style.overflow = overflowAnterior
    window.removeEventListener('keydown', alPresionarTecla)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = overflowAnterior
  window.removeEventListener('keydown', alPresionarTecla)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" @click.self="alHacerClicFondo">
        <section
          class="modal__panel"
          :class="`modal__panel--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <header class="modal__head">
            <div class="modal__heading">
              <p v-if="eyebrow" class="modal__eyebrow">{{ eyebrow }}</p>
              <h2 class="modal__title">{{ title }}</h2>
              <p v-if="subtitle" class="modal__subtitle">{{ subtitle }}</p>
            </div>

            <button class="modal__close" type="button" aria-label="Cerrar" @click="cerrar">
              ×
            </button>
          </header>

          <div class="modal__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="modal__footer">
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  /* Por encima de los panes y controles de Leaflet (llegan a z-index 1000). */
  z-index: 2000;
  display: grid;
  padding: 1rem;
  place-items: center;
  overflow-y: auto;
  background: rgba(3, 7, 13, 0.76);
  backdrop-filter: blur(4px);
}

.modal__panel {
  display: flex;
  flex-direction: column;
  width: min(100%, 560px);
  max-height: calc(100vh - 2rem);
  overflow: hidden;
  background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg-soft) 100%);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
}

.modal__panel--sm {
  width: min(100%, 430px);
}

.modal__panel--lg {
  width: min(100%, 720px);
}

.modal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.15rem 0.85rem;
  border-bottom: var(--border);
}

.modal__heading {
  min-width: 0;
}

.modal__eyebrow {
  margin-bottom: 0.25rem;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.modal__title {
  font-size: 1.15rem;
  letter-spacing: 0.08em;
}

.modal__subtitle {
  margin-top: 0.3rem;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  line-height: 1.35;
}

.modal__close {
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 1.45rem;
  line-height: 1;
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition);
}

.modal__close:hover {
  background: var(--color-brand-soft);
  border-color: rgba(226, 59, 59, 0.4);
  color: var(--color-brand);
}

.modal__body {
  padding: 1rem 1.15rem 1.15rem;
  overflow-y: auto;
}

.modal__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.9rem 1.15rem;
  border-top: var(--border);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 180ms ease;
}

.modal-enter-active .modal__panel,
.modal-leave-active .modal__panel {
  transition: transform 180ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal__panel,
.modal-leave-to .modal__panel {
  transform: translateY(8px) scale(0.985);
}

@media (max-width: 520px) {
  .modal {
    padding: 0.6rem;
  }

  .modal__panel {
    max-height: calc(100dvh - 1.2rem);
  }
}
</style>
