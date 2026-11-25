<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'muted',
  },
  dot: {
    type: Boolean,
    default: false,
  },
})

const VARIANTES = ['success', 'warning', 'danger', 'info', 'muted']

const varianteSegura = computed(() =>
  VARIANTES.includes(props.variant) ? props.variant : 'muted',
)
</script>

<template>
  <span class="chip" :class="`chip-${varianteSegura}`">
    <span v-if="dot" class="chip__dot" aria-hidden="true"></span>
    {{ label }}
  </span>
</template>

<style scoped>
.chip__dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
}
</style>
