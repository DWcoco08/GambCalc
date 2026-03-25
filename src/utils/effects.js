import gsap from 'gsap'

// ==================== SCREEN EFFECTS ====================

export function screenShake(intensity = 1) {
  const root = document.getElementById('root')
  if (!root) return
  const d = 4 * intensity
  gsap.timeline()
    .to(root, { x: d, y: d * 0.5, duration: 0.04 })
    .to(root, { x: -d, y: -d * 0.3, duration: 0.04 })
    .to(root, { x: d * 0.8, y: d * 0.4, duration: 0.04 })
    .to(root, { x: -d * 0.6, y: -d * 0.2, duration: 0.04 })
    .to(root, { x: d * 0.3, duration: 0.04 })
    .to(root, { x: 0, y: 0, duration: 0.04 })
}

function createOverlay(styles) {
  const el = document.createElement('div')
  el.style.cssText = `position:fixed;inset:0;z-index:9999;pointer-events:none;${styles}`
  document.body.appendChild(el)
  return el
}

export function screenFlash(color = 'rgba(255,255,255,0.4)', duration = 0.4) {
  const el = createOverlay(`background:${color};`)
  gsap.to(el, { opacity: 0, duration, ease: 'power2.out', onComplete: () => el.remove() })
}

export function screenDarken(duration = 2) {
  const el = createOverlay('background:radial-gradient(circle,transparent 20%,rgba(0,0,0,0.8) 100%);opacity:0;')
  gsap.to(el, { opacity: 1, duration: 0.4, onComplete: () => {
    gsap.to(el, { opacity: 0, duration, delay: 0.8, onComplete: () => el.remove() })
  }})
}

// ==================== FIRE PARTICLES (CSS + GSAP) ====================

function createParticle(container, emoji, size = 24) {
  const p = document.createElement('div')
  p.textContent = emoji
  p.style.cssText = `position:absolute;font-size:${size}px;pointer-events:none;will-change:transform,opacity;`
  container.appendChild(p)
  return p
}

export function fireEffect(intensity = 1) {
  const container = createOverlay('')
  const count = Math.floor(15 * intensity)
  const emojis = intensity >= 3 ? ['🔥', '⚡', '💜', '🟣'] : intensity >= 2 ? ['🔥', '🔥', '💥'] : ['🔥', '✨']

  for (let i = 0; i < count; i++) {
    const p = createParticle(container, emojis[i % emojis.length], 16 + Math.random() * 20)
    const startX = 10 + Math.random() * 80
    const startY = 90 + Math.random() * 10
    gsap.set(p, { left: `${startX}%`, top: `${startY}%`, opacity: 0 })
    gsap.to(p, {
      top: `${10 + Math.random() * 40}%`,
      left: `${startX + (Math.random() - 0.5) * 30}%`,
      opacity: 1,
      scale: 0.5 + Math.random(),
      rotation: (Math.random() - 0.5) * 360,
      duration: 0.8 + Math.random() * 0.8,
      delay: Math.random() * 0.5,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(p, { opacity: 0, scale: 0, duration: 0.3, onComplete: () => p.remove() })
      },
    })
  }
  setTimeout(() => container.remove(), 3000)
}

// ==================== RAIN + STORM ====================

export function rainEffect(intensity = 1) {
  const container = createOverlay('')
  const count = Math.floor(30 * intensity)

  for (let i = 0; i < count; i++) {
    const drop = document.createElement('div')
    drop.style.cssText = `position:absolute;width:2px;height:${10 + Math.random() * 20}px;background:linear-gradient(transparent,rgba(100,150,255,0.6));border-radius:2px;pointer-events:none;`
    container.appendChild(drop)
    const x = Math.random() * 100
    gsap.set(drop, { left: `${x}%`, top: '-5%', opacity: 0 })
    gsap.to(drop, {
      top: '105%',
      opacity: 0.7,
      duration: 0.6 + Math.random() * 0.4,
      delay: Math.random() * 2,
      ease: 'none',
      repeat: intensity >= 2 ? 2 : 1,
      onComplete: () => drop.remove(),
    })
  }
  setTimeout(() => container.remove(), 5000)
}

export function lightningFlash() {
  screenFlash('rgba(200,220,255,0.6)', 0.15)
  setTimeout(() => screenFlash('rgba(200,220,255,0.3)', 0.2), 200)
  screenShake(1.5)
}

// ==================== SNOW + ICE ====================

