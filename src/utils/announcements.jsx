import { useState, useCallback, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { animateToast, dismissToast, screenShake, screenFlash, screenDarken, fireEffect, rainEffect, lightningFlash, snowEffect, horrorEffect, shatterEffect } from './effects'

// ==================== WIN STREAK CONFIG ====================
const WIN_CONFIG = {
  3: {
    icon: '🔥', title: 'CHUỖI 3!',
    subtitle: 'Bắt đầu nóng lên rồi!',
    color: 'from-orange-500 to-red-500',
    border: 'border-orange-400/50',
    fireBorder: 'light', // light fire around toast
    effect: () => fireEffect(1),
  },
  4: {
    icon: '🔥', title: 'CHUỖI 4!',
    subtitle: 'Không ai cản được!',
    color: 'from-orange-600 to-red-600',
    border: 'border-red-400/50',
    fireBorder: 'medium',
    effect: () => { fireEffect(2); screenShake(0.5) },
  },
  5: {
    icon: '👹', title: 'DEMON MODE!',
    subtitle: 'Quỷ dữ thức tỉnh! Tất cả hãy coi chừng!',
    color: 'from-red-600 via-purple-600 to-red-600',
    border: 'border-purple-400/50',
    fireBorder: 'demon',
    effect: () => { fireEffect(3); screenShake(2); screenFlash('rgba(147,51,234,0.4)') },
  },
}

// 6+ uses demon but with escalating text
const DEMON_TEXTS = [
  'Không thể dừng lại! Quỷ vương giáng thế!',
  'Cả bàn run sợ trước sức mạnh này!',
  'Huyền thoại! Không ai dám đặt cược!',
  'THẦN CHẾT! Mọi chip đều thuộc về ta!',
]

// ==================== LOSE STREAK CONFIG ====================
const LOSE_CONFIG = {
  5: {
    icon: '😰', title: 'THUA CHUỖI 5!',
    subtitle: 'Bắt đầu lo lắng... may mắn ở đâu rồi?',
    color: 'from-red-500 to-rose-600',
    effect: () => screenShake(0.5),
  },
  10: {
    icon: '😢', title: 'THUA CHUỖI 10!',
    subtitle: 'Xui xẻo quá! Nước mắt lưng tròng...',
    color: 'from-red-600 to-red-800',
    effect: () => { rainEffect(1); screenShake(1) },
  },
  15: {
    icon: '😭', title: 'THUA CHUỖI 15!',
    subtitle: 'Trời ơi thảm quá! Mưa gió bão bùng!',
    color: 'from-red-700 to-red-900',
    effect: () => { rainEffect(2); lightningFlash(); setTimeout(lightningFlash, 800) },
  },
  20: {
    icon: '🥶', title: 'ĐÓNG BĂNG!',
    subtitle: 'Lạnh cóng! Tay run không cầm nổi bài!',
    color: 'from-blue-500 to-cyan-600',
    effect: () => { snowEffect(); screenFlash('rgba(59,130,246,0.3)') },
  },
  25: {
    icon: '💀', title: 'ĐEN!',
    subtitle: 'Bóng tối bao trùm... liệu còn hy vọng?',
    color: 'from-gray-700 to-gray-900',
    effect: () => { horrorEffect(); screenShake(2) },
  },
  30: {
    icon: '☠️', title: 'ĐEN TUYỆT ĐỐI!',
    subtitle: 'Tận thế! Mọi thứ sụp đổ tan tành!',
    color: 'from-gray-900 to-black',
    effect: () => { shatterEffect() },
  },
}

// ==================== MONEY LOSS CONFIG ====================
const MONEY_CONFIG = {
  50000: {
    icon: '🔻', title: 'THUA 50K!',
    subtitle: 'Ví đang khóc thét! Bao năm tiết kiệm bay trong một đêm...',
    color: 'from-red-500 to-red-700',
    effect: () => { screenShake(1); rainEffect(1) },
  },
  100000: {
    icon: '💸', title: 'THUA 100K!',
    subtitle: 'Tiền bay như lá mùa thu! Tháng này ăn mì gói rồi nè!',
    color: 'from-red-700 to-red-900',
    effect: () => { screenShake(2); screenFlash('rgba(220,38,38,0.3)'); rainEffect(2) },
  },
  200000: {
    icon: '🏚️', title: 'PHÁ SẢN!',
    subtitle: 'Nhà cửa xe cộ cũng không còn... Mai mốt đi bộ đi làm! Nghỉ chơi về đi!',
    color: 'from-gray-900 to-black',
    effect: () => { shatterEffect(); screenDarken() },
  },
}

// ==================== HOOK ====================

export function useAnnouncements() {
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const toastRef = useRef(null)
  const timerRef = useRef(null)
  const processingRef = useRef(false)

  const processQueue = useCallback(() => {
    setQueue(prev => {
      if (prev.length === 0) {
        setCurrent(null)
        processingRef.current = false
        return prev
      }
      const [next, ...rest] = prev
      setCurrent(next)
      return rest
    })
  }, [])

  useEffect(() => {
    if (current && toastRef.current) {
      processingRef.current = true
      animateToast(toastRef.current)
      if (current.effect) current.effect()
      timerRef.current = setTimeout(() => {
        dismissToast(toastRef.current, processQueue)
      }, 3000)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [current, processQueue])

  // When queue changes and nothing playing, start processing
  useEffect(() => {
    if (queue.length > 0 && !current && !processingRef.current) {
      processQueue()
    }
  }, [queue, current, processQueue])

  const announce = useCallback((config) => {
    setQueue(prev => [...prev, config])
  }, [])

  const checkMilestones = useCallback((playersBefore, playersAfter) => {
    // Collect all players who hit same milestone → merge into 1 announcement
    const winMilestones = {} // { level: [names] }
    const loseMilestones = {} // { level: [names] }
    const moneyMilestones = {} // { amount: [names] }

    playersAfter.forEach(after => {
      const before = playersBefore.find(p => p.id === after.id)
      if (!before) return

      const streakBefore = before.gameState?.streak || 0
      const streakAfter = after.gameState?.streak || 0
      const loseBefore = before.gameState?.loseStreak || 0
      const loseAfter = after.gameState?.loseStreak || 0
      const moneyBefore = before.money || 0
      const moneyAfter = after.money || 0

      // Win streak (3, 4, 5+)
      if (streakAfter > streakBefore && streakAfter >= 3) {
        const key = Math.min(streakAfter, 5)
        if (!winMilestones[key]) winMilestones[key] = []
        winMilestones[key].push({ name: after.name, streak: streakAfter })
      }

      // Lose streak (5, 10, 15, 20, 25, 30)
      if (loseAfter > loseBefore) {
        for (const m of [30, 25, 20, 15, 10, 5]) {
          if (loseAfter >= m && loseBefore < m) {
            if (!loseMilestones[m]) loseMilestones[m] = []
            loseMilestones[m].push(after.name)
            break
          }
        }
      }

      // Money milestones
      if (moneyAfter < moneyBefore) {
        for (const m of [200000, 100000, 50000]) {
          if (Math.abs(moneyAfter) >= m && Math.abs(moneyBefore) < m) {
            if (!moneyMilestones[m]) moneyMilestones[m] = []
            moneyMilestones[m].push(after.name)
            break
          }
        }
      }
    })

    // Fire win announcements
    Object.entries(winMilestones).forEach(([level, players]) => {
      const lvl = parseInt(level)
      const config = lvl >= 5 ? WIN_CONFIG[5] : WIN_CONFIG[lvl]
      if (!config) return
      const names = players.map(p => p.name).join(', ')
      const streak = players[0].streak
      announce({
        ...config,
        names,
        title: streak >= 6 ? `DEMON x${streak}!` : config.title,
        subtitle: streak >= 6 ? DEMON_TEXTS[Math.min(streak - 6, DEMON_TEXTS.length - 1)] : config.subtitle,
      })
    })

    // Fire lose announcements (merge same milestone)
    Object.entries(loseMilestones).forEach(([level, names]) => {
      const config = LOSE_CONFIG[parseInt(level)]
      if (!config) return
      announce({ ...config, names: names.join(', ') })
    })

    // Fire money announcements
    Object.entries(moneyMilestones).forEach(([amount, names]) => {
      const config = MONEY_CONFIG[parseInt(amount)]
      if (!config) return
      announce({ ...config, names: names.join(', ') })
    })
  }, [announce])

  // Fire border particles
  const fireRef = useRef(null)
  useEffect(() => {
    if (!current?.fireBorder || !fireRef.current) return
    const container = fireRef.current
    const isLight = current.fireBorder === 'light'
    const isDemon = current.fireBorder === 'demon'
    const count = isLight ? 12 : isDemon ? 24 : 18
    const emojis = isDemon ? ['🔥', '⚡', '💜', '🟣', '👹'] : ['🔥', '✨', '💥']
    const particles = []

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div')
      p.textContent = emojis[i % emojis.length]
      p.style.cssText = 'position:absolute;pointer-events:none;will-change:transform,opacity;'
      p.style.fontSize = `${14 + Math.random() * 12}px`
      container.appendChild(p)
      particles.push(p)

      // Position around border (top, right, bottom, left)
      const side = i % 4
      let x, y
      if (side === 0) { x = Math.random() * 100; y = -8 } // top
      else if (side === 1) { x = 105; y = Math.random() * 100 } // right
      else if (side === 2) { x = Math.random() * 100; y = 105 } // bottom
      else { x = -8; y = Math.random() * 100 } // left

      gsap.set(p, { left: `${x}%`, top: `${y}%`, opacity: 0, scale: 0.5 })

      // Animate: float upward + flicker
      gsap.to(p, {
        y: -20 - Math.random() * 40,
        x: (Math.random() - 0.5) * 30,
        opacity: 1,
        scale: 0.8 + Math.random() * 0.6,
        duration: 0.4 + Math.random() * 0.3,
        delay: Math.random() * 0.5,
        ease: 'power1.out',
        onComplete: () => {
          // Loop: flicker and float
          gsap.to(p, {
            y: `-=${20 + Math.random() * 30}`,
            opacity: 0.3 + Math.random() * 0.7,
            scale: 0.5 + Math.random() * 0.8,
            duration: 0.5 + Math.random() * 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          })
        },
      })
    }

    return () => particles.forEach(p => { gsap.killTweensOf(p); p.remove() })
  }, [current])

  const ToastComponent = current ? (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center px-4">
      <div
        ref={toastRef}
        className="relative"
        style={{ opacity: 0, transform: 'scale(0)' }}
      >
        {/* Fire border container */}
        {current.fireBorder && (
          <div ref={fireRef} className="absolute -inset-6 pointer-events-none overflow-visible" />
        )}
        {/* Toast content */}
        <div className={`relative bg-gradient-to-r ${current.color} px-10 py-8 rounded-3xl shadow-2xl text-center max-w-lg w-full border-2 ${current.border || 'border-white/20'}`}>
          <div className="text-6xl mb-3">{current.icon}</div>
          <div className="text-white/80 font-bold text-base mb-1">{current.names}</div>
          <div className="text-white font-extrabold text-3xl tracking-tight">{current.title}</div>
          <div className="text-white/70 text-sm font-medium mt-2 italic">{current.subtitle}</div>
        </div>
      </div>
    </div>
  ) : null

  return { announce, checkMilestones, ToastComponent }
}
