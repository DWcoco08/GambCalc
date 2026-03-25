import gsap from 'gsap'
import confetti from 'canvas-confetti'

// ==================== SCREEN EFFECTS (GSAP) ====================

export function screenShake(intensity = 1) {
  const root = document.getElementById('root')
  if (!root) return
  const tl = gsap.timeline()
  const d = 3 * intensity
  tl.to(root, { x: d, duration: 0.05 })
    .to(root, { x: -d, duration: 0.05 })
    .to(root, { x: d * 0.7, duration: 0.05 })
    .to(root, { x: -d * 0.7, duration: 0.05 })
    .to(root, { x: d * 0.4, duration: 0.05 })
    .to(root, { x: -d * 0.4, duration: 0.05 })
    .to(root, { x: 0, duration: 0.05 })
}

export function screenFlash(color = 'rgba(255,255,255,0.3)', duration = 0.4) {
  const overlay = document.createElement('div')
  overlay.style.cssText = `position:fixed;inset:0;z-index:9999;pointer-events:none;background:${color};`
  document.body.appendChild(overlay)
  gsap.to(overlay, {
    opacity: 0,
    duration,
    ease: 'power2.out',
    onComplete: () => overlay.remove(),
  })
}

export function screenDarken(duration = 1.5) {
  const overlay = document.createElement('div')
  overlay.style.cssText = `position:fixed;inset:0;z-index:9998;pointer-events:none;background:radial-gradient(circle,transparent 30%,rgba(0,0,0,0.7) 100%);opacity:0;`
  document.body.appendChild(overlay)
  gsap.to(overlay, {
    opacity: 1,
    duration: 0.3,
    onComplete: () => {
      gsap.to(overlay, {
        opacity: 0,
        duration,
        delay: 0.5,
        onComplete: () => overlay.remove(),
      })
    },
  })
}

// ==================== CONFETTI EFFECTS ====================

export function confettiBurst(options = {}) {
  confetti({
    particleCount: 40,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#22c55e', '#10b981', '#ffffff', '#fbbf24'],
    ...options,
  })
}

export function confettiStreak3() {
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#f97316', '#ef4444', '#fbbf24', '#ffffff'],
  })
}

export function confettiStreak4() {
  confetti({
    particleCount: 80,
    spread: 90,
    origin: { y: 0.5 },
    colors: ['#f97316', '#ef4444', '#fbbf24', '#ffffff', '#f59e0b'],
  })
  setTimeout(() => confetti({
    particleCount: 40,
    spread: 120,
    origin: { y: 0.7 },
    colors: ['#fbbf24', '#f59e0b'],
  }), 300)
}

export function demonConfetti() {
  const duration = 2000
  const end = Date.now() + duration
  const colors = ['#dc2626', '#9333ea', '#7c3aed', '#ec4899']

  ;(function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

export function loseConfetti(intensity = 1) {
  const count = Math.floor(20 * intensity)
  confetti({
    particleCount: count,
    spread: 100,
    origin: { y: 0 },
    gravity: 2,
    colors: ['#ef4444', '#991b1b', '#450a0a', '#000000'],
    shapes: ['circle'],
    scalar: 0.8,
  })
}

export function matchEndCelebration() {
  // 3 bursts: left, center, right
  setTimeout(() => confetti({
    particleCount: 60,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.7 },
    colors: ['#fbbf24', '#f59e0b', '#ffffff'],
  }), 0)
  setTimeout(() => confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.5, y: 0.6 },
    colors: ['#22c55e', '#10b981', '#fbbf24', '#ffffff'],
  }), 400)
  setTimeout(() => confetti({
    particleCount: 60,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.7 },
    colors: ['#fbbf24', '#f59e0b', '#ffffff'],
  }), 800)
}

// ==================== GSAP TEXT ANIMATIONS ====================

export function animateToast(element) {
  if (!element) return
  gsap.fromTo(element,
    { scale: 0, opacity: 0, y: 50 },
    { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' }
  )
}

export function dismissToast(element, onComplete) {
  if (!element) return
  gsap.to(element, {
    scale: 0.8,
    opacity: 0,
    y: -30,
    duration: 0.3,
    ease: 'power2.in',
    onComplete,
  })
}

export function animateSummaryEntry(container) {
  if (!container) return
  const children = container.querySelectorAll('[data-animate]')
  gsap.fromTo(children,
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
  )
}

export function animateCrown(element) {
  if (!element) return
  gsap.fromTo(element,
    { y: -100, rotation: -20, scale: 0 },
    { y: 0, rotation: 0, scale: 1, duration: 0.8, ease: 'bounce.out' }
  )
}
