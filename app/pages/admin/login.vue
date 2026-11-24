<script setup lang="ts">
const config = useRuntimeConfig()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function login() {
  loading.value = true
  errorMessage.value = ''
  try {
    await $fetch(`${config.public.apiBase}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      body: { email: email.value, password: password.value }
    })
    await navigateTo('/admin')
  } catch (error) {
    const message = error && typeof error === 'object' && 'data' in error
      ? (error as { data?: { message?: string } }).data?.message
      : undefined
    errorMessage.value = message || 'No fue posible iniciar sesión.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-card">
      <NuxtLink to="/" class="brand"><span class="brand-name">JOHANNA CHAVEZ</span><span class="brand-subtitle">CABELLO HUMANO</span></NuxtLink>
      <div class="login-intro"><p class="eyebrow">Acceso privado</p><h1>Administración</h1><p>Ingresa con tu cuenta para gestionar catálogo e inventario.</p></div>
      <form @submit.prevent="login"><label>Correo electrónico<input v-model="email" required autocomplete="email" type="email" placeholder="tu@correo.com"></label><label>Contraseña<input v-model="password" required autocomplete="current-password" type="password" placeholder="••••••••••••"></label><p v-if="errorMessage" class="error">{{ errorMessage }}</p><button :disabled="loading" type="submit">{{ loading ? 'Ingresando…' : 'Ingresar al panel' }}</button></form>
    </section>
  </main>
</template>

<style scoped>
.login-page { display: grid; min-height: 100vh; place-items: center; padding: 1.5rem; background: radial-gradient(circle at 50% 0%, #332c1e, var(--ink) 50%); }.login-card { width: min(100%, 430px); padding: 2.3rem; background: var(--cream); box-shadow: 0 20px 70px rgba(0, 0, 0, .35); }.brand { display: inline-flex; flex-direction: column; color: var(--ink); line-height: 1; letter-spacing: .18em; text-decoration: none; }.brand-name { font-family: var(--font-serif); font-size: 1.18rem; font-weight: 600; letter-spacing: .15em; }.brand-subtitle { margin-top: .45rem; font-size: .55rem; letter-spacing: .33em; }.login-intro { margin: 3.5rem 0 2rem; }.eyebrow { margin: 0 0 .6rem; color: #8b6a29; font-size: .62rem; letter-spacing: .16em; text-transform: uppercase; }.login-intro h1 { margin: 0; font-family: var(--font-serif); font-size: 3.4rem; font-weight: 500; line-height: .9; }.login-intro p:last-child { color: #6d675d; line-height: 1.6; } form { display: grid; gap: 1rem; } label { display: grid; gap: .45rem; color: #625a4c; font-size: .68rem; letter-spacing: .08em; text-transform: uppercase; } input { box-sizing: border-box; width: 100%; border: 1px solid #d9cfbc; padding: .8rem; background: #fffdf8; color: var(--ink); font: inherit; font-size: .9rem; letter-spacing: normal; text-transform: none; } button { margin-top: .45rem; border: 1px solid var(--ink); background: var(--ink); color: var(--gold); padding: .9rem 1rem; cursor: pointer; font-size: .68rem; letter-spacing: .12em; text-transform: uppercase; } button:disabled { opacity: .6; cursor: wait; }.error { margin: 0; color: #9a322a; font-size: .8rem; }
</style>
