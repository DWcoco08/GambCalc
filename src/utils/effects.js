import gsap from 'gsap'

// ==================== HELPERS ====================

function createOverlay(styles = '') {
  const el = document.createElement('div')
  el.style.cssText = `position:fixed;inset:0;z-index:9999;pointer-events:none;${styles}`
  document.body.appendChild(el)
  return el
}

function createEl(parent, styles) {
  const el = document.createElement('div')
  el.style.cssText = `position:absolute;pointer-events:none;${styles}`
  parent.appendChild(el)
  return el
}

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

export function screenFlash(color = 'rgba(255,255,255,0.4)', duration = 0.3) {
  const el = createOverlay(`background:${color};`)
  gsap.to(el, { opacity: 0, duration, ease: 'power2.out', onComplete: () => el.remove() })
}

// ==================== FIRE (DOM + GSAP) ====================

export function fireEffect(intensity = 1) {
  const container = createOverlay('')
  const count = 20 * intensity
  const colors = intensity >= 3
    ? ['#9333ea', '#7c3aed', '#dc2626', '#ec4899', '#a855f7']
    : ['#f97316', '#ef4444', '#fbbf24', '#dc2626']

  for (let i = 0; i < count; i++) {
    const size = 4 + Math.random() * 8
    const color = colors[Math.floor(Math.random() * colors.length)]
    const el = createEl(container, `
      width:${size}px;height:${size * 1.5}px;
      background:${color};
      border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;
      filter:blur(${1 + Math.random() * 2}px);
      box-shadow:0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}80;
    `)
    const startX = 5 + Math.random() * 90
    gsap.set(el, { left: `${startX}%`, bottom: 0, opacity: 0 })
    gsap.to(el, {
      bottom: `${40 + Math.random() * 50}%`,
      left: `${startX + (Math.random() - 0.5) * 15}%`,
      opacity: 0.8 + Math.random() * 0.2,
      scale: 0.3 + Math.random() * 0.7,
      duration: 0.6 + Math.random() * 0.8,
      delay: Math.random() * 0.8,
      ease: 'power1.out',
      onComplete: () => gsap.to(el, { opacity: 0, scale: 0, duration: 0.4, onComplete: () => el.remove() }),
    })
  }
  setTimeout(() => container.remove(), 3000)
}

// Fire border around an element
export function fireBorderEffect(element, intensity = 1) {
  if (!element) return () => {}
  const rect = element.getBoundingClientRect()
  const container = createOverlay('')
  const count = intensity >= 3 ? 40 : intensity >= 2 ? 25 : 15
  const colors = intensity >= 3
    ? ['#9333ea', '#7c3aed', '#dc2626', '#ec4899']
    : ['#f97316', '#ef4444', '#fbbf24', '#dc2626']

  let running = true

  function spawnParticle() {
    if (!running) return
    const size = 3 + Math.random() * 6
    const color = colors[Math.floor(Math.random() * colors.length)]
    const el = createEl(container, `
      width:${size}px;height:${size * 1.5}px;
      background:${color};
      border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;
      filter:blur(${1 + Math.random()}px);
      box-shadow:0 0 ${size}px ${color};
    `)

    // Spawn on border of element
    const side = Math.floor(Math.random() * 4)
    let x, y
    if (side === 0) { x = rect.left + Math.random() * rect.width; y = rect.top }
    else if (side === 1) { x = rect.right; y = rect.top + Math.random() * rect.height }
    else if (side === 2) { x = rect.left + Math.random() * rect.width; y = rect.bottom }
    else { x = rect.left; y = rect.top + Math.random() * rect.height }

    gsap.set(el, { left: x, top: y, opacity: 0 })
    gsap.to(el, {
      y: -20 - Math.random() * 30,
      x: (Math.random() - 0.5) * 20,
      opacity: 0.9,
      duration: 0.3,
      ease: 'power1.out',
      onComplete: () => gsap.to(el, { opacity: 0, y: '-=20', duration: 0.5, onComplete: () => el.remove() }),
    })
  }

  // Spawn particles continuously
  const interval = setInterval(() => {
    for (let i = 0; i < Math.ceil(count / 10); i++) spawnParticle()
  }, 100)

  return () => { running = false; clearInterval(interval); container.remove() }
}

// ==================== LIGHTNING ====================

export function lightningEffect() {
  screenFlash('rgba(200,220,255,0.7)', 0.1)
  setTimeout(() => screenFlash('rgba(200,220,255,0.4)', 0.15), 150)
  setTimeout(() => screenFlash('rgba(200,220,255,0.2)', 0.2), 350)
  screenShake(1)
}

// ==================== RAIN ====================

