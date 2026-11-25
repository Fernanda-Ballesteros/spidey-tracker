import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './assets/styles/variables.css'
import './assets/styles/base.css'
import './assets/styles/auth.css'

async function iniciarApp() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)

  // Restaura la sesión antes de resolver la primera ruta.
  const auth = useAuthStore(pinia)

  if (auth.token) {
    try {
      await auth.fetchMe()
    } catch {
      auth.logout()
    }
  }

  app.use(router)
  await router.isReady()
  app.mount('#app')
}

iniciarApp()