export function snowEffect() {
  const container = createOverlay('')
  const count = 40

  for (let i = 0; i < count; i++) {
    const snow = createParticle(container, ['❄️', '❄', '✧', '•'][Math.floor(Math.random() * 4)], 10 + Math.random() * 16)
    const x = Math.random() * 100
    gsap.set(snow, { left: `${x}%`, top: '-5%', opacity: 0 })
    gsap.to(snow, {
      top: '105%',
      left: `${x + (Math.random() - 0.5) * 20}%`,
      opacity: 0.8,
      rotation: Math.random() * 720,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2,
      ease: 'none',
      onComplete: () => snow.remove(),
    })
  }

  // Ice overlay
  const ice = createOverlay('background:radial-gradient(circle,transparent 40%,rgba(59,130,246,0.15) 100%);opacity:0;')
  gsap.to(ice, { opacity: 1, duration: 0.5, onComplete: () => {
    gsap.to(ice, { opacity: 0, duration: 2, delay: 1.5, onComplete: () => ice.remove() })
  }})

  setTimeout(() => container.remove(), 6000)
}

// ==================== HORROR / DARK ====================

export function horrorEffect() {
  // Dark vignette closing in
  const dark = createOverlay('background:radial-gradient(circle,transparent 10%,rgba(0,0,0,0.9) 80%);opacity:0;')
  gsap.to(dark, { opacity: 1, duration: 0.6, onComplete: () => {
    gsap.to(dark, { opacity: 0, duration: 1.5, delay: 1, onComplete: () => dark.remove() })
  }})

  // Skull particles
  const container = createOverlay('')
  for (let i = 0; i < 5; i++) {
    const skull = createParticle(container, '💀', 30 + Math.random() * 20)
    gsap.set(skull, {
      left: `${20 + Math.random() * 60}%`,
      top: `${20 + Math.random() * 60}%`,
      opacity: 0, scale: 0,
    })
    gsap.to(skull, {
      opacity: 0.6, scale: 1,
      duration: 0.5, delay: 0.3 + i * 0.2,
      ease: 'back.out(2)',
      onComplete: () => {
        gsap.to(skull, { opacity: 0, scale: 2, duration: 0.8, onComplete: () => skull.remove() })
      },
    })
  }
  setTimeout(() => container.remove(), 4000)
}

// ==================== SCREEN SHATTER ====================

export function shatterEffect() {
  const container = createOverlay('overflow:hidden;')
  const pieces = 20

  // Create "glass" pieces
  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement('div')
    const w = 30 + Math.random() * 80
    const h = 30 + Math.random() * 80
    piece.style.cssText = `position:absolute;width:${w}px;height:${h}px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);pointer-events:none;`
    container.appendChild(piece)
    const cx = Math.random() * 100
    const cy = Math.random() * 100
    gsap.set(piece, { left: `${cx}%`, top: `${cy}%` })

    gsap.to(piece, {
      x: (Math.random() - 0.5) * 500,
      y: 300 + Math.random() * 300,
      rotation: (Math.random() - 0.5) * 720,
      opacity: 0,
      duration: 1 + Math.random() * 0.5,
      delay: 0.1 + Math.random() * 0.3,
      ease: 'power2.in',
    })
  }

  // Crack lines
  for (let i = 0; i < 8; i++) {
    const line = document.createElement('div')
    const angle = Math.random() * 360
    line.style.cssText = `position:absolute;left:50%;top:50%;width:${100 + Math.random() * 200}px;height:1px;background:rgba(255,255,255,0.3);transform-origin:left center;transform:rotate(${angle}deg);pointer-events:none;`
    container.appendChild(line)
    gsap.fromTo(line, { scaleX: 0, opacity: 1 }, { scaleX: 1, opacity: 0, duration: 0.8, delay: Math.random() * 0.2, ease: 'power4.out' })
  }

  screenShake(3)
  screenFlash('rgba(255,255,255,0.5)', 0.2)

  setTimeout(() => container.remove(), 3000)
}

// ==================== GSAP TEXT/UI ANIMATIONS ====================

export function animateToast(element) {
  if (!element) return
  gsap.fromTo(element,
    { scale: 0, opacity: 0, y: 50 },
    { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' }
  )
}

export function dismissToast(element, onComplete) {
  if (!element) return
  gsap.to(element, { scale: 0.8, opacity: 0, y: -30, duration: 0.3, ease: 'power2.in', onComplete })
}

export function animateSummaryEntry(container) {
  if (!container) return
  const children = container.querySelectorAll('[data-animate]')
  gsap.fromTo(children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' })
}

export function animateCrown(element) {
  if (!element) return
  gsap.fromTo(element, { y: -100, rotation: -20, scale: 0 }, { y: 0, rotation: 0, scale: 1, duration: 0.8, ease: 'bounce.out' })
}

export function matchEndCelebration() {
  fireEffect(1)
}
