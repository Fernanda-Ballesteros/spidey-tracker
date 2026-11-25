import axios from 'axios'

// Instancia única para todas las peticiones a la API.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Agrega el token guardado a cada petición autenticada.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spyder_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Si la sesión expira, limpia el token y regresa al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    const esRutaAuth = url.includes('/auth/login') || url.includes('/auth/register')

    if (status === 401 && !esRutaAuth) {
      localStorage.removeItem('spyder_token')

      // Recarga completa para limpiar también el estado en memoria.
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    return Promise.reject(error)
  },
)

export default api
