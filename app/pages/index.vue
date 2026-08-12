<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const hero = ref<HTMLElement | null>(null)
const story = ref<HTMLElement | null>(null)
const hairMatch = ref<HTMLElement | null>(null)
const selectedTone = ref('Negro natural')
const selectedLength = ref('60 cm')

const textures = [
  { label: 'Liso', number: '01', image: 'linear-gradient(135deg, #151a1d 0%, #5f513e 48%, #0d1012 100%)', description: 'Caída pulida, brillo delicado.' },
  { label: 'Ondulado', number: '02', image: 'linear-gradient(135deg, #101315 0%, #75654e 48%, #171510 100%)', description: 'Movimiento suave, presencia natural.' },
  { label: 'Rizado', number: '03', image: 'linear-gradient(135deg, #0e1113 0%, #59442c 50%, #141313 100%)', description: 'Definición con carácter y volumen.' },
  { label: 'Afro', number: '04', image: 'linear-gradient(135deg, #101113 0%, #3c2b1f 45%, #151110 100%)', description: 'Textura plena, belleza sin límites.' }
]

const tones = [
  { name: 'Negro natural', value: '#111416' },
  { name: 'Castaño oscuro', value: '#39291f' },
  { name: 'Chocolate', value: '#65412c' },
  { name: 'Miel dorada', value: '#b68b4c' },
  { name: 'Rubio dorado', value: '#dbc184' }
]

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  const context = gsap.context(() => {
    gsap.from('.hero-copy > *', { y: 42, opacity: 0, stagger: .14, duration: 1.15, ease: 'power3.out', delay: .15 })
    gsap.from('.hero-portrait', { scale: 1.08, opacity: 0, duration: 1.8, ease: 'power2.out' })
    gsap.to('.hero-portrait', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero.value, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.from('.intro-reveal', { y: 90, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: story.value, start: 'top 72%' } })
    gsap.from('.texture-card', { y: 100, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.textures-grid', start: 'top 78%' } })
    gsap.from('.match-reveal', { y: 65, opacity: 0, stagger: .15, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: hairMatch.value, start: 'top 70%' } })
  })
  onBeforeUnmount(() => context.revert())
})
</script>

<template>
  <main>
    <section ref="hero" class="hero">
      <div class="hero-portrait" />
      <div class="hero-shade" />
      <div class="hero-grain" />
      <div class="page-shell hero-content">
        <div class="hero-copy">
          <p class="eyebrow">Johanna Chavez · Cabello humano</p>
          <h1>Descubre la versión<br><em>que vive en ti.</em></h1>
          <p>Textura, movimiento y confianza. Una experiencia creada alrededor de tu transformación.</p>
          <a href="#texturas" class="discover-link"><span>Explorar tu estilo</span><i>↓</i></a>
        </div>
        <p class="hero-caption">Edición 01 — Cabello humano premium</p>
      </div>
    </section>

    <section ref="story" class="intro-section">
      <div class="page-shell intro-grid intro-reveal">
        <p class="section-label">01 / La transformación empieza aquí</p>
        <div><h2>No es solo cabello.<br>Es cómo <em>te sientes.</em></h2><p>Tu estilo tiene su propio lenguaje. Encontramos la textura, el tono y la longitud que lo hacen hablar por ti.</p></div>
      </div>
    </section>

    <section id="texturas" class="texture-section">
      <div class="page-shell"><div class="section-top"><p class="section-label">02 / Elige tu textura</p><p>Desliza y explora</p></div>
        <div class="textures-grid"><article v-for="texture in textures" :key="texture.label" class="texture-card" :style="{ '--texture-color': texture.image }"><div class="texture-visual"><span>{{ texture.number }}</span><div class="texture-wave" /></div><div class="texture-info"><h3>{{ texture.label }}</h3><p>{{ texture.description }}</p><button type="button">Descubrir <span>↗</span></button></div></article></div>
      </div>
    </section>

    <section class="tone-section">
      <div class="page-shell tone-layout"><div><p class="section-label">03 / Encuentra tu tono</p><h2>El color que se<br><em>encuentra contigo.</em></h2></div><div class="tone-chooser"><p>Selecciona el punto de partida para tu HairMatch.</p><div class="tone-list"><button v-for="tone in tones" :key="tone.name" type="button" :class="{ active: selectedTone === tone.name }" @click="selectedTone = tone.name"><span :style="{ background: tone.value }" /><b>{{ tone.name }}</b><i v-if="selectedTone === tone.name">✓</i></button></div></div></div>
    </section>

    <section ref="hairMatch" class="match-section">
      <div class="match-backdrop" />
      <div class="page-shell match-content"><p class="section-label match-reveal">04 / HairMatch</p><h2 class="match-reveal">Diseña tu<br><em>próximo look.</em></h2><div class="match-controls match-reveal"><p>Basado en tu tono: <strong>{{ selectedTone }}</strong></p><div class="length-options"><button v-for="length in ['40 cm', '50 cm', '60 cm', '70 cm']" :key="length" type="button" :class="{ active: selectedLength === length }" @click="selectedLength = length">{{ length }}</button></div><a href="#contacto" class="match-cta">Solicitar mi recomendación <span>→</span></a></div></div>
    </section>

    <section class="quality-section"><div class="page-shell quality-grid"><p class="section-label">05 / Nuestra promesa</p><div><h2>Hecho para verse<br>y sentirse <em>real.</em></h2><p>Cabello humano seleccionado para acompañarte con una caída, una textura y un brillo que hablan de calidad.</p><a href="#contacto">Conoce a Johanna Chavez <span>→</span></a></div></div></section>
  </main>
