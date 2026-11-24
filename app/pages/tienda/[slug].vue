<script setup lang="ts">
type Variant = { sku: string, color: string, length: number, price: number, stock: number }
type Product = { id: string, slug: string, name: string, kind: 'EXTENSION' | 'WIG', texture?: string, image: string, images: Array<{ url: string, alt: string }>, description: string, variants: Variant[] }

const route = useRoute()
const config = useRuntimeConfig()
const { data: product, error } = await useAsyncData<Product>(`product-${route.params.slug}`, () => $fetch(`${config.public.apiBase}/api/catalog/${route.params.slug}`))
const selectedColor = ref('')
const selectedLength = ref<number | null>(null)

watch(product, (value) => {
  if (!value) return
  selectedColor.value = value.variants[0]?.color || ''
  selectedLength.value = value.variants[0]?.length || null
}, { immediate: true })

const colors = computed(() => [...new Set(product.value?.variants.map(variant => variant.color) || [])])
const lengths = computed(() => [...new Set(product.value?.variants.filter(variant => variant.color === selectedColor.value).map(variant => variant.length) || [])])
const selectedVariant = computed(() => product.value?.variants.find(variant => variant.color === selectedColor.value && variant.length === selectedLength.value))
const selectColor = (color: string) => {
  selectedColor.value = color
  selectedLength.value = product.value?.variants.find(variant => variant.color === color)?.length || null
}
const whatsappLink = computed(() => {
  if (!product.value || !selectedVariant.value) return '#'
  const message = `Hola, quiero consultar ${product.value.name}, color ${selectedVariant.value.color}, ${selectedVariant.value.length} pulgadas. SKU: ${selectedVariant.value.sku}.`
  return `https://wa.me/593999499990?text=${encodeURIComponent(message)}`
})
</script>

<template>
  <main class="detail-page">
    <div class="page-shell breadcrumb"><NuxtLink to="/tienda">Tienda</NuxtLink><span> / </span><span>{{ product?.name || 'Producto' }}</span></div>
    <section v-if="product" class="detail-layout page-shell">
      <div class="product-gallery">
        <div class="product-image"><span>{{ product.kind === 'EXTENSION' ? product.texture : 'Peluca' }}</span><img :src="product.image" :alt="product.name"></div>
        <p>Cabello 100% humano · Natural virgen</p>
      </div>
      <div class="detail-info">
        <p class="detail-kicker">{{ product.kind === 'EXTENSION' ? 'Extensión de cabello humano' : 'Peluca de cabello humano' }}</p>
        <h1>{{ product.name }}</h1>
        <p class="description">{{ product.description }}</p>
        <div class="option-group"><p>Color <strong>{{ selectedColor }}</strong></p><div class="color-options"><button v-for="color in colors" :key="color" type="button" :class="{ active: selectedColor === color }" @click="selectColor(color)">{{ color }}</button></div></div>
        <div class="option-group"><p>Longitud <strong>{{ selectedLength }}″</strong></p><div class="length-options"><button v-for="length in lengths" :key="length" type="button" :class="{ active: selectedLength === length }" @click="selectedLength = length">{{ length }}″</button></div></div>
        <div v-if="selectedVariant" class="purchase-box"><div><p class="price">${{ selectedVariant.price.toFixed(2) }}</p><p :class="selectedVariant.stock > 0 ? 'available' : 'sold-out'">{{ selectedVariant.stock > 0 ? `${selectedVariant.stock} disponibles` : 'Agotado temporalmente' }}</p></div><a v-if="selectedVariant.stock > 0" :href="whatsappLink" target="_blank" rel="noopener" class="whatsapp-link">Consultar por WhatsApp <span>→</span></a></div>
        <div class="promises"><p><b>Envíos</b> a todo Ecuador</p><p><b>Calidad</b> suave, sedoso y durable</p><p><b>Asesoría</b> para elegir tu tono</p></div>
      </div>
    </section>
    <section v-else class="page-shell product-error"><h1>Producto no encontrado</h1><p>{{ error ? 'No pudimos cargar este producto.' : 'Este producto no está disponible.' }}</p><NuxtLink to="/tienda">Volver a la tienda</NuxtLink></section>
  </main>
