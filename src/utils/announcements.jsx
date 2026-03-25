import { useState, useCallback, useRef, useEffect } from 'react'
import { animateToast, dismissToast, screenShake, screenFlash, fireEffect, fireBorderEffect, lightningEffect, rainEffect, freezeEffect, darkenEffect, brokenScreenEffect } from './effects'

// ==================== WIN STREAK CONFIG ====================
const WIN_CONFIG = {
  3: {
    icon: '🔥', title: 'CHUỖI 3!',
    subtitle: 'Bắt đầu nóng lên rồi!',
    color: 'from-orange-500 to-red-500',
    border: 'border-orange-400/50',
    hasFire: 1,
    effect: () => fireEffect(1),
  },
  4: {
    icon: '🔥', title: 'CHUỖI 4!',
    subtitle: 'Không ai cản được!',
    color: 'from-orange-600 to-red-600',
    border: 'border-red-400/50',
    hasFire: 2,
    effect: () => { fireEffect(2); screenShake(0.5) },
  },
  5: {
    icon: '👹', title: 'DEMON MODE!',
    subtitle: 'Quỷ dữ thức tỉnh! Tất cả hãy coi chừng!',
    color: 'from-red-600 via-purple-600 to-red-600',
    border: 'border-purple-400/50',
    hasFire: 3,
    effect: () => { fireEffect(3); lightningEffect(); screenShake(2) },
  },
}

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
    color: 'from-gray-600 to-gray-700',
    effect: () => {},
  },
  10: {
    icon: '😢', title: 'THUA CHUỖI 10!',
    subtitle: 'Xui xẻo quá! Nước mắt lưng tròng...',
    color: 'from-blue-700 to-blue-900',
    effect: () => rainEffect(1),
  },
  15: {
    icon: '😭', title: 'THUA CHUỖI 15! THẢM!',
    subtitle: 'Trời ơi! Mưa gió bão bùng! Sấm sét đánh xuống!',
    color: 'from-blue-800 to-gray-900',
    effect: () => { rainEffect(2); setTimeout(lightningEffect, 500); setTimeout(lightningEffect, 1200) },
  },
  20: {
    icon: '🥶', title: 'ĐÓNG BĂNG!',
    subtitle: 'Lạnh cóng! Tay run không cầm nổi bài!',
    color: 'from-cyan-600 to-blue-800',
    effect: () => freezeEffect(),
  },
  25: {
    icon: '💀', title: 'ĐEN!',
    subtitle: 'Bóng tối bao trùm... liệu còn hy vọng?',
    color: 'from-gray-800 to-gray-950',
    effect: () => darkenEffect(),
  },
  30: {
    icon: '☠️', title: 'ĐEN TUYỆT ĐỐI!',
    subtitle: 'Tận thế! Mọi thứ sụp đổ tan tành!',
    color: 'from-gray-950 to-black',
    effect: () => brokenScreenEffect(),
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
    effect: () => { brokenScreenEffect() },
  },
}

// ==================== HOOK ====================

export function useAnnouncements() {
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const toastRef = useRef(null)
  const timerRef = useRef(null)
  const fireCleanupRef = useRef(null)
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

      // Fire border around toast
      if (current.hasFire && toastRef.current) {
        const inner = toastRef.current.querySelector('[data-toast-inner]')
        if (inner) {
          fireCleanupRef.current = fireBorderEffect(inner, current.hasFire)
        }
      }

      timerRef.current = setTimeout(() => {
        if (fireCleanupRef.current) { fireCleanupRef.current(); fireCleanupRef.current = null }
        dismissToast(toastRef.current, processQueue)
      }, 3000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (fireCleanupRef.current) { fireCleanupRef.current(); fireCleanupRef.current = null }
    }
  }, [current, processQueue])

  useEffect(() => {
    if (queue.length > 0 && !current && !processingRef.current) {
      processQueue()
    }
  }, [queue, current, processQueue])

  const announce = useCallback((config) => {
    setQueue(prev => [...prev, config])
  }, [])

  const checkMilestones = useCallback((playersBefore, playersAfter) => {
    const winMilestones = {}
    const loseMilestones = {}
    const moneyMilestones = {}

    playersAfter.forEach(after => {
      const before = playersBefore.find(p => p.id === after.id)
      if (!before) return

      const streakBefore = before.gameState?.streak || 0
      const streakAfter = after.gameState?.streak || 0
      const loseBefore = before.gameState?.loseStreak || 0
      const loseAfter = after.gameState?.loseStreak || 0
      const moneyBefore = before.money || 0
      const moneyAfter = after.money || 0

      if (streakAfter > streakBefore && streakAfter >= 3) {
        const key = Math.min(streakAfter, 5)
        if (!winMilestones[key]) winMilestones[key] = []
        winMilestones[key].push({ name: after.name, streak: streakAfter })
      }

      if (loseAfter > loseBefore) {
        for (const m of [30, 25, 20, 15, 10, 5]) {
          if (loseAfter >= m && loseBefore < m) {
            if (!loseMilestones[m]) loseMilestones[m] = []
            loseMilestones[m].push(after.name)
            break
          }
        }
      }

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

    Object.entries(loseMilestones).forEach(([level, names]) => {
      const config = LOSE_CONFIG[parseInt(level)]
      if (!config) return
      announce({ ...config, names: names.join(', ') })
    })

    Object.entries(moneyMilestones).forEach(([amount, names]) => {
      const config = MONEY_CONFIG[parseInt(amount)]
      if (!config) return
      announce({ ...config, names: names.join(', ') })
    })
  }, [announce])

  const ToastComponent = current ? (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center px-4">
      <div
        ref={toastRef}
        className="relative"
        style={{ opacity: 0, transform: 'scale(0)' }}
      >
        <div
          data-toast-inner
          className={`relative bg-gradient-to-r ${current.color} px-10 py-8 rounded-3xl shadow-2xl text-center max-w-lg w-full border-2 ${current.border || 'border-white/20'}`}
        >
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
