import { useState, useCallback, useRef, useEffect } from 'react'
import { animateToast, dismissToast, screenShake, screenFlash, screenDarken, confettiStreak3, confettiStreak4, demonConfetti, loseConfetti } from './effects'

const WIN_ANNOUNCEMENTS = {
  3: { icon: '🔥', text: 'CHUỖI 3!', color: 'from-orange-500 to-red-500', shake: 0, confetti: 'streak3' },
  4: { icon: '🔥🔥', text: 'CHUỖI 4!', color: 'from-orange-600 to-red-600', shake: 0.5, confetti: 'streak4' },
  5: { icon: '👹', text: 'DEMON MODE!', color: 'from-red-600 via-purple-600 to-red-600', shake: 2, confetti: 'demon', flash: 'rgba(147,51,234,0.3)' },
  6: { icon: '👹', text: 'DEMON x6!', color: 'from-red-600 via-purple-600 to-red-600', shake: 2.5, confetti: 'demon', flash: 'rgba(147,51,234,0.4)' },
  7: { icon: '👹', text: 'DEMON x7!', color: 'from-red-700 via-purple-700 to-red-700', shake: 3, confetti: 'demon', flash: 'rgba(220,38,38,0.4)' },
}

const LOSE_ANNOUNCEMENTS = {
  5:  { icon: '😰', text: 'THUA CHUỖI 5!', color: 'from-red-500 to-rose-600', shake: 0.5 },
  10: { icon: '😢', text: 'THUA CHUỖI 10! XUI!', color: 'from-red-600 to-red-800', shake: 1, darken: true },
  15: { icon: '😭', text: 'THUA CHUỖI 15! THẢM!', color: 'from-red-700 to-red-900', shake: 1.5, darken: true },
  20: { icon: '🥶', text: 'ĐÓNG BĂNG!', color: 'from-blue-500 to-cyan-600', shake: 2, flash: 'rgba(59,130,246,0.3)' },
  25: { icon: '💀', text: 'ĐEN!', color: 'from-gray-700 to-gray-900', shake: 2, darken: true },
  30: { icon: '☠️', text: 'ĐEN TUYỆT ĐỐI!', color: 'from-gray-900 to-black', shake: 3, darken: true, flash: 'rgba(0,0,0,0.5)' },
}

const MONEY_ANNOUNCEMENTS = {
  50000:  { icon: '🔻', text: 'THUA 50K!', color: 'from-red-500 to-red-700', shake: 1 },
  100000: { icon: '💸', text: 'THUA 100K!', color: 'from-red-700 to-red-900', shake: 2, flash: 'rgba(220,38,38,0.3)' },
  200000: { icon: '🏚️', text: 'PHÁ SẢN!', color: 'from-gray-900 to-black', shake: 3, darken: true },
}

export function useAnnouncements() {
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const toastRef = useRef(null)
  const timerRef = useRef(null)

  const showNext = useCallback(() => {
    setQueue(prev => {
      if (prev.length === 0) {
        setCurrent(null)
        return prev
      }
      const [next, ...rest] = prev
      setCurrent(next)
      return rest
    })
  }, [])

  useEffect(() => {
    if (current && toastRef.current) {
      animateToast(toastRef.current)

      // Effects
      if (current.shake) screenShake(current.shake)
      if (current.flash) screenFlash(current.flash)
      if (current.darken) screenDarken()
      if (current.confetti === 'streak3') confettiStreak3()
      if (current.confetti === 'streak4') confettiStreak4()
      if (current.confetti === 'demon') demonConfetti()
      if (current.confetti === 'lose') loseConfetti(current.shake || 1)

      timerRef.current = setTimeout(() => {
        dismissToast(toastRef.current, showNext)
      }, 2500)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [current, showNext])

  const announce = useCallback((announcement) => {
    setQueue(prev => {
      if (prev.length === 0 && !current) {
        setCurrent(announcement)
        return prev
      }
      return [...prev, announcement]
    })
  }, [current])

  // Detect milestones by comparing before/after
  const checkMilestones = useCallback((playersBefore, playersAfter) => {
    playersAfter.forEach(after => {
      const before = playersBefore.find(p => p.id === after.id)
      if (!before) return

      const streakBefore = before.gameState?.streak || 0
      const streakAfter = after.gameState?.streak || 0
      const loseBefore = before.gameState?.loseStreak || 0
      const loseAfter = after.gameState?.loseStreak || 0
      const moneyBefore = before.money || 0
      const moneyAfter = after.money || 0

      // Win streak milestones (3, 4, 5, 6, 7+)
      if (streakAfter > streakBefore && streakAfter >= 3) {
        const key = Math.min(streakAfter, 7)
        const config = WIN_ANNOUNCEMENTS[key] || WIN_ANNOUNCEMENTS[5]
        announce({
          ...config,
          name: after.name,
          text: streakAfter >= 5 ? `DEMON MODE x${streakAfter}!` : config.text,
        })
      }

      // Lose streak milestones (5, 10, 15, 20, 25, 30)
      if (loseAfter > loseBefore) {
        const milestones = [30, 25, 20, 15, 10, 5]
        for (const m of milestones) {
          if (loseAfter >= m && loseBefore < m) {
            const config = LOSE_ANNOUNCEMENTS[m]
            announce({
              ...config,
              name: after.name,
              confetti: 'lose',
            })
            break
          }
        }
      }

      // Money loss milestones (-50k, -100k, -200k)
      if (moneyAfter < moneyBefore) {
        const milestones = [200000, 100000, 50000]
        for (const m of milestones) {
          if (Math.abs(moneyAfter) >= m && Math.abs(moneyBefore) < m) {
            const config = MONEY_ANNOUNCEMENTS[m]
            announce({
              ...config,
              name: after.name,
            })
            break
          }
        }
      }
    })
  }, [announce])

  const ToastComponent = current ? (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      <div
        ref={toastRef}
        className={`bg-gradient-to-r ${current.color} px-8 py-5 rounded-3xl shadow-2xl text-center max-w-md`}
        style={{ opacity: 0, transform: 'scale(0)' }}
      >
        <div className="text-5xl mb-2">{current.icon}</div>
        <div className="text-white font-extrabold text-lg">{current.name}</div>
        <div className="text-white/90 font-extrabold text-2xl tracking-tight">{current.text}</div>
      </div>
    </div>
  ) : null

  return { announce, checkMilestones, ToastComponent }
}
