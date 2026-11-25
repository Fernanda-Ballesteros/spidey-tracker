import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/axios'

const TOKEN_KEY = 'spyder_token'

export const useAuthStore = defineStore('auth', () => {
  // El token se recupera al recargar; el usuario se valida con fetchMe.
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  function guardarSesion(data) {
    token.value = data.token
    user.value = data.user
    localStorage.setItem(TOKEN_KEY, data.token)
  }

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials)
    guardarSesion(data)
    return data.user
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload)
    guardarSesion(data)
    return data.user
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  async function fetchMe() {
    if (!token.value) {
      return null
    }

    const { data } = await api.get('/auth/me')
    user.value = data.user
    return data.user
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    fetchMe,
  }
})
