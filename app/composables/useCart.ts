export type CartItem = { variantId: string, productName: string, image: string, color: string, length: number, sku: string, price: number, quantity: number }

const cartItems = ref<CartItem[]>([])
const hydrated = ref(false)

export function useCart() {
  const hydrate = () => {
    if (hydrated.value || !import.meta.client) return
    try { cartItems.value = JSON.parse(localStorage.getItem('jc-cart') || '[]') } catch { cartItems.value = [] }
    hydrated.value = true
  }
  const persist = () => { if (import.meta.client) localStorage.setItem('jc-cart', JSON.stringify(cartItems.value)) }
  const add = (item: Omit<CartItem, 'quantity'>) => {
    hydrate()
    const existing = cartItems.value.find(entry => entry.variantId === item.variantId)
    if (existing) existing.quantity += 1
    else cartItems.value.push({ ...item, quantity: 1 })
    persist()
  }
  const updateQuantity = (variantId: string, quantity: number) => {
    hydrate()
    const item = cartItems.value.find(entry => entry.variantId === variantId)
    if (!item) return
    if (quantity < 1) cartItems.value = cartItems.value.filter(entry => entry.variantId !== variantId)
    else item.quantity = quantity
    persist()
  }
  const clear = () => { cartItems.value = []; persist() }
  return { items: cartItems, count: computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0)), total: computed(() => cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)), hydrate, add, updateQuantity, clear }
}