export function rainEffect(intensity = 1) {
  const container = createOverlay('')
  const count = 40 * intensity
  let running = true

  function spawnDrop() {
    if (!running) return
    const el = createEl(container, `
      width:${1 + Math.random()}px;
      height:${15 + Math.random() * 25}px;
      background:linear-gradient(transparent, rgba(120,170,255,0.5));
      border-radius:0 0 2px 2px;
    `)
    gsap.set(el, { left: `${Math.random() * 100}%`, top: '-5%', opacity: 0 })
    gsap.to(el, {
      top: '105%',
      opacity: 0.6,
      duration: 0.4 + Math.random() * 0.3,
      ease: 'none',
      onComplete: () => el.remove(),
    })
  }

  const interval = setInterval(() => {
    for (let i = 0; i < count / 15; i++) spawnDrop()
  }, 50)

  const duration = intensity >= 2 ? 4000 : 3000
  setTimeout(() => { running = false; clearInterval(interval) }, duration)
  setTimeout(() => container.remove(), duration + 1000)
}

// ==================== FREEZE ====================

export function freezeEffect() {
  // Blue tint overlay
  const ice = createOverlay('background:rgba(30,60,150,0.2);')
  gsap.fromTo(ice, { opacity: 0 }, { opacity: 1, duration: 0.5 })
  gsap.to(ice, { opacity: 0, duration: 1.5, delay: 2, onComplete: () => ice.remove() })

  // Frost particles
  const container = createOverlay('')
  for (let i = 0; i < 20; i++) {
    const el = createEl(container, `
      width:${3 + Math.random() * 5}px;height:${3 + Math.random() * 5}px;
      background:rgba(200,220,255,0.8);border-radius:50%;
      filter:blur(1px);
      box-shadow:0 0 6px rgba(100,150,255,0.5);
    `)
    gsap.set(el, { left: `${Math.random() * 100}%`, top: '-5%', opacity: 0 })
    gsap.to(el, {
      top: `${30 + Math.random() * 60}%`,
      left: `+=${(Math.random() - 0.5) * 15}%`,
      opacity: 0.7,
      duration: 2 + Math.random(),
      delay: Math.random() * 1.5,
      ease: 'power1.out',
      onComplete: () => gsap.to(el, { opacity: 0, duration: 1, onComplete: () => el.remove() }),
    })
  }
  setTimeout(() => container.remove(), 5000)
}

// ==================== DARK / HORROR ====================

export function darkenEffect() {
  const dark = createOverlay('background:radial-gradient(circle,transparent 20%,rgba(0,0,0,0.85) 100%);opacity:0;')
  gsap.to(dark, { opacity: 1, duration: 0.8 })
  gsap.to(dark, { opacity: 0, duration: 1.5, delay: 2, onComplete: () => dark.remove() })
}

// ==================== BROKEN SCREEN ====================

export function brokenScreenEffect() {
  const container = createOverlay('overflow:hidden;background:rgba(0,0,0,0.3);')

  // Crack lines from center
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * 360 + Math.random() * 20
    const length = 100 + Math.random() * 300
    const el = createEl(container, `
      left:50%;top:50%;
      width:${length}px;height:1px;
      background:linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1), transparent);
      transform-origin:left center;
      transform:rotate(${angle}deg);
    `)
    gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 0.2 + Math.random() * 0.2, delay: Math.random() * 0.15, ease: 'power4.out' })
  }

  // Branch cracks
  for (let i = 0; i < 20; i++) {
    const x = 20 + Math.random() * 60
    const y = 20 + Math.random() * 60
    const angle = Math.random() * 360
    const length = 30 + Math.random() * 80
    const el = createEl(container, `
      left:${x}%;top:${y}%;
      width:${length}px;height:1px;
      background:rgba(255,255,255,${0.1 + Math.random() * 0.3});
      transform-origin:left center;
      transform:rotate(${angle}deg);
    `)
    gsap.fromTo(el, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.15, delay: 0.2 + Math.random() * 0.3, ease: 'power4.out' })
  }

  // Glass shards falling
  for (let i = 0; i < 8; i++) {
    const w = 20 + Math.random() * 60
    const h = 20 + Math.random() * 60
    const el = createEl(container, `
      width:${w}px;height:${h}px;
      background:rgba(255,255,255,0.02);
      border:1px solid rgba(255,255,255,0.08);
      left:${10 + Math.random() * 80}%;
      top:${10 + Math.random() * 80}%;
    `)
    gsap.to(el, {
      y: 300 + Math.random() * 300,
      rotation: (Math.random() - 0.5) * 360,
      opacity: 0,
      duration: 1.2,
      delay: 0.4 + Math.random() * 0.3,
      ease: 'power2.in',
    })
  }

  screenShake(3)
  screenFlash('rgba(255,255,255,0.3)', 0.15)

  // Dark aftermath
  gsap.to(container, { background: 'rgba(0,0,0,0.5)', duration: 1, delay: 0.5 })
  gsap.to(container, { opacity: 0, duration: 2, delay: 2.5, onComplete: () => container.remove() })
}

// ==================== GSAP UI ANIMATIONS ====================

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
