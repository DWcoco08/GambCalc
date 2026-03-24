import { useState } from 'react'
import { collectAndAward, buyInChips } from './logic'

export default function PokerCalcBoard({ players, onAction, onViewPlayer, match }) {
  const [potContribs, setPotContribs] = useState({})
  const [phase, setPhase] = useState('collect') // 'collect' | 'winner'

  const totalPot = Object.values(potContribs).reduce((sum, c) => sum + c, 0)
  const potPlayers = players.filter(p => (potContribs[p.id] || 0) > 0)

  const doAction = (fn) => onAction(null, null, fn)

  const addChip = (playerId, amount) => {
    const player = players.find(p => p.id === playerId)
    const current = potContribs[playerId] || 0
    const available = (player?.gameState?.chips || 0) - current
    const actual = Math.min(amount, available)
    if (actual <= 0) return
    setPotContribs(prev => ({ ...prev, [playerId]: current + actual }))
  }

  const setExact = (playerId, value) => {
    const player = players.find(p => p.id === playerId)
    const max = player?.gameState?.chips || 0
    const num = Math.min(Math.max(0, parseInt(value) || 0), max)
    setPotContribs(prev => ({ ...prev, [playerId]: num }))
  }

  const clearChip = (playerId) => {
    setPotContribs(prev => { const n = { ...prev }; delete n[playerId]; return n })
  }

  const handleAwardPot = (winnerId) => {
    doAction(() => collectAndAward(players, potContribs, winnerId))
    resetAll()
  }

  const handleBuyIn = (playerId, amt) => {
    doAction(() => buyInChips(players, playerId, amt))
  }

  const resetAll = () => {
    setPotContribs({})
    setPhase('collect')
  }

  return (
    <div className="space-y-4">
      {/* Player chips overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {players.map(player => {
          const chips = player.gameState?.chips || 0
          const contrib = potContribs[player.id] || 0

          return (
            <div key={player.id}
              className={`relative p-4 rounded-2xl border-2 transition-all text-center
                ${contrib > 0 ? 'border-yellow-400/50 bg-yellow-500/10 shadow-lg shadow-yellow-500/20' : 'border-white/15 bg-black/40 backdrop-blur-sm'}
                ${player.animClass || ''}`}>
              <div className="text-xs font-bold text-white/90 truncate">{player.name}</div>
              <div className={`text-2xl font-extrabold mt-1 ${chips === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                🪙 {chips}
              </div>
              {contrib > 0 && (
                <div className="text-[10px] text-yellow-300 font-bold mt-0.5 animate-bounce-in">hủ: -{contrib}</div>
              )}
              {player.money !== 0 && (
                <div className={`text-[10px] font-bold mt-0.5 ${player.money > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {player.money > 0 ? '+' : ''}{player.money}
                </div>
              )}
              {(player.gameState?.totalBuyIn || 0) > 0 && (
                <div className="text-[8px] text-purple-400/60 mt-0.5">mua thêm: +{player.gameState.totalBuyIn}</div>
              )}

              {/* Buy-in when 0 chips */}
              {chips <= 0 && (
                <div className="flex gap-1 flex-wrap justify-center mt-2">
                  {[10, 20, 30, 50].map(n => (
                    <button key={n} onClick={() => handleBuyIn(player.id, n)}
                      className="px-1.5 py-1 rounded-lg text-[8px] font-bold bg-purple-500/30 text-purple-300 touch-bounce">
                      +{n}
                    </button>
                  ))}
                </div>
              )}

              <button onClick={() => onViewPlayer?.(player.id)}
                className="mt-1 text-[8px] font-bold text-white/25 hover:text-white/50 touch-bounce">Chi tiết</button>

              {player.lastChange != null && player.lastChange !== 0 && (
                <div className={`absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-xl text-[10px] font-extrabold animate-bounce-in shadow-lg ${
                  player.lastChange > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/40'
                    : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-500/40'}`}>
                  {player.lastChange > 0 ? '+' : ''}{player.lastChange}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pot: collect phase */}
      {phase === 'collect' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">🪙 Bỏ chip vào hủ</h3>
            {totalPot > 0 && <span className="text-sm font-extrabold text-yellow-400">Hủ: {totalPot}</span>}
          </div>

          <div className="space-y-3">
            {players.map(p => {
              const chips = p.gameState?.chips || 0
              const contrib = potContribs[p.id] || 0
              const available = chips - contrib
              if (chips <= 0) return null

              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/80">
                      {p.name} <span className="text-white/30">({chips} chip)</span>
                    </span>
                    <span className="text-xs font-extrabold text-yellow-400">{contrib || '—'}</span>
                  </div>
                  <div className="flex gap-1.5 items-center flex-wrap">
                    {[1, 2, 3, 5, 10].map(n => (
                      <button key={n} onClick={() => addChip(p.id, n)} disabled={available < n}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/10 text-white/70 hover:bg-yellow-500/30 hover:text-yellow-400 touch-bounce disabled:opacity-20">
                        +{n}
                      </button>
                    ))}
                    {contrib > 0 && (
                      <button onClick={() => clearChip(p.id)}
                        className="px-2 py-1.5 rounded-lg text-[10px] font-bold bg-white/10 text-red-400 touch-bounce">✕</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {totalPot > 0 && potPlayers.length >= 1 && (
            <button onClick={() => setPhase('winner')}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-yellow-500/30 touch-bounce text-sm">
              🏆 Gom hủ · {totalPot} chip → Chọn người thắng
            </button>
          )}

          {totalPot > 0 && (
            <button onClick={resetAll} className="w-full py-2 text-white/30 text-xs font-medium touch-bounce">Reset hủ</button>
          )}
        </div>
      )}

      {/* Winner selection */}
      {phase === 'winner' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl animate-slide-up space-y-3">
          <p className="text-center text-xs font-bold text-yellow-400">🏆 Ai thắng hủ {totalPot} chip?</p>
          <div className="grid grid-cols-2 gap-2">
            {potPlayers.map(p => (
              <button key={p.id} onClick={() => handleAwardPot(p.id)}
                className="py-3 bg-gradient-to-br from-yellow-500/80 to-orange-500/80 text-white font-bold rounded-2xl shadow-lg touch-bounce text-sm flex flex-col items-center gap-0.5">
                <span>{p.name}</span>
                <span className="text-[10px] text-white/60">bỏ {potContribs[p.id]}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setPhase('collect')} className="w-full py-2 text-white/40 text-xs font-medium touch-bounce">← Quay lại</button>
        </div>
      )}
    </div>
  )
}
