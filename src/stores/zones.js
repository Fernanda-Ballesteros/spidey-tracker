import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/axios'
import { getErrorMessage } from '@/utils/errors'

export const useZonesStore = defineStore('zones', () => {
  // Se guardan los features tal como llegan de /zones/geojson.
  const features = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Lista cómoda para el panel: propiedades + geometry.
  const zones = computed(() =>
    features.value.map((feature) => ({
      ...(feature.properties || {}),
      geometry: feature.geometry,
    })),
  )

  async function fetchZones() {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get('/zones/geojson')
      features.value = Array.isArray(data?.features) ? data.features : []
      return features.value
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.post('/zones', payload)
      await fetchZones()
      return data
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.delete(`/zones/${id}`)
      await fetchZones()
      return data
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    features,
    zones,
    loading,
    error,
    fetchZones,
    create,
    remove,
  }
})
