import { useState } from 'react'
import { transferChips, collectAndAward, buyInChips } from './logic'

export default function PokerCalcBoard({ players, onAction, onViewPlayer, match }) {
  const [mode, setMode] = useState('idle') // 'idle' | 'transfer' | 'pot'
  const [fromPlayer, setFromPlayer] = useState(null)
  const [toPlayer, setToPlayer] = useState(null)
  const [amount, setAmount] = useState(0)
  const [potContribs, setPotContribs] = useState({})
  const [potPhase, setPotPhase] = useState('collect') // 'collect' | 'winner'

  const totalPot = Object.values(potContribs).reduce((sum, c) => sum + c, 0)
  const potPlayers = players.filter(p => (potContribs[p.id] || 0) > 0)

  const doAction = (fn) => {
    onAction(null, null, fn)
  }

  const handleTransfer = () => {
    if (!fromPlayer || !toPlayer || amount <= 0 || fromPlayer === toPlayer) return
    doAction(() => transferChips(players, fromPlayer, toPlayer, amount))
    resetAll()
  }

  const addPotContrib = (playerId, chips) => {
    const player = players.find(p => p.id === playerId)
    const current = potContribs[playerId] || 0
    const available = (player?.gameState?.chips || 0) - current
    const actual = Math.min(chips, available)
    if (actual <= 0) return
    setPotContribs(prev => ({ ...prev, [playerId]: current + actual }))
  }

  const clearPotContrib = (playerId) => {
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
    setMode('idle')
    setFromPlayer(null)
    setToPlayer(null)
    setAmount(0)
    setPotContribs({})
    setPotPhase('collect')
  }

  return (
    <div className="space-y-4">
      {/* Player chips overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {players.map(player => {
          const chips = player.gameState?.chips || 0
          const isSelected = mode === 'transfer' && (fromPlayer === player.id || toPlayer === player.id)

          return (
            <div
              key={player.id}
              className={`relative p-4 rounded-2xl border-2 transition-all text-center
                ${isSelected
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20 scale-[1.03]'
                  : 'border-white/15 bg-black/40 backdrop-blur-sm hover:border-white/30'
                }
                ${player.animClass || ''}
              `}
            >
              <div className="text-xs font-bold text-white/90 truncate">{player.name}</div>
              <div className={`text-2xl font-extrabold mt-1 ${chips === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                🪙 {chips}
              </div>
              {player.money !== 0 && (
                <div className={`text-[10px] font-bold mt-0.5 ${player.money > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {player.money > 0 ? '+' : ''}{player.money}
                </div>
              )}
              {(player.gameState?.totalBuyIn || 0) > 0 && (
                <div className="text-[8px] text-purple-400/60 mt-0.5">mua thêm: +{player.gameState.totalBuyIn}</div>
              )}

              {/* Quick actions */}
              <div className="flex gap-1 mt-2 justify-center">
                {chips <= 0 && (
                  <div className="flex gap-1 flex-wrap justify-center">
                    {[10, 20, 30, 50].map(n => (
                      <button key={n} onClick={() => handleBuyIn(player.id, n)}
                        className="px-1.5 py-1 rounded-lg text-[8px] font-bold bg-purple-500/30 text-purple-300 touch-bounce">
                        +{n}
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => onViewPlayer?.(player.id)}
                  className="px-2 py-1 rounded-lg text-[9px] font-bold bg-white/10 text-white/40 touch-bounce">
                  Chi tiết
                </button>
              </div>

              {/* Money change badge */}
              {player.lastChange != null && player.lastChange !== 0 && (
                <div className={`absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-xl text-[10px] font-extrabold animate-bounce-in shadow-lg ${
                  player.lastChange > 0
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/40'
                    : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-500/40'
                }`}>
                  {player.lastChange > 0 ? '+' : ''}{player.lastChange}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action selector */}
      {mode === 'idle' && (
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          <button onClick={() => setMode('transfer')}
            className="py-4 bg-gradient-to-br from-blue-500/80 to-cyan-500/80 text-white font-bold rounded-2xl shadow-lg touch-bounce flex flex-col items-center gap-1">
            <span className="text-2xl">🔄</span>
            <span className="text-sm">Chuyển chip</span>
          </button>
          <button onClick={() => setMode('pot')}
            className="py-4 bg-gradient-to-br from-yellow-500/80 to-orange-500/80 text-white font-bold rounded-2xl shadow-lg touch-bounce flex flex-col items-center gap-1">
            <span className="text-2xl">🪙</span>
            <span className="text-sm">Gom pot</span>
          </button>
        </div>
      )}

      {/* Transfer mode */}
      {mode === 'transfer' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl animate-slide-up space-y-4">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">🔄 Chuyển chip</h3>

          {/* From */}
          <div>
            <p className="text-[10px] font-bold text-white/50 mb-2">Từ ai?</p>
            <div className="flex gap-2 flex-wrap">
              {players.map(p => (
                <button key={p.id} onClick={() => setFromPlayer(p.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold touch-bounce transition-all ${
                    fromPlayer === p.id ? 'bg-red-500/30 text-red-300 border border-red-400/40' : 'bg-white/10 text-white/70'
                  }`}>
                  {p.name} ({p.gameState?.chips || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          {fromPlayer && (
            <div className="animate-fade-in">
              <p className="text-[10px] font-bold text-white/50 mb-2">Bao nhiêu chip?</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 5, 10, 20].map(n => {
                  const from = players.find(p => p.id === fromPlayer)
                  return (
                    <button key={n} onClick={() => setAmount(n)}
                      disabled={(from?.gameState?.chips || 0) < n}
                      className={`px-3 py-2 rounded-xl text-xs font-bold touch-bounce ${
                        amount === n ? 'bg-yellow-500/40 text-yellow-300 border border-yellow-400/40' : 'bg-white/10 text-white/70'
                      } disabled:opacity-20`}>
                      {n}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* To */}
          {fromPlayer && amount > 0 && (
            <div className="animate-fade-in">
              <p className="text-[10px] font-bold text-white/50 mb-2">Cho ai?</p>
              <div className="flex gap-2 flex-wrap">
                {players.filter(p => p.id !== fromPlayer).map(p => (
                  <button key={p.id} onClick={() => setToPlayer(p.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold touch-bounce transition-all ${
                      toPlayer === p.id ? 'bg-green-500/30 text-green-300 border border-green-400/40' : 'bg-white/10 text-white/70'
                    }`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Confirm */}
          <div className="flex gap-2">
            <button onClick={resetAll} className="flex-1 py-3 bg-white/10 text-white/60 font-semibold rounded-2xl touch-bounce text-sm">Hủy</button>
            {fromPlayer && toPlayer && amount > 0 && (
              <button onClick={handleTransfer}
                className="flex-[2] py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-2xl shadow-lg touch-bounce text-sm animate-fade-in">
                🔄 Chuyển {amount} chip
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pot mode */}
      {mode === 'pot' && potPhase === 'collect' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl animate-slide-up space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">🪙 Gom pot</h3>
            {totalPot > 0 && <span className="text-sm font-extrabold text-yellow-400">Pot: {totalPot}</span>}
          </div>

          <div className="space-y-3">
            {players.map(p => {
              const chips = p.gameState?.chips || 0
              const contrib = potContribs[p.id] || 0
              const available = chips - contrib
              if (chips <= 0 && contrib === 0) return null

              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/80">
                      {p.name} <span className="text-white/30">({chips}, còn {available})</span>
                    </span>
                    <span className="text-xs font-extrabold text-yellow-400">{contrib || '—'}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {[1, 2, 3, 5, 10].map(n => (
                      <button key={n} onClick={() => addPotContrib(p.id, n)} disabled={available < n}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/10 text-white/70 hover:bg-yellow-500/30 hover:text-yellow-400 touch-bounce disabled:opacity-20">
                        +{n}
                      </button>
                    ))}
                    {contrib > 0 && (
                      <button onClick={() => clearPotContrib(p.id)}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/10 text-red-400 touch-bounce">✕</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-2">
            <button onClick={resetAll} className="flex-1 py-3 bg-white/10 text-white/60 font-semibold rounded-2xl touch-bounce text-sm">Hủy</button>
            {totalPot > 0 && potPlayers.length >= 1 && (
              <button onClick={() => setPotPhase('winner')}
                className="flex-[2] py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg touch-bounce text-sm">
                🏆 Chọn người thắng · Pot {totalPot}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pot winner selection */}
      {mode === 'pot' && potPhase === 'winner' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl animate-slide-up space-y-3">
          <p className="text-center text-xs font-bold text-yellow-400">🏆 Ai thắng? · Pot: {totalPot}</p>
          <div className="grid grid-cols-2 gap-2">
            {potPlayers.map(p => (
              <button key={p.id} onClick={() => handleAwardPot(p.id)}
                className="py-3 bg-gradient-to-br from-yellow-500/80 to-orange-500/80 text-white font-bold rounded-2xl shadow-lg touch-bounce text-sm flex flex-col items-center gap-0.5">
                <span>{p.name}</span>
                <span className="text-[10px] text-white/60">đặt {potContribs[p.id]}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setPotPhase('collect')} className="w-full py-2 text-white/40 text-xs font-medium touch-bounce">← Quay lại</button>
        </div>
      )}
    </div>
  )
}
