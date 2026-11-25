import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAlertsStore = defineStore('alerts', () => {
  const alerts = ref([])
  let nextId = 1

  function remove(id) {
    alerts.value = alerts.value.filter((alert) => alert.id !== id)
  }

  function add(type, message, details = []) {
    const id = nextId++
    alerts.value.push({ id, type, message, details })

    // Cada alerta desaparece sola después de 5 segundos.
    window.setTimeout(() => remove(id), 5000)
  }

  function success(message) {
    add('success', message)
  }

  function error(message, details = []) {
    add('error', message, details)
  }

  return {
    alerts,
    success,
    error,
    remove,
  }
})
