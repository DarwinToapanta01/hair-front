<script setup lang="ts">
type Option = { id: string, name?: string, inches?: number, hex?: string, code?: string, kind?: 'EXTENSION' | 'WIG' }
type Variant = { id: string, sku: string, price: number | string, stock: number, color: Option, length: Option }
type Image = { id: string, url: string, alt: string, position: number }
type Product = { id: string, name: string, slug: string, kind: 'EXTENSION' | 'WIG', description?: string | null, status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED', category?: Option | null, texture?: Option | null, variants: Variant[], images: Image[] }
type CatalogData = { categories: Option[], textures: Option[], colors: Option[], lengths: Option[] }
type Movement = { id: string, type: string, quantity: number, previousStock: number, resultingStock: number, note?: string | null, createdAt: string }

const config = useRuntimeConfig()
const products = ref<Product[]>([])
const catalog = ref<CatalogData>({ categories: [], textures: [], colors: [], lengths: [] })
const selectedProductId = ref('')
const selectedVariantId = ref('')
const movements = ref<Movement[]>([])
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const productForm = reactive({ kind: 'EXTENSION' as 'EXTENSION' | 'WIG', name: '', slug: '', description: '', status: 'DRAFT' as Product['status'], categoryId: '', textureId: '', imageUrl: '', imageAlt: '' })
const variantForm = reactive({ colorId: '', lengthId: '', sku: '', price: '', stock: '0' })
const adjustmentForm = reactive({ quantity: '', type: 'ADJUSTMENT', note: '' })

const selectedProduct = computed(() => products.value.find(product => product.id === selectedProductId.value))
const selectedVariant = computed(() => selectedProduct.value?.variants.find(variant => variant.id === selectedVariantId.value))
const availableCategories = computed(() => catalog.value.categories.filter(category => category.kind === productForm.kind))

function messageFrom(error: unknown) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data
    if (data?.message) return data.message
  }
  return 'Ocurrió un error. Comprueba que el backend esté iniciado.'
}

async function api<T>(path: string, options?: Parameters<typeof $fetch>[1]) {
  return $fetch<T>(`${config.public.apiBase}/api${path}`, options)
}

async function loadData() {
  loading.value = true
  errorMessage.value = ''
  try {
    const [productList, catalogData] = await Promise.all([api<Product[]>('/admin/products'), api<CatalogData>('/admin/catalog-data')])
    products.value = productList
    catalog.value = catalogData
    if (!selectedProductId.value && productList[0]) selectedProductId.value = productList[0].id
  } catch (error) {
    errorMessage.value = messageFrom(error)
  } finally {
    loading.value = false
  }
}

function createSlug() {
  productForm.slug = productForm.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function createProduct() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const product = await api<Product>('/admin/products', { method: 'POST', body: { kind: productForm.kind, name: productForm.name, slug: productForm.slug, description: productForm.description, status: productForm.status, categoryId: productForm.categoryId || null, textureId: productForm.kind === 'EXTENSION' ? productForm.textureId || null : null } })
    if (productForm.imageUrl) await api(`/admin/products/${product.id}/images`, { method: 'POST', body: { url: productForm.imageUrl, alt: productForm.imageAlt || product.name, position: 0 } })
    Object.assign(productForm, { kind: 'EXTENSION', name: '', slug: '', description: '', status: 'DRAFT', categoryId: '', textureId: '', imageUrl: '', imageAlt: '' })
    selectedProductId.value = product.id
    successMessage.value = 'Producto creado. Ahora agrega sus variantes.'
    await loadData()
  } catch (error) { errorMessage.value = messageFrom(error) } finally { saving.value = false }
}

async function addVariant() {
  if (!selectedProduct.value) return
  saving.value = true
  errorMessage.value = ''
  try {
    await api(`/admin/products/${selectedProduct.value.id}/variants`, { method: 'POST', body: { colorId: variantForm.colorId, lengthId: variantForm.lengthId, sku: variantForm.sku, price: Number(variantForm.price), stock: Number(variantForm.stock) } })
    Object.assign(variantForm, { colorId: '', lengthId: '', sku: '', price: '', stock: '0' })
    successMessage.value = 'Variante añadida correctamente.'
    await loadData()
  } catch (error) { errorMessage.value = messageFrom(error) } finally { saving.value = false }
}

async function selectVariant(variantId: string) {
  selectedVariantId.value = variantId
  movements.value = []
  try { movements.value = await api<Movement[]>(`/admin/variants/${variantId}/movements`) } catch (error) { errorMessage.value = messageFrom(error) }
}

