<script setup>
import { computed } from 'vue'
import Modal from '@/components/Modal.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirmar eliminación',
  },
  message: {
    type: String,
    default: '',
  },
  details: {
    type: [Array, String],
    default: () => [],
  },
  confirmLabel: {
    type: String,
    default: 'Eliminar',
  },
  cancelLabel: {
    type: String,
    default: 'Cancelar',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const listaDetalles = computed(() => {
  if (Array.isArray(props.details)) {
    return props.details
  }

  return props.details ? [props.details] : []
})

function cancelar() {
  if (!props.loading) {
    emit('cancel')
  }
}
</script>

<template>
  <Modal
    :open="open"
    :title="title"
    eyebrow="Acción irreversible"
    size="sm"
    :close-on-backdrop="!loading"
    @close="cancelar"
  >
    <div class="confirm">
      <span class="confirm__icon" aria-hidden="true">!</span>
      <p class="confirm__message">{{ message }}</p>
    </div>

    <ul v-if="listaDetalles.length" class="confirm__details">
      <li v-for="(detalle, index) in listaDetalles" :key="index">{{ detalle }}</li>
    </ul>

    <template #footer>
      <button class="btn btn-ghost" type="button" :disabled="loading" @click="cancelar">
        {{ cancelLabel }}
      </button>
      <button class="btn btn-danger" type="button" :disabled="loading" @click="emit('confirm')">
        {{ loading ? 'Eliminando...' : confirmLabel }}
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.confirm {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.confirm__icon {
  display: grid;
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  place-items: center;
  background: var(--color-danger-soft);
  border: 1px solid rgba(229, 72, 77, 0.5);
  border-radius: 50%;
  color: var(--color-danger);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 700;
}

.confirm__message {
  padding-top: 0.2rem;
  color: var(--color-text);
  font-size: 0.88rem;
  line-height: 1.45;
}

.confirm__details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding-left: 1.1rem;
  margin-top: 0.75rem;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  line-height: 1.4;
  list-style: disc;
}
</style>
