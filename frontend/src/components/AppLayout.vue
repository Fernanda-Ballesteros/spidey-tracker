<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import AlertBanner from '@/components/AlertBanner.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const menuOpen = ref(false)

const enlaces = [
  { to: '/', etiqueta: 'Mapa', marca: 'M' },
  { to: '/villanos', etiqueta: 'Villanos', marca: 'V' },
  { to: '/crimenes', etiqueta: 'Crímenes', marca: 'C' },
  { to: '/avistamientos', etiqueta: 'Avistamientos', marca: 'A' },
]

const inicial = computed(() => auth.user?.name?.charAt(0)?.toUpperCase() || 'A')
const rol = computed(() => (auth.user?.role === 'admin' ? 'Administrador' : 'Agente'))

function estaActivo(path) {
  if (path === '/') {
    return route.path === '/'
  }

  return route.path.startsWith(path)
}

// En móvil, el menú se cierra al cambiar de vista.
watch(
  () => route.path,
  () => {
    menuOpen.value = false
  },
)

function cerrarSesion() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="layout">
    <header class="mobile-bar">
      <button
        class="menu-toggle"
        type="button"
        aria-label="Abrir menú"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <span class="mobile-brand">SpyderTracker</span>
    </header>

    <div v-if="menuOpen" class="overlay" @click="menuOpen = false"></div>

    <aside class="sidebar" :class="{ 'sidebar--open': menuOpen }">
      <div class="brand">
        <div class="brand__mark" aria-hidden="true">S</div>
        <div class="brand__text">
          <strong class="brand__name">SpyderTracker</strong>
          <span class="brand__sub">Tactical Command</span>
        </div>
      </div>

      <nav class="nav" aria-label="Navegación principal">
        <RouterLink
          v-for="enlace in enlaces"
          :key="enlace.to"
          :to="enlace.to"
          class="nav__link"
          :class="{ 'nav__link--active': estaActivo(enlace.to) }"
          :aria-current="estaActivo(enlace.to) ? 'page' : undefined"
          @click="menuOpen = false"
        >
          <span class="nav__mark" aria-hidden="true">{{ enlace.marca }}</span>
          <span>{{ enlace.etiqueta }}</span>
        </RouterLink>
      </nav>

      <div class="user">
        <div class="user__avatar">{{ inicial }}</div>
        <div class="user__data">
          <strong>{{ auth.user?.name || 'Agente' }}</strong>
          <span>{{ rol }}</span>
        </div>
      </div>

      <button class="logout" type="button" @click="cerrarSesion">
        <span class="logout__icon" aria-hidden="true">⏻</span>
        Cerrar sesión
      </button>
    </aside>

    <main class="main">
      <AlertBanner />
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100vh;
  background: var(--color-bg);
}

.sidebar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1.35rem 1rem 1rem;
  overflow-y: auto;
  background: linear-gradient(180deg, #0c1626 0%, #080f1a 100%);
  border-right: var(--border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.2rem 0.25rem 1.1rem;
  border-bottom: var(--border);
}

.brand__mark {
  display: grid;
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  place-items: center;
  background: var(--color-brand-soft);
  border: 1px solid rgba(226, 59, 59, 0.55);
  border-radius: var(--radius-md);
  color: var(--color-brand);
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
}

.brand__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.brand__name {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1.1;
  text-transform: uppercase;
}

.brand__sub {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 1.4rem;
}

.nav__link {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.68rem 0.75rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-family: var(--font-display);
  font-size: 0.92rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition:
    background var(--transition),
    color var(--transition),
    border-color var(--transition);
}

.nav__link:hover {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

.nav__link--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #071019;
  box-shadow: 0 0 20px rgba(127, 196, 238, 0.18);
}

.nav__mark {
  display: grid;
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  place-items: center;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  line-height: 1;
}

.nav__link--active .nav__mark {
  border-color: rgba(7, 16, 25, 0.55);
}

.user {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: auto;
  padding: 0.75rem;
  background: var(--color-surface);
  border: var(--border);
  border-radius: var(--radius-md);
}

.user__avatar {
  display: grid;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  place-items: center;
  background: var(--color-brand);
  border-radius: 50%;
  color: #ffffff;
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
}

.user__data {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user__data strong {
  overflow: hidden;
  font-size: 0.85rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user__data span {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.6rem;
  padding: 0.62rem;
  background: transparent;
  border: var(--border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition);
}

.logout:hover {
  background: var(--color-brand-soft);
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.logout__icon {
  font-size: 0.95rem;
  line-height: 1;
}

.main {
  min-width: 0;
  min-height: 100vh;
  padding: clamp(1.1rem, 2.5vw, 2.5rem);
  background-color: var(--color-bg);
  background-image:
    radial-gradient(circle at 80% -10%, rgba(127, 196, 238, 0.08), transparent 42%),
    linear-gradient(rgba(127, 196, 238, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(127, 196, 238, 0.025) 1px, transparent 1px);
  background-size:
    auto,
    36px 36px,
    36px 36px;
}

.mobile-bar {
  display: none;
}

@media (max-width: 820px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .mobile-bar {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1400;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    height: 56px;
    padding: 0 1rem;
    background: rgba(19, 35, 92, 0.94);
    border-bottom: var(--border);
    backdrop-filter: blur(10px);
  }

  .menu-toggle {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 38px;
    height: 38px;
    background: var(--color-surface);
    border: var(--border);
    border-radius: var(--radius-sm);
    color: var(--color-accent);
  }

  .menu-toggle span {
    display: block;
    width: 18px;
    height: 2px;
    background: currentColor;
  }

  .mobile-brand {
    color: var(--color-text);
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1600;
    width: min(82vw, 300px);
    height: 100dvh;
    transform: translateX(-100%);
    transition: transform 220ms ease;
    box-shadow: var(--shadow-panel);
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .overlay {
    position: fixed;
    inset: 0;
    z-index: 1500;
    background: rgba(3, 7, 13, 0.68);
  }

  .main {
    padding-top: calc(56px + 1rem);
  }
}
</style>
