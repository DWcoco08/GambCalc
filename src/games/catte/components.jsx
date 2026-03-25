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

export default function CatteBoard({ players, onAction, onViewPlayer, onResetStreak, onToggleDisabled, onAddPlayer, baseBet, disabled }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [confirmReset, setConfirmReset] = useState(null)
  const [confirmDisable, setConfirmDisable] = useState(null)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')

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
      <div className="space-y-3 lg:space-y-4 overflow-visible">
        {[...players].sort((a, b) => (a.gameState?.disabled ? 1 : 0) - (b.gameState?.disabled ? 1 : 0)).map((player, idx) => {
          const isDisabled = player.gameState?.disabled
          const isSelected = selectedPlayer === player.id
          const isWinning = player.money > 0
          const isLosing = player.money < 0
          const streak = player.gameState?.streak || 0
          const loseStreak = player.gameState?.loseStreak || 0
          const isOnFire = !isDisabled && streak >= 2
          const isDemon = !isDisabled && streak >= 5
          const loseMilestone = !isDisabled ? getLoseMilestone(loseStreak) : null
          const moneyLossMilestone = !isDisabled ? getMoneyLossMilestone(player.money) : null
          const isOnIce = !isDisabled && loseStreak >= 5

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
                onClick={() => !isDisabled && setSelectedPlayer(isSelected ? null : player.id)}
                className={`relative w-full p-4 lg:p-5 rounded-2xl border-2 transition-all duration-200 text-left touch-bounce
                  ${isDisabled
                    ? 'border-gray-600/30 bg-black/40 opacity-40 cursor-default'
                    : isSelected
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
                {/* Horizontal card layout */}
                <div className="flex items-center gap-3 lg:gap-5">
                  {/* Left: Name + Money + Badges */}
                  <div className="flex-1 min-w-0">
                    {/* Name row: name + chi tiết + reset streak */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`font-bold truncate text-base lg:text-xl ${isDisabled ? 'text-gray-500' : 'text-white'}`}>
                        {player.name}
                      </div>
                      <span onClick={(e) => { e.stopPropagation(); onViewPlayer?.(player.id) }}
                        className="inline-flex items-center px-2 py-0.5 bg-white/10 text-white/30 rounded-md text-[9px] lg:text-[11px] font-semibold touch-bounce hover:bg-purple-500/20 hover:text-purple-400 transition-colors">
                        Chi tiết
                      </span>
                      {streak >= 2 && !isDisabled && (
                        <span onClick={(e) => { e.stopPropagation(); setConfirmReset(player.id) }}
                          className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-red-500/20 text-red-400 cursor-pointer touch-bounce">✕ Hủy chuỗi</span>
                      )}
                      {isDisabled && <span className="text-[10px] lg:text-xs text-gray-500 font-bold">· Nghỉ chơi</span>}
                    </div>
                    {/* Money */}
                    <div className={`text-3xl lg:text-5xl font-extrabold tracking-tight ${
                      isDisabled ? 'text-gray-500' : isWinning ? 'text-green-500' : isLosing ? 'text-red-500' : 'text-gray-400'
                    }`}>
                      {player.money > 0 ? '+' : ''}{formatMoney(player.money)}
                    </div>
                    {/* Badges */}
                    {!isDisabled && (streak > 0 || loseMilestone || (loseStreak >= 3) || moneyLossMilestone) && (
                      <div className="flex items-center gap-1.5 lg:gap-2 mt-1.5 flex-wrap">
                        {streak > 0 && (
                          <span className={`inline-flex items-center gap-0.5 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-xs lg:text-sm font-bold ${
                            isDemon ? 'bg-gradient-to-r from-red-600 via-purple-600 to-red-600 text-white shadow-lg shadow-red-500/50 animate-demon-badge'
                              : isOnFire ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/30 animate-streak-fire'
                              : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                          }`}>
                            {isDemon ? '👹' : '🔥'} {streak}
                          </span>
                        )}
                        {loseMilestone && (
                          <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${loseMilestone.color} ${loseMilestone.text} shadow-md ${loseMilestone.glow} ${loseStreak >= 10 ? 'animate-lose-shake' : ''}`}>
                            {loseMilestone.icon} {loseStreak}
                          </span>
                        )}
                        {loseStreak >= 3 && loseStreak < 5 && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-500">📉 {loseStreak}</span>
                        )}
                        {moneyLossMilestone && (
                          <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-extrabold bg-gradient-to-r ${moneyLossMilestone.color} ${moneyLossMilestone.text} shadow-sm ring-1 ${moneyLossMilestone.border}`}>
                            {moneyLossMilestone.icon} {moneyLossMilestone.label}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Disable/Enable - full height clickable */}
                  {!disabled && (
                    <div
                      onClick={(e) => { e.stopPropagation(); setConfirmDisable(player.id) }}
                      className={`shrink-0 w-16 lg:w-20 self-stretch flex flex-col items-center justify-center rounded-xl cursor-pointer touch-bounce transition-colors ${
                        isDisabled
                          ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                          : 'bg-white/5 text-white/25 hover:bg-white/10 hover:text-white/50'
                      }`}
                    >
                      <span className="text-lg lg:text-xl">{isDisabled ? '▶' : '⏸'}</span>
                      <span className="text-[8px] lg:text-[10px] font-bold mt-0.5">{isDisabled ? 'Vào lại' : 'Nghỉ'}</span>
                    </div>
                  )}
                </div>

                {/* Money change badge */}
                {player.lastChange != null && player.lastChange !== 0 && (
                  <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-xl text-sm lg:text-base font-extrabold animate-bounce-in shadow-lg ${
                    player.lastChange > 0
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/40'
                      : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-500/40'
                  }`}>
                    {player.lastChange > 0 ? '+' : ''}{formatMoney(player.lastChange)}
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-2 left-2 animate-ring-pulse w-3 h-3 rounded-full bg-purple-500" />
                )}
              </button>
              {/* Action buttons - right below selected player */}
              {isSelected && (
                <div className="mt-2 animate-slide-up">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAction('win')}
                      className="py-3 lg:py-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 touch-bounce flex items-center justify-center gap-2"
                    >
                      <span className="text-lg lg:text-xl">🏆</span>
                      <span className="text-sm lg:text-base">Thắng</span>
                    </button>
                    <button
                      onClick={() => handleAction('instant')}
                      className="py-3 lg:py-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/30 touch-bounce flex items-center justify-center gap-2"
                    >
                      <span className="text-lg lg:text-xl">⚡</span>
                      <span className="text-sm lg:text-base">Tới Trắng</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Add player button */}
        {!disabled && players.length < 8 && (
          <button
            onClick={() => setShowAddPlayer(true)}
            className="w-full p-4 lg:p-5 rounded-2xl border-2 border-dashed border-white/20 text-white/30 hover:border-white/40 hover:text-white/50 transition-all touch-bounce flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            <span className="text-sm lg:text-base font-bold">Thêm người chơi</span>
          </button>
        )}
      </div>

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

      {/* Confirm disable/enable modal */}
      {confirmDisable && (() => {
        const p = players.find(pl => pl.id === confirmDisable)
        const isCurrentlyDisabled = p?.gameState?.disabled
        return (
          <div className="fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center animate-fade-in">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 w-full sm:max-w-sm space-y-4 animate-slide-up border-t border-white/30 dark:border-gray-700/40">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto sm:hidden" />
              <div className="text-center">
                <span className="text-3xl">{isCurrentlyDisabled ? '▶️' : '⏸️'}</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                  {isCurrentlyDisabled ? 'Cho vào lại?' : 'Nghỉ chơi?'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <strong className="text-gray-900 dark:text-white">{p?.name}</strong>
                  {isCurrentlyDisabled ? ' sẽ tham gia lại ván' : ' sẽ nghỉ, tiền giữ nguyên'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setConfirmDisable(null)}
                  className="py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold transition-colors touch-bounce">
                  Hủy
                </button>
                <button onClick={() => { onToggleDisabled?.(confirmDisable); setConfirmDisable(null) }}
                  className={`py-3 rounded-2xl font-semibold shadow-lg transition-all touch-bounce ${
                    isCurrentlyDisabled ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30' : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/30'
                  }`}>
                  {isCurrentlyDisabled ? 'Cho vào lại' : 'Nghỉ chơi'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Add player popup */}
      {showAddPlayer && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center animate-fade-in">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 w-full sm:max-w-sm space-y-4 animate-slide-up border-t border-white/30 dark:border-gray-700/40">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto sm:hidden" />
            <div className="text-center">
              <span className="text-3xl">👤</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">Thêm người chơi</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bắt đầu với 0đ</p>
            </div>
            <input
              type="text"
              value={newPlayerName}
              onChange={e => setNewPlayerName(e.target.value)}
              placeholder="Tên người chơi"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setShowAddPlayer(false); setNewPlayerName('') }}
                className="py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold transition-colors touch-bounce">
                Hủy
              </button>
              <button onClick={() => {
                const name = newPlayerName.trim() || `Player ${players.length + 1}`
                onAddPlayer?.(name)
                setNewPlayerName('')
                setShowAddPlayer(false)
              }}
                className="py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all touch-bounce">
                Thêm
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
