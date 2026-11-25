import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/axios'
import { getErrorMessage } from '@/utils/errors'

export const useLocationsStore = defineStore('locations', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Últimos filtros usados. Se reutilizan después de crear, editar o eliminar.
  const filters = ref({
    search: '',
    category: 'all',
    zone: 'all',
  })

  function params(filtros) {
    return {
      search: filtros.search.trim(),
      category: filtros.category,
      zone: filtros.zone,
    }
  }

  async function fetch(filtros) {
    if (filtros) {
      filters.value = { ...filters.value, ...filtros }
    }

    loading.value = true
    error.value = null

    try {
      const { data } = await api.get('/locations', {
        params: params(filters.value),
      })

      items.value = Array.isArray(data) ? data : []
      return items.value
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Después de cada cambio se vuelve a pedir la lista: mapa y tabla
  // se actualizan juntos sin recargar la página.
  async function create(payload) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.post('/locations', payload)
      await fetch()
      return data
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function update(id, payload) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.patch(`/locations/${id}`, payload)
      await fetch()
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
      const { data } = await api.delete(`/locations/${id}`)
      await fetch()
      return data
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    filters,
    fetch,
    create,
    update,
    remove,
  }
})
