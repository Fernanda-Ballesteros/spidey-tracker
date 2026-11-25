import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import MapView from '@/views/MapView.vue'
import VillainsView from '@/views/VillainsView.vue'
import CrimesView from '@/views/CrimesView.vue'
import SightingsView from '@/views/SightingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guestOnly: true },
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'map', component: MapView },
        { path: 'villanos', name: 'villains', component: VillainsView },
        { path: 'crimenes', name: 'crimes', component: CrimesView },
        { path: 'avistamientos', name: 'sightings', component: SightingsView },
      ],
    },
  ],
})

// Protege las vistas internas y evita el login si ya hay sesión.
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'map' }
  }

  return true
})

export default router
