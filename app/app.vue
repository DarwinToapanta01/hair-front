<script setup>
const title = 'Johanna Chavez | Cabello Humano'
const description = 'Cabello humano y extensiones premium seleccionadas para resaltar tu belleza natural.'

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: { lang: 'es' }
})

useSeoMeta({ title, description, ogTitle: title, ogDescription: description, twitterCard: 'summary_large_image' })
</script>

<template>
  <UApp>
    <header class="site-header">
      <div class="page-shell header-content">
        <NuxtLink to="/" class="brand" aria-label="Johanna Chavez Cabello Humano, inicio">
          <span class="brand-name">JOHANNA CHAVEZ</span>
          <span class="brand-subtitle">CABELLO HUMANO</span>
        </NuxtLink>
        <nav class="main-nav" aria-label="Navegación principal">
          <NuxtLink to="/tienda">Tienda</NuxtLink><NuxtLink to="/carrito">Carrito</NuxtLink><NuxtLink to="/#texturas">Texturas</NuxtLink><a href="#contacto">Contacto</a>
          <NuxtLink to="/admin/login">Iniciar sesión</NuxtLink>
        </nav>
        <a href="#contacto" class="header-cta">Asesoría personalizada</a>
      </div>
    </header>
    <UMain><NuxtPage /></UMain>
    <footer id="contacto" class="site-footer">
      <div class="page-shell footer-content">
        <div><p class="brand-name">JOHANNA CHAVEZ</p><p class="brand-subtitle">CABELLO HUMANO</p></div>
        <p>© {{ new Date().getFullYear() }} · Belleza que se siente auténtica.</p>
      </div>
    </footer>
  </UApp>
</template>
