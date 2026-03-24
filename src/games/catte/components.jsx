import { useState } from 'react'

const LOSE_MILESTONES = [
  { min: 30, icon: '☠️', label: 'ĐEN', color: 'from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300', text: 'text-white dark:text-gray-900', glow: 'shadow-gray-800/50' },
  { min: 25, icon: '💀', label: 'ĐEN', color: 'from-gray-700 to-gray-800', text: 'text-white', glow: 'shadow-gray-700/40' },
  { min: 20, icon: '🥶', label: 'ĐÓNG BĂNG', color: 'from-blue-600 to-cyan-600', text: 'text-white', glow: 'shadow-blue-600/40' },
  { min: 15, icon: '😭', label: 'THẢM', color: 'from-purple-600 to-purple-700', text: 'text-white', glow: 'shadow-purple-600/40' },
  { min: 10, icon: '😢', label: 'XUI', color: 'from-red-600 to-rose-600', text: 'text-white', glow: 'shadow-red-600/40' },
  { min: 5,  icon: '😰', label: 'Thua', color: 'from-red-400 to-red-500', text: 'text-white', glow: 'shadow-red-400/30' },
]

const MONEY_LOSS_MILESTONES = [
  { min: 200000, icon: '🏚️', label: '-200k', color: 'from-gray-900 to-black', text: 'text-red-400', border: 'ring-red-900' },
  { min: 100000, icon: '💸', label: '-100k', color: 'from-red-800 to-red-900', text: 'text-red-300', border: 'ring-red-800' },
  { min: 50000,  icon: '🔻', label: '-50k', color: 'from-red-600 to-red-700', text: 'text-white', border: 'ring-red-600' },
  { min: 30000,  icon: '📉', label: '-30k', color: 'from-red-500 to-rose-500', text: 'text-white', border: 'ring-red-500' },
]

function getLoseMilestone(loseStreak) {
  return LOSE_MILESTONES.find(m => loseStreak >= m.min) || null
}

function getMoneyLossMilestone(money) {
  if (money >= 0) return null
  const loss = Math.abs(money)
  return MONEY_LOSS_MILESTONES.find(m => loss >= m.min) || null
}

