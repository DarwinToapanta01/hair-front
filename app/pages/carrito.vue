<script setup lang="ts">
const config = useRuntimeConfig()
const { items, total, hydrate, updateQuantity, clear } = useCart()
const form = reactive({ name: '', phone: '', email: '', city: '', address: '', notes: '' })
const errorMessage = ref('')
const submitting = ref(false)
const createdCode = ref('')
onMounted(hydrate)

async function submitOrder() {
  if (!items.value.length) return
  submitting.value = true
  errorMessage.value = ''
  try {
    const order = await $fetch<{ code: string, items: Array<{ productName: string, colorName: string, lengthInches: number, quantity: number }>, total: number }>(`${config.public.apiBase}/api/orders`, { method: 'POST', body: { customer: { name: form.name, phone: form.phone, email: form.email || undefined }, city: form.city, address: form.address, notes: form.notes || undefined, items: items.value.map(item => ({ variantId: item.variantId, quantity: item.quantity })) } })
    createdCode.value = order.code
    const details = order.items.map(item => `• ${item.productName} — ${item.colorName}, ${item.lengthInches}″ x${item.quantity}`).join('\n')
    const text = `Hola, deseo confirmar mi pedido ${order.code}.\n\n${details}\n\nTotal: $${order.total.toFixed(2)}\nCliente: ${form.name}\nCiudad: ${form.city}\nDirección: ${form.address}`
    clear()
    window.open(`https://wa.me/593999499990?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  } catch (error) {
    errorMessage.value = error && typeof error === 'object' && 'data' in error ? (error as { data?: { message?: string } }).data?.message || 'No se pudo crear el pedido.' : 'No se pudo crear el pedido.'
  } finally { submitting.value = false }
}
</script>

<template>
  <main class="cart-page"><section class="page-shell"><div class="cart-heading"><p>Tu selección</p><h1>Carrito</h1></div><div v-if="createdCode" class="success">Pedido {{ createdCode }} creado. Te abrimos WhatsApp para enviarlo a Johanna.</div><div v-if="!items.length && !createdCode" class="empty"><h2>Tu carrito está vacío.</h2><NuxtLink to="/tienda">Explorar productos</NuxtLink></div><div v-else-if="!createdCode" class="cart-layout"><section class="items"><article v-for="item in items" :key="item.variantId" class="cart-item"><img :src="item.image" :alt="item.productName"><div><p>{{ item.productName }}</p><small>{{ item.color }} · {{ item.length }}″ · {{ item.sku }}</small><strong>${{ item.price.toFixed(2) }}</strong></div><div class="quantity"><button @click="updateQuantity(item.variantId, item.quantity - 1)">−</button><span>{{ item.quantity }}</span><button @click="updateQuantity(item.variantId, item.quantity + 1)">+</button></div></article></section><aside class="checkout"><p>Resumen</p><h2>${{ total.toFixed(2) }}</h2><small>El stock se confirma cuando Johanna apruebe el pedido.</small><form @submit.prevent="submitOrder"><input v-model="form.name" required placeholder="Nombre completo"><input v-model="form.phone" required placeholder="WhatsApp"><input v-model="form.email" type="email" placeholder="Correo (opcional)"><input v-model="form.city" required placeholder="Ciudad"><textarea v-model="form.address" required placeholder="Dirección de entrega"></textarea><textarea v-model="form.notes" placeholder="Notas del pedido (opcional)"></textarea><p v-if="errorMessage" class="error">{{ errorMessage }}</p><button :disabled="submitting">{{ submitting ? 'Creando pedido…' : 'Solicitar por WhatsApp' }}</button></form></aside></div></section></main>
</template>

<style scoped>
.cart-page { min-height: 75vh; padding-block: 4rem; background: var(--cream); }.cart-heading > p, .checkout > p { margin: 0 0 .5rem; color: #806b37; font-size: .65rem; letter-spacing: .14em; text-transform: uppercase; }.cart-heading h1 { margin: 0 0 2rem; font-family: var(--font-serif); font-size: 4rem; font-weight: 500; }.cart-layout { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 3rem; }.items { border-top: 1px solid #d9cfbc; }.cart-item { display: grid; grid-template-columns: 95px 1fr auto; gap: 1rem; align-items: center; padding: 1rem 0; border-bottom: 1px solid #d9cfbc; }.cart-item img { width: 95px; height: 95px; object-fit: contain; background: #171918; }.cart-item p { margin: 0; font-family: var(--font-serif); font-size: 1.5rem; }.cart-item small, .checkout small { display: block; color: #766f64; font-size: .72rem; }.cart-item strong { display: block; margin-top: .6rem; }.quantity { display: flex; align-items: center; border: 1px solid #d9cfbc; }.quantity button { width: 30px; border: 0; background: transparent; font-size: 1rem; cursor: pointer; }.quantity span { min-width: 24px; text-align: center; }.checkout { align-self: start; padding: 1.4rem; background: #f2ecde; }.checkout h2 { margin: 0; font-family: var(--font-serif); font-size: 3rem; }.checkout form { display: grid; gap: .7rem; margin-top: 1.2rem; }.checkout input, .checkout textarea { box-sizing: border-box; width: 100%; border: 1px solid #d1c4aa; padding: .72rem; background: #fffdf8; font: inherit; font-size: .8rem; }.checkout textarea { min-height: 75px; resize: vertical; }.checkout button, .empty a { border: 0; background: var(--ink); color: var(--gold); padding: .85rem; text-align: center; cursor: pointer; font-size: .68rem; letter-spacing: .1em; text-decoration: none; text-transform: uppercase; }.error { margin: 0; color: #992e28; font-size: .75rem; }.empty { padding: 3rem; background: #f2ecde; text-align: center; }.empty h2 { font-family: var(--font-serif); font-size: 2.5rem; font-weight: 500; }.success { padding: 1rem; background: #e1eadb; color: #486137; } @media (max-width: 800px) { .cart-layout { grid-template-columns: 1fr; }.cart-page { padding-block: 2rem; }.cart-heading h1 { font-size: 3rem; } }
</style>