async function adjustStock() {
  if (!selectedVariant.value) return
  saving.value = true
  errorMessage.value = ''
  try {
    await api(`/admin/variants/${selectedVariant.value.id}/stock-adjustments`, { method: 'POST', body: { quantity: Number(adjustmentForm.quantity), type: adjustmentForm.type, note: adjustmentForm.note } })
    Object.assign(adjustmentForm, { quantity: '', type: 'ADJUSTMENT', note: '' })
    successMessage.value = 'Inventario actualizado y movimiento registrado.'
    await loadData()
    await selectVariant(selectedVariant.value.id)
  } catch (error) { errorMessage.value = messageFrom(error) } finally { saving.value = false }
}

async function archiveProduct(product: Product) {
  if (!confirm(`¿Archivar “${product.name}”? Ya no aparecerá en la tienda.`)) return
  try {
    await api(`/admin/products/${product.id}`, { method: 'DELETE' })
    if (selectedProductId.value === product.id) selectedProductId.value = ''
    successMessage.value = 'Producto archivado.'
    await loadData()
  } catch (error) { errorMessage.value = messageFrom(error) }
}

watch(selectedProductId, () => { selectedVariantId.value = ''; movements.value = [] })
onMounted(loadData)
</script>

<template>
  <main class="admin-page">
    <section class="admin-hero"><div class="page-shell"><p class="eyebrow">Área interna</p><h1>Catálogo e inventario</h1><p>Gestiona extensiones, pelucas, variantes y existencias desde un solo lugar.</p></div></section>
    <section class="page-shell admin-content">
      <div v-if="errorMessage" class="notice error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="notice success">{{ successMessage }}</div>
      <div class="admin-grid">
        <aside class="product-list panel"><div class="panel-head"><div><p class="panel-label">Productos</p><strong>{{ products.length }} registrados</strong></div><button class="text-button" type="button" @click="loadData">Actualizar</button></div><p v-if="loading" class="empty">Cargando catálogo…</p><button v-for="product in products" :key="product.id" type="button" class="product-row" :class="{ active: selectedProductId === product.id }" @click="selectedProductId = product.id"><img v-if="product.images[0]" :src="product.images[0].url" :alt="product.images[0].alt"><span v-else class="image-empty">JC</span><span><b>{{ product.name }}</b><small>{{ product.kind === 'EXTENSION' ? product.texture?.name || 'Extensión' : 'Peluca' }} · {{ product.variants.length }} variantes</small></span><i :class="product.status.toLowerCase()">{{ product.status }}</i></button></aside>

        <div class="workspace">
          <section class="panel form-panel"><div class="panel-head"><div><p class="panel-label">Nuevo producto</p><strong>Datos principales</strong></div></div><form @submit.prevent="createProduct"><div class="form-grid"><label>Tipo<select v-model="productForm.kind"><option value="EXTENSION">Extensión</option><option value="WIG">Peluca</option></select></label><label>Estado<select v-model="productForm.status"><option value="DRAFT">Borrador</option><option value="ACTIVE">Activo en tienda</option></select></label><label class="span-2">Nombre<input v-model="productForm.name" required placeholder="Ej. Extensión Ondulada Natural" @blur="!productForm.slug && createSlug()"></label><label class="span-2">Slug<input v-model="productForm.slug" required placeholder="extension-ondulada-natural"></label><label>Categoría<select v-model="productForm.categoryId"><option value="">Sin categoría</option><option v-for="category in availableCategories" :key="category.id" :value="category.id">{{ category.name }}</option></select></label><label v-if="productForm.kind === 'EXTENSION'">Textura<select v-model="productForm.textureId"><option value="">Seleccionar</option><option v-for="texture in catalog.textures" :key="texture.id" :value="texture.id">{{ texture.name }}</option></select></label><label class="span-2">Descripción<textarea v-model="productForm.description" rows="3" placeholder="Describe el producto y sus características."></textarea></label><label class="span-2">URL de imagen principal<input v-model="productForm.imageUrl" type="url" placeholder="https://… o /images/producto.png"></label><label class="span-2">Texto alternativo de imagen<input v-model="productForm.imageAlt" placeholder="Extensión de cabello humano…"></label></div><button class="primary-button" :disabled="saving">{{ saving ? 'Guardando…' : 'Crear producto' }}</button></form></section>

          <section v-if="selectedProduct" class="panel product-detail"><div class="panel-head"><div><p class="panel-label">Producto seleccionado</p><h2>{{ selectedProduct.name }}</h2><small>{{ selectedProduct.slug }} · {{ selectedProduct.status }}</small></div><button type="button" class="archive-button" @click="archiveProduct(selectedProduct)">Archivar</button></div><div class="variants-layout"><form class="variant-form" @submit.prevent="addVariant"><p class="section-title">Añadir variante</p><label>Color<select v-model="variantForm.colorId" required><option value="">Seleccionar</option><option v-for="color in catalog.colors" :key="color.id" :value="color.id">{{ color.name }}</option></select></label><label>Longitud<select v-model="variantForm.lengthId" required><option value="">Seleccionar</option><option v-for="length in catalog.lengths" :key="length.id" :value="length.id">{{ length.inches }}″</option></select></label><label>SKU<input v-model="variantForm.sku" required placeholder="JC-OND-20-1B"></label><label>Precio USD<input v-model="variantForm.price" required min="0" step="0.01" type="number" placeholder="0.00"></label><label>Stock inicial<input v-model="variantForm.stock" required min="0" step="1" type="number"></label><button class="primary-button" :disabled="saving">Añadir variante</button></form><div><p class="section-title">Variantes disponibles</p><p v-if="!selectedProduct.variants.length" class="empty">Todavía no hay variantes.</p><button v-for="variant in selectedProduct.variants" :key="variant.id" type="button" class="variant-row" :class="{ active: selectedVariantId === variant.id }" @click="selectVariant(variant.id)"><span class="color-dot" :style="{ background: variant.color.hex || '#9e9e9e' }"></span><span><b>{{ variant.color.name }} · {{ variant.length.inches }}″</b><small>{{ variant.sku }} · ${{ Number(variant.price).toFixed(2) }}</small></span><strong>{{ variant.stock }} u.</strong></button></div></div></section>

          <section v-if="selectedVariant" class="panel inventory-panel"><div><p class="panel-label">Inventario</p><h2>{{ selectedVariant.color.name }} · {{ selectedVariant.length.inches }}″</h2><p class="stock-total">{{ selectedVariant.stock }} <span>unidades disponibles</span></p></div><form class="adjustment-form" @submit.prevent="adjustStock"><label>Movimiento<select v-model="adjustmentForm.type"><option value="ADJUSTMENT">Ajuste manual</option><option value="SALE">Venta</option><option value="RETURN">Devolución</option></select></label><label>Cantidad <small>Positiva suma; negativa resta.</small><input v-model="adjustmentForm.quantity" required step="1" type="number" placeholder="Ej. 5 o -1"></label><label>Nota<input v-model="adjustmentForm.note" placeholder="Ej. Recepción de proveedor"></label><button class="primary-button" :disabled="saving">Registrar movimiento</button></form><div class="movement-list"><p class="section-title">Historial</p><p v-if="!movements.length" class="empty">Sin movimientos registrados.</p><div v-for="movement in movements" :key="movement.id" class="movement-row"><span :class="movement.quantity > 0 ? 'plus' : 'minus'">{{ movement.quantity > 0 ? '+' : '' }}{{ movement.quantity }}</span><span><b>{{ movement.type }}</b><small>{{ movement.note || 'Sin nota' }} · {{ new Date(movement.createdAt).toLocaleDateString('es-EC') }}</small></span><small>{{ movement.previousStock }} → {{ movement.resultingStock }}</small></div></div></section>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.admin-page { min-height: 100vh; background: #f5f2eb; }.admin-hero { padding: 3.5rem 0 3rem; background: var(--ink); color: var(--cream); }.eyebrow, .panel-label { margin: 0 0 .45rem; color: #af8b41; font-size: .62rem; letter-spacing: .15em; text-transform: uppercase; }.admin-hero h1 { margin: 0; font-family: var(--font-serif); font-size: clamp(2.8rem, 6vw, 5rem); font-weight: 500; line-height: .9; }.admin-hero p:last-child { max-width: 500px; margin: 1rem 0 0; color: #d6cec0; }.admin-content { padding-block: 2.5rem 5rem; }.admin-grid { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 1.4rem; align-items: start; }.workspace { display: grid; gap: 1.4rem; }.panel { border: 1px solid #ddd2bc; background: #fffdfa; box-shadow: 0 10px 30px rgba(28, 24, 15, .04); }.panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1.15rem 1.2rem; border-bottom: 1px solid #e5dccb; }.panel-head strong, .panel-head h2 { font-family: var(--font-serif); font-size: 1.5rem; font-weight: 600; }.panel-head h2 { margin: 0; }.panel-head small, .product-row small, .variant-row small, .movement-row small { display: block; margin-top: .25rem; color: #776f61; font-size: .68rem; }.text-button, .archive-button { border: 0; background: transparent; color: #806b37; cursor: pointer; font-size: .68rem; letter-spacing: .08em; text-transform: uppercase; }.archive-button { color: #9a443b; }.product-list { position: sticky; top: 1rem; max-height: calc(100vh - 2rem); overflow: auto; }.product-row { display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; align-items: center; width: 100%; gap: .75rem; padding: .85rem 1.1rem; border: 0; border-bottom: 1px solid #eee7da; background: transparent; color: var(--ink); text-align: left; cursor: pointer; }.product-row:hover, .product-row.active { background: #f3ecdd; }.product-row img, .image-empty { width: 44px; height: 44px; object-fit: contain; background: #171918; }.image-empty { display: grid; place-items: center; color: var(--gold); font-family: var(--font-serif); }.product-row b, .variant-row b { display: block; font-size: .78rem; }.product-row i { font-size: .5rem; font-style: normal; letter-spacing: .08em; }.product-row i.active { color: #527640; }.product-row i.draft { color: #aa7d2b; }.product-row i.archived { color: #9b3932; }.form-panel form { padding: 1.2rem; }.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .9rem; }.span-2 { grid-column: span 2; } label { display: grid; gap: .38rem; color: #625a4c; font-size: .68rem; letter-spacing: .06em; text-transform: uppercase; } input, select, textarea { box-sizing: border-box; width: 100%; border: 1px solid #d9cfbc; border-radius: 0; padding: .67rem .7rem; background: #fffdf8; color: var(--ink); font: inherit; font-size: .82rem; letter-spacing: normal; text-transform: none; } textarea { resize: vertical; }.primary-button { margin-top: 1.1rem; border: 1px solid var(--ink); background: var(--ink); color: var(--gold); padding: .72rem 1rem; cursor: pointer; font-size: .67rem; letter-spacing: .1em; text-transform: uppercase; }.primary-button:disabled { opacity: .55; cursor: wait; }.product-detail { padding-bottom: 1.2rem; }.variants-layout { display: grid; grid-template-columns: minmax(220px, .7fr) minmax(280px, 1.3fr); gap: 1.5rem; padding: 1.2rem; }.variant-form { display: grid; align-content: start; gap: .75rem; padding-right: 1.5rem; border-right: 1px solid #e5dccb; }.section-title { margin: 0 0 .75rem; color: #806b37; font-size: .64rem; letter-spacing: .12em; text-transform: uppercase; }.variant-row { display: grid; grid-template-columns: 12px minmax(0, 1fr) auto; align-items: center; width: 100%; gap: .65rem; padding: .7rem 0; border: 0; border-bottom: 1px solid #eee7da; background: transparent; color: var(--ink); text-align: left; cursor: pointer; }.variant-row.active { color: #806b37; }.variant-row strong { font-size: .72rem; }.color-dot { width: 10px; height: 10px; border: 1px solid #5d5547; border-radius: 50%; }.inventory-panel { display: grid; grid-template-columns: .8fr 1fr 1.2fr; gap: 1.4rem; padding: 1.3rem; }.inventory-panel h2 { margin: 0; font-family: var(--font-serif); font-size: 2rem; font-weight: 500; }.stock-total { margin: 1rem 0 0; font-family: var(--font-serif); font-size: 2.8rem; line-height: 1; }.stock-total span { display: block; margin-top: .4rem; font-family: var(--font-sans); font-size: .68rem; letter-spacing: .08em; text-transform: uppercase; }.adjustment-form { display: grid; gap: .65rem; }.adjustment-form .primary-button { align-self: end; }.adjustment-form small { color: #8a8173; font-size: .6rem; letter-spacing: normal; text-transform: none; }.movement-list { border-left: 1px solid #e5dccb; padding-left: 1.4rem; }.movement-row { display: grid; grid-template-columns: 48px 1fr auto; gap: .55rem; align-items: center; padding: .55rem 0; border-bottom: 1px solid #eee7da; }.movement-row > span:first-child { font-weight: 700; }.plus { color: #557041; }.minus { color: #a24b40; }.movement-row b { font-size: .7rem; letter-spacing: .06em; }.empty { padding: 1rem 1.2rem; color: #837a6d; font-size: .8rem; }.notice { margin-bottom: 1rem; padding: .85rem 1rem; font-size: .8rem; }.notice.error { background: #f6dfdb; color: #842f28; }.notice.success { background: #e1eadb; color: #486137; }
@media (max-width: 950px) { .admin-grid { grid-template-columns: 1fr; }.product-list { position: static; max-height: 300px; }.inventory-panel { grid-template-columns: 1fr; }.movement-list { border-top: 1px solid #e5dccb; border-left: 0; padding-top: 1rem; padding-left: 0; } }
@media (max-width: 620px) { .form-grid, .variants-layout { grid-template-columns: 1fr; }.span-2 { grid-column: auto; }.variant-form { padding-right: 0; border-right: 0; border-bottom: 1px solid #e5dccb; padding-bottom: 1rem; }.admin-hero { padding-block: 2.5rem; } }
</style>
