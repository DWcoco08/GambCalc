import { useEffect, useRef } from 'react'

// Fire particle system using canvas
export default function FireBorder({ intensity = 1, type = 'fire' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (!rect) return

    canvas.width = rect.width + 80
    canvas.height = rect.height + 80

    const w = canvas.width
    const h = canvas.height
    const particles = []
    const count = type === 'demon' ? 80 : type === 'medium' ? 50 : 30

    // Color palettes
    const colors = type === 'demon'
      ? ['#dc2626', '#9333ea', '#7c3aed', '#ec4899', '#f43f5e', '#a855f7']
      : type === 'medium'
      ? ['#f97316', '#ef4444', '#fbbf24', '#f59e0b', '#dc2626']
      : ['#f97316', '#fbbf24', '#f59e0b', '#fdba74']

    // Create particles along the border
    for (let i = 0; i < count; i++) {
      const side = Math.random()
      let x, y
      if (side < 0.25) { x = Math.random() * w; y = h - 10 } // bottom
      else if (side < 0.5) { x = Math.random() * w; y = 10 } // top
      else if (side < 0.75) { x = 10; y = Math.random() * h } // left
      else { x = w - 10; y = Math.random() * h } // right

      particles.push({
        x, y,
        originX: x,
        originY: y,
        radius: 2 + Math.random() * 4 * intensity,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0,
        vx: (Math.random() - 0.5) * 2,
        vy: -1 - Math.random() * 3 * intensity,
        life: 0,
        maxLife: 30 + Math.random() * 40,
        delay: Math.random() * 60,
      })
    }
    // Animation loop
    let frame = 0
    let running = true
    const loop = () => {
      if (!running) return
        frame++
        ctx.clearRect(0, 0, w, h)

        particles.forEach(p => {
          if (frame < p.delay) return

          p.life++
          if (p.life > p.maxLife) {
            // Reset particle
            const side = Math.random()
            if (side < 0.25) { p.x = Math.random() * w; p.y = h - 10 }
            else if (side < 0.5) { p.x = Math.random() * w; p.y = 10 }
            else if (side < 0.75) { p.x = 10; p.y = Math.random() * h }
            else { p.x = w - 10; p.y = Math.random() * h }
            p.life = 0
            p.maxLife = 30 + Math.random() * 40
            p.vy = -1 - Math.random() * 3 * intensity
            p.vx = (Math.random() - 0.5) * 2
            return
          }

          const progress = p.life / p.maxLife
          p.alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7
          p.x += p.vx + (Math.random() - 0.5) * 0.5
          p.y += p.vy
          p.radius *= 0.995

          // Draw glow
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3)
          gradient.addColorStop(0, p.color + Math.floor(p.alpha * 200).toString(16).padStart(2, '0'))
          gradient.addColorStop(0.5, p.color + Math.floor(p.alpha * 100).toString(16).padStart(2, '0'))
          gradient.addColorStop(1, p.color + '00')

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()

          // Draw core
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0')
          ctx.fill()
        })
      requestAnimationFrame(loop)
    }
    loop()

    return () => { running = false }
  }, [intensity, type])

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none"
      style={{ top: -40, left: -40, right: -40, bottom: -40 }}
    />
  )
}
