<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthShell from '@/components/AuthShell.vue'
import { useAuthStore } from '@/stores/auth'
import { useAlertsStore } from '@/stores/alerts'
import { getErrorMessage } from '@/utils/errors'

const router = useRouter()
const auth = useAuthStore()
const alerts = useAlertsStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
})

const mostrarPassword = ref(false)
const enviando = ref(false)
const errorGeneral = ref({ message: '', details: [] })

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function limpiarCampo(campo) {
  errors[campo] = ''
  errorGeneral.value = { message: '', details: [] }
}

function validar() {
  errors.name = ''
  errors.email = ''
  errors.password = ''

  const nombre = form.name.trim()
  if (nombre.length < 2 || nombre.length > 60) {
    errors.name = 'El nombre debe tener entre 2 y 60 caracteres.'
  }

  if (!form.email.trim()) {
    errors.email = 'El correo es obligatorio.'
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'El correo no tiene un formato válido.'
  }

  if (form.password.length < 8 || form.password.length > 72) {
    errors.password = 'La contraseña debe tener entre 8 y 72 caracteres.'
  } else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
    errors.password = 'La contraseña debe incluir al menos una letra y un número.'
  }

  return !errors.name && !errors.email && !errors.password
}

async function enviar() {
  if (enviando.value) {
    return
  }

  errorGeneral.value = { message: '', details: [] }

  if (!validar()) {
    return
  }

  enviando.value = true

  try {
    await auth.register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    })

    alerts.success('Cuenta creada correctamente.')
    await router.push('/')
  } catch (err) {
    errorGeneral.value = getErrorMessage(err)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <AuthShell>
    <h2 class="auth-title">Crear cuenta</h2>

    <div v-if="errorGeneral.message" class="auth-alert" role="alert">
      <p>{{ errorGeneral.message }}</p>
      <ul v-if="errorGeneral.details.length" class="auth-alert__details">
        <li v-for="(detail, index) in errorGeneral.details" :key="index">
          {{ detail }}
        </li>
      </ul>
    </div>

    <form class="auth-form" novalidate :aria-busy="enviando" @submit.prevent="enviar">
      <div class="auth-field">
        <label class="form-label" for="register-name">Nombre completo</label>
        <div class="auth-control">
          <svg
            class="auth-control__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          <input
            id="register-name"
            v-model="form.name"
            class="input"
            :class="{ 'input--error': errors.name }"
            type="text"
            autocomplete="name"
            placeholder="Tu nombre"
            maxlength="60"
            :aria-invalid="errors.name ? 'true' : undefined"
            :aria-describedby="errors.name ? 'register-name-error' : undefined"
            @input="limpiarCampo('name')"
          />
        </div>
        <p v-if="errors.name" id="register-name-error" class="auth-field__error">
          {{ errors.name }}
        </p>
      </div>

      <div class="auth-field">
        <label class="form-label" for="register-email">Correo electrónico</label>
        <div class="auth-control">
          <svg
            class="auth-control__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
          <input
            id="register-email"
            v-model="form.email"
            class="input"
            :class="{ 'input--error': errors.email }"
            type="email"
            inputmode="email"
            autocomplete="email"
            placeholder="correo@ejemplo.com"
            maxlength="254"
            :aria-invalid="errors.email ? 'true' : undefined"
            :aria-describedby="errors.email ? 'register-email-error' : undefined"
            @input="limpiarCampo('email')"
          />
        </div>
        <p v-if="errors.email" id="register-email-error" class="auth-field__error">
          {{ errors.email }}
        </p>
      </div>

      <div class="auth-field">
        <label class="form-label" for="register-password">Contraseña</label>
        <div class="auth-control auth-control--password">
          <svg
            class="auth-control__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          <input
            id="register-password"
            v-model="form.password"
            class="input"
            :class="{ 'input--error': errors.password }"
            :type="mostrarPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Tu contraseña"
            maxlength="72"
            :aria-invalid="errors.password ? 'true' : undefined"
            :aria-describedby="
              errors.password
                ? 'register-password-hint register-password-error'
                : 'register-password-hint'
            "
            @input="limpiarCampo('password')"
          />
          <button
            class="auth-control__toggle"
            type="button"
            :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            :aria-pressed="mostrarPassword"
            @click="mostrarPassword = !mostrarPassword"
          >
            <svg
              v-if="!mostrarPassword"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m3 3 18 18" />
              <path d="M10.6 6.2A10.9 10.9 0 0 1 12 6c6.5 0 10 6 10 6a18.3 18.3 0 0 1-3.2 3.7" />
              <path d="M6.6 6.7C3.8 8.4 2 12 2 12s3.5 6 10 6c1.7 0 3.2-.4 4.5-1.1" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            </svg>
          </button>
        </div>
        <p v-if="errors.password" id="register-password-error" class="auth-field__error">
          {{ errors.password }}
        </p>
        <p id="register-password-hint" class="auth-hint">
          <span class="auth-hint__mark" aria-hidden="true">i</span>
          Mínimo 8 caracteres, con letra y número
        </p>
      </div>

      <button class="btn btn-primary auth-submit" type="submit" :disabled="enviando">
        {{ enviando ? 'Creando cuenta...' : 'Crear cuenta' }}
      </button>
    </form>

    <p class="auth-switch">
      ¿Ya tienes cuenta?
      <RouterLink to="/login">Iniciar sesión</RouterLink>
    </p>
  </AuthShell>
</template>