</template>

<style scoped>
.detail-page { min-height: 100vh; background: var(--cream); }
.breadcrumb { padding-top: 1.8rem; color: #806b37; font-size: .66rem; letter-spacing: .1em; text-transform: uppercase; }
.breadcrumb a { color: var(--ink); text-decoration: none; }
.detail-layout { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(340px, .95fr); gap: clamp(2.5rem, 6vw, 5.5rem); padding-block: 1.4rem 5rem; }
.product-gallery { display: grid; align-content: start; gap: .75rem; }
.product-image { position: relative; display: grid; height: clamp(360px, 42vw, 520px); place-items: center; overflow: hidden; background: radial-gradient(circle at 50% 74%, #76633f, #151716 64%); }
.product-image > span { position: absolute; z-index: 2; top: 1rem; left: 1rem; color: var(--gold); font-size: .63rem; letter-spacing: .16em; text-transform: uppercase; }
.product-image img { width: 82%; height: 86%; object-fit: contain; filter: drop-shadow(0 20px 18px rgba(0, 0, 0, .48)); }
.product-gallery > p { margin: 0; color: #82692f; font-size: .62rem; letter-spacing: .14em; text-align: right; text-transform: uppercase; }
.detail-info { align-self: start; padding-top: .4rem; }
.detail-kicker { margin: 0 0 .75rem; color: #806b37; font-size: .62rem; letter-spacing: .15em; text-transform: uppercase; }
.detail-info h1 { margin: 0; font-family: var(--font-serif); font-size: clamp(2.55rem, 4vw, 4.25rem); font-weight: 500; line-height: .94; letter-spacing: -.045em; }
.description { max-width: 430px; margin: 1.1rem 0 1.7rem; color: #58595a; font-size: .93rem; line-height: 1.65; }
.option-group { margin-top: 1.2rem; }.option-group > p { display: flex; justify-content: space-between; margin: 0 0 .65rem; font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; }.option-group strong { color: #806b37; font-weight: 600; }
.color-options, .length-options { display: flex; flex-wrap: wrap; gap: .45rem; }.color-options button, .length-options button { border: 1px solid #cdbf9f; padding: .62rem .78rem; background: transparent; color: var(--ink); font-size: .72rem; cursor: pointer; }.color-options button.active, .length-options button.active { border-color: var(--ink); background: var(--ink); color: var(--gold-light); }
.purchase-box { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1.7rem; padding: .95rem 0; border-block: 1px solid #cdbf9f; }.price { margin: 0; font-family: var(--font-serif); font-size: 2rem; }.available, .sold-out { margin: .15rem 0 0; font-size: .67rem; }.available { color: #557041; }.sold-out { color: #9b3932; }
.whatsapp-link { display: inline-flex; align-items: center; gap: .75rem; background: var(--ink); color: var(--gold); padding: .82rem .9rem; font-size: .64rem; letter-spacing: .1em; text-decoration: none; text-transform: uppercase; }
.promises { display: grid; grid-template-columns: repeat(3, 1fr); gap: .8rem; margin-top: 1.25rem; color: #666; font-size: .7rem; line-height: 1.45; }.promises p { margin: 0; }.promises b { display: block; color: var(--ink); }
.product-error { padding-block: 7rem; }.product-error h1 { font-family: var(--font-serif); font-size: 4rem; font-weight: 500; }.product-error a { color: #806b37; }
@media (max-width: 800px) { .detail-layout { grid-template-columns: 1fr; gap: 2rem; }.product-image { height: min(105vw, 520px); }.detail-info { max-width: 600px; }.breadcrumb { padding-top: 1.5rem; }.promises { grid-template-columns: 1fr; }.purchase-box { align-items: flex-start; flex-direction: column; }.whatsapp-link { width: 100%; justify-content: space-between; } }
</style>
