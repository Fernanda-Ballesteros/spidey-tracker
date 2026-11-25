<script setup>
// Insignia de color (ej. nivel de amenaza). El color llega como prop.
defineProps({
  label: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#8b9cb5',
  },
  // Relleno sólido para el nivel más peligroso.
  solid: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <span class="badge" :class="{ 'badge--solid': solid }" :style="{ '--badge-color': color }">
    {{ label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.6rem;
  background: color-mix(in srgb, var(--badge-color) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--badge-color) 45%, transparent);
  border-radius: var(--radius-pill);
  color: var(--badge-color);
  font-family: var(--font-mono);
  font-size: 0.64rem;
  letter-spacing: 0.06em;
  line-height: 1.5;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge--solid {
  background: color-mix(in srgb, var(--badge-color) 70%, #000);
  border-color: var(--badge-color);
  color: #ffffff;
}
</style>
