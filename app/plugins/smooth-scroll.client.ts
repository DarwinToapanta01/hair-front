import Lenis from 'lenis'

export default defineNuxtPlugin(() => {
  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    touchMultiplier: 1.35
  })

  let animationFrame = 0
  const animate = (time: number) => {
    lenis.raf(time)
    animationFrame = requestAnimationFrame(animate)
  }

  animationFrame = requestAnimationFrame(animate)

  return {
    provide: {
      lenis,
      stopSmoothScroll: () => cancelAnimationFrame(animationFrame)
    }
  }
})