export default function CatteBoard({ players, onAction, onViewPlayer, onResetStreak, baseBet, disabled }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [confirmReset, setConfirmReset] = useState(null)

  const handleAction = (actionId) => {
    if (selectedPlayer) {
      onAction(selectedPlayer, actionId)
      setSelectedPlayer(null)
    }
  }

  const selectedName = players.find(p => p.id === selectedPlayer)?.name

  return (
    <div className="space-y-4">
      {/* Player cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-visible">
        {players.map((player, idx) => {
          const isSelected = selectedPlayer === player.id
          const isWinning = player.money > 0
          const isLosing = player.money < 0
          const streak = player.gameState?.streak || 0
          const loseStreak = player.gameState?.loseStreak || 0
          const isOnFire = streak >= 2
          const isDemon = streak >= 5
          const loseMilestone = getLoseMilestone(loseStreak)
          const moneyLossMilestone = getMoneyLossMilestone(player.money)
          const isOnIce = loseStreak >= 5

          return (
            <div
              key={player.id}
              className="relative animate-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Win streak glow */}
              {isDemon && (
                <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-red-600 via-purple-600 to-red-600 opacity-50 blur-lg animate-demon-aura" />
              )}
              {isOnFire && !isDemon && (
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 opacity-30 blur-md animate-streak-glow" />
              )}
              {/* Lose streak glow */}
              {isOnIce && !isOnFire && (
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-20 blur-md animate-lose-glow" />
              )}

              <button
                disabled={disabled}
                onClick={() => setSelectedPlayer(isSelected ? null : player.id)}
                className={`relative w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left touch-bounce
                  ${isSelected
                    ? 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/15 shadow-xl shadow-purple-500/25 scale-[1.03] z-10'
                    : isDemon
                      ? 'border-red-500/60 bg-gradient-to-br from-red-950/40 via-purple-950/30 to-red-950/40 dark:from-red-950/60 dark:via-purple-950/40 dark:to-red-950/60 shadow-xl shadow-red-500/30 animate-demon-card'
                      : isOnFire
                      ? 'border-orange-400/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 shadow-lg'
                      : isOnIce
                        ? 'border-blue-300/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 shadow-lg'
                        : 'border-white/30 dark:border-gray-700/40 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-sm hover:shadow-md'
                  }
                  ${disabled ? 'opacity-50' : ''}
                  ${player.animClass || ''}
                `}
              >
                {/* Background decoration - win */}
                {isDemon && (
                  <>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/25 via-purple-500/15 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-tr-full" />
                  </>
                )}
                {isOnFire && !isDemon && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-300/20 to-transparent rounded-bl-full" />
                )}
                {/* Background decoration - lose */}
                {isOnIce && !isOnFire && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-300/15 to-transparent rounded-bl-full" />
                )}

                {/* Name */}
                <div className="font-bold text-gray-900 dark:text-white truncate text-[15px]">
                  {player.name}
                </div>

                {/* Money */}
                <div className={`text-2xl font-extrabold mt-1 tracking-tight ${
                  isWinning ? 'text-green-500' : isLosing ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {player.money > 0 ? '+' : ''}{formatMoney(player.money)}
                </div>

                {/* Streak badges */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {/* Win streak */}
                  {streak > 0 && (
                    <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-bold ${
                      isDemon
                        ? 'bg-gradient-to-r from-red-600 via-purple-600 to-red-600 text-white shadow-lg shadow-red-500/50 animate-demon-badge'
                        : isOnFire
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/30 animate-streak-fire'
                        : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                    }`}>
                      {isDemon ? '👹' : '🔥'} {streak}
                    </span>
                  )}
                  {/* Reset streak button - only show when streak >= 2 */}
                  {streak >= 2 && (
                    <span
                      onClick={(e) => { e.stopPropagation(); setConfirmReset(player.id) }}
                      className="inline-flex items-center px-1.5 py-1 rounded-lg text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-400 dark:text-red-500 cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors touch-bounce"
                      title="Hủy chuỗi (gian lận)"
                    >
                      ✕
                    </span>
                  )}

                  {/* Lose streak */}
                  {loseMilestone && (
                    <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${loseMilestone.color} ${loseMilestone.text} shadow-md ${loseMilestone.glow} ${loseStreak >= 10 ? 'animate-lose-shake' : ''}`}>
                      {loseMilestone.icon} {loseStreak}
                    </span>
                  )}
                  {loseStreak >= 3 && loseStreak < 5 && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400">
                      📉 {loseStreak}
                    </span>
                  )}

                  {/* Money loss milestone */}
                  {moneyLossMilestone && (
                    <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-extrabold bg-gradient-to-r ${moneyLossMilestone.color} ${moneyLossMilestone.text} shadow-sm ring-1 ${moneyLossMilestone.border}`}>
                      {moneyLossMilestone.icon} {moneyLossMilestone.label}
                    </span>
                  )}

                  <span
                    onClick={(e) => { e.stopPropagation(); onViewPlayer?.(player.id) }}
                    className="inline-flex items-center px-2 py-1 bg-gray-100/80 dark:bg-gray-700/80 text-gray-400 dark:text-gray-500 rounded-lg text-[10px] font-semibold uppercase tracking-wider touch-bounce hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 transition-colors"
                  >
                    Chi tiết
                  </span>
                </div>

                {/* Money change badge */}
                {player.lastChange != null && player.lastChange !== 0 && (
                  <div className={`absolute -top-1.5 -right-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold animate-bounce-in shadow-lg ${
                    player.lastChange > 0
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/40'
                      : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-500/40'
                  }`}>
                    {player.lastChange > 0 ? '+' : ''}{formatMoney(player.lastChange)}
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-1 left-1 animate-ring-pulse w-2 h-2 rounded-full bg-purple-500" />
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
      {selectedPlayer && (
        <div className="animate-slide-up">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl">
            <p className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              {selectedName} thắng kiểu nào?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAction('win')}
                className="py-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 transition-all touch-bounce flex flex-col items-center gap-1"
              >
                <span className="text-2xl">🏆</span>
                <span className="text-sm">Thắng</span>
              </button>
              <button
                onClick={() => handleAction('instant')}
                className="py-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-yellow-500/30 transition-all touch-bounce flex flex-col items-center gap-1"
              >
                <span className="text-2xl">⚡</span>
                <span className="text-sm">Tới Trắng</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {!selectedPlayer && !disabled && (
        <div className="text-center py-3">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            👆 Chọn người thắng
          </p>
        </div>
      )}

      {/* Confirm reset streak modal */}
      {confirmReset && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center animate-fade-in">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 w-full sm:max-w-sm space-y-4 animate-slide-up border-t border-white/30 dark:border-gray-700/40">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto sm:hidden" />
            <div className="text-center">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">Hủy chuỗi?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Reset chuỗi thắng của <strong className="text-gray-900 dark:text-white">{players.find(p => p.id === confirmReset)?.name}</strong> về 1 vì gian lận
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmReset(null)}
                className="py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold transition-colors touch-bounce"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onResetStreak?.(confirmReset)
                  setConfirmReset(null)
                }}
                className="py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold shadow-lg shadow-red-500/30 transition-all touch-bounce"
              >
                Reset chuỗi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatMoney(amount) {
  if (Math.abs(amount) >= 1000) {
    return (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + 'k'
  }
  return amount.toString()
}