</template>

<style scoped>
.hero { position: relative; isolation: isolate; min-height: calc(100svh - 86px); overflow: hidden; background: var(--ink-deep); color: var(--gold-light); }.hero-portrait { position: absolute; z-index: -3; inset: 0; background: url('/images/hero-johanna-chavez.png') 70% center / cover no-repeat; }.hero-shade { position: absolute; z-index: -2; inset: 0; background: linear-gradient(90deg, rgba(3,8,11,.98) 0%, rgba(3,8,11,.79) 36%, rgba(3,8,11,.13) 70%, rgba(3,8,11,.05)); }.hero-grain { position: absolute; z-index: -1; inset: 0; opacity: .22; background-image: radial-gradient(rgba(233,204,139,.28) .5px, transparent .6px); background-size: 5px 5px; mix-blend-mode: soft-light; }.hero-content { min-height: calc(100svh - 86px); display: flex; flex-direction: column; justify-content: center; padding-block: 5rem; }.hero-copy { max-width: 710px; }.eyebrow, .section-label { font-size: .62rem; letter-spacing: .2em; text-transform: uppercase; }.eyebrow { color: var(--gold); }.hero h1, h2, h3 { font-family: var(--font-serif); font-weight: 500; }.hero h1 { margin: 1.15rem 0 1.4rem; max-width: 760px; font-size: clamp(4rem, 8.5vw, 7.8rem); line-height: .83; letter-spacing: -.06em; }.hero em, h2 em { color: var(--gold); font-weight: 400; }.hero-copy > p:not(.eyebrow) { max-width: 380px; color: rgba(229,210,167,.77); line-height: 1.72; }.discover-link { display: inline-flex; align-items: center; gap: 1.3rem; margin-top: 2.4rem; color: var(--gold-light); font-size: .69rem; letter-spacing: .13em; text-decoration: none; text-transform: uppercase; }.discover-link i { display: grid; width: 2.7rem; height: 2.7rem; place-items: center; border: 1px solid var(--gold); font-size: 1.1rem; font-style: normal; transition: transform .2s; }.discover-link:hover i { transform: translateY(5px); }.hero-caption { position: absolute; bottom: 2rem; color: rgba(229,210,167,.58); font-size: .58rem; letter-spacing: .14em; text-transform: uppercase; }
.intro-section { padding: 10rem 0; background: var(--cream); }.intro-grid { display: grid; grid-template-columns: .65fr 1.35fr; gap: 2rem; }.section-label { color: #806b37; }.intro-grid h2, .tone-section h2, .quality-section h2 { margin: -.5rem 0 1.4rem; font-size: clamp(3rem, 6vw, 5.8rem); line-height: .87; letter-spacing: -.055em; }.intro-grid div > p { max-width: 405px; margin: 0; color: #595a5c; line-height: 1.75; }
.texture-section { padding: 1.2rem 0 10rem; background: var(--cream); }.section-top { display: flex; justify-content: space-between; padding-bottom: 1.4rem; color: #806b37; font-size: .65rem; letter-spacing: .12em; text-transform: uppercase; }.textures-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #c9bb9b; }.texture-card { overflow: hidden; background: #171918; color: var(--gold-light); }.texture-visual { position: relative; height: 420px; overflow: hidden; background: var(--texture-color); }.texture-visual span { position: absolute; z-index: 2; top: 1.2rem; left: 1.2rem; color: rgba(233,204,139,.8); font-size: .65rem; letter-spacing: .14em; }.texture-wave { position: absolute; inset: -20%; background: repeating-radial-gradient(ellipse at 70% 80%, transparent 0 17px, rgba(233,204,139,.14) 18px 21px, transparent 23px 44px); transform: rotate(-12deg) scale(1.2); transition: transform .7s cubic-bezier(.2,.8,.2,1); }.texture-card:hover .texture-wave { transform: rotate(9deg) scale(1.5); }.texture-info { padding: 1.35rem 1.25rem 1.5rem; }.texture-info h3 { margin: 0; font-size: 2.25rem; }.texture-info p { min-height: 2.8rem; margin: .55rem 0 1.1rem; color: rgba(229,210,167,.69); font-size: .78rem; line-height: 1.5; }.texture-info button { border: 0; padding: 0; background: none; color: var(--gold); font-size: .63rem; letter-spacing: .12em; text-transform: uppercase; cursor: pointer; }.texture-info button span { margin-left: .5rem; font-size: 1rem; }
.tone-section { padding: 10rem 0; background: #e9e1d0; }.tone-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 7rem; }.tone-chooser > p { margin: .1rem 0 2rem; color: #595a5c; line-height: 1.65; }.tone-list { border-top: 1px solid #baaa88; }.tone-list button { width: 100%; display: grid; grid-template-columns: 1.5rem 1fr 1rem; align-items: center; gap: 1rem; border: 0; border-bottom: 1px solid #baaa88; padding: 1rem 0; background: transparent; color: var(--ink); text-align: left; cursor: pointer; }.tone-list span { width: 1rem; height: 1rem; border-radius: 50%; }.tone-list b { font-size: .78rem; font-weight: 500; }.tone-list i { color: #806b37; font-style: normal; }
.match-section { position: relative; overflow: hidden; min-height: 720px; display: flex; align-items: center; background: var(--ink-deep); color: var(--gold-light); }.match-backdrop { position: absolute; inset: 0; opacity: .45; background: radial-gradient(ellipse at 65% 47%, rgba(233,204,139,.4), transparent 12%), repeating-radial-gradient(ellipse at 65% 50%, transparent 0 24px, rgba(229,210,167,.18) 26px 30px, transparent 34px 66px); transform: scale(1.8) rotate(-12deg); }.match-content { position: relative; width: 100%; }.match-section h2 { margin: 1.15rem 0 2rem; font-family: var(--font-serif); font-size: clamp(4rem, 8vw, 7.2rem); font-weight: 500; line-height: .83; letter-spacing: -.06em; }.match-controls { max-width: 460px; padding: 1.3rem; border: 1px solid rgba(233,204,139,.4); background: rgba(3,8,11,.5); backdrop-filter: blur(12px); }.match-controls p { margin: 0 0 1.2rem; color: rgba(229,210,167,.75); font-size: .8rem; }.match-controls strong { color: var(--gold); font-weight: 500; }.length-options { display: grid; grid-template-columns: repeat(4, 1fr); gap: .5rem; }.length-options button { border: 1px solid rgba(233,204,139,.42); background: transparent; color: var(--gold-light); padding: .75rem .2rem; font-size: .68rem; cursor: pointer; }.length-options button.active { background: var(--gold); color: var(--ink); border-color: var(--gold); }.match-cta { display: flex; justify-content: space-between; margin-top: 1rem; background: var(--gold); color: var(--ink); padding: .95rem 1rem; font-size: .66rem; font-weight: 600; letter-spacing: .1em; text-decoration: none; text-transform: uppercase; }
.quality-section { padding: 9rem 0; background: var(--cream); }.quality-grid { display: grid; grid-template-columns: .65fr 1.35fr; gap: 2rem; }.quality-grid div { max-width: 700px; }.quality-grid div > p { max-width: 390px; margin: 0 0 1.8rem; color: #595a5c; line-height: 1.75; }.quality-grid a { color: #4b3e21; border-bottom: 1px solid var(--gold); padding-bottom: .45rem; font-size: .7rem; letter-spacing: .1em; text-decoration: none; text-transform: uppercase; }.quality-grid a span { margin-left: .8rem; }
@media (max-width: 850px) { .hero-portrait { background-position: 61% center; }.hero-shade { background: linear-gradient(90deg, rgba(3,8,11,.96), rgba(3,8,11,.57) 72%, rgba(3,8,11,.28)); }.intro-section, .tone-section, .quality-section { padding: 6rem 0; }.texture-section { padding-bottom: 6rem; }.intro-grid, .tone-layout, .quality-grid { grid-template-columns: 1fr; gap: 2.4rem; }.textures-grid { grid-template-columns: repeat(2, 1fr); }.texture-visual { height: 300px; } }
@media (max-width: 560px) { .hero h1 { font-size: clamp(3.65rem, 17vw, 5.4rem); }.hero-content { min-height: calc(100svh - 76px); }.hero-caption { font-size: .48rem; }.textures-grid { grid-template-columns: 1fr; }.texture-visual { height: 260px; }.tone-layout { gap: 2rem; }.match-section { min-height: 670px; }.match-controls { padding: 1rem; }.match-section h2 { font-size: clamp(3.7rem, 16vw, 5rem); } }
</style>
