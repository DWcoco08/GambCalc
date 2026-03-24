import { useState } from 'react'
import { collectAndAward, buyInChips } from './logic'

const ROUND_NAMES = ['', 'Xem 3 lá', 'Xem lá 4', 'Xem lá 5 + Show']

export default function PokerCalcBoard({ players, onAction, onViewPlayer, match }) {
  const [potContribs, setPotContribs] = useState({})
  const [phase, setPhase] = useState('bet') // 'bet' | 'round' | 'winner'
  const [roundNum, setRoundNum] = useState(0) // 0=chưa bắt đầu, 1-3=lượt
  const [folded, setFolded] = useState({})
  const [extraContribs, setExtraContribs] = useState({}) // chip tố thêm trong lượt

  const totalPot = Object.values(potContribs).reduce((sum, c) => sum + c, 0)
    + Object.values(extraContribs).reduce((sum, c) => sum + c, 0)
  const basePot = Object.values(potContribs).reduce((sum, c) => sum + c, 0)
  const potPlayers = players.filter(p => (potContribs[p.id] || 0) > 0)
  const activePlayers = potPlayers.filter(p => !folded[p.id])

  // Completed hands from logs
  const completedHands = (match?.logs || []).filter(l => l.action === 'Win Pot')
  const handNum = completedHands.length + 1

  const doAction = (fn) => onAction(null, null, fn)

  // --- Bet phase (đặt chip vào hủ) ---
  const addChip = (playerId, amount) => {
    const player = players.find(p => p.id === playerId)
    const current = potContribs[playerId] || 0
    const available = (player?.gameState?.chips || 0) - current
    const actual = Math.min(amount, available)
    if (actual <= 0) return
    setPotContribs(prev => ({ ...prev, [playerId]: current + actual }))
  }

  const clearChip = (playerId) => {
    setPotContribs(prev => { const n = { ...prev }; delete n[playerId]; return n })
  }

  const startHand = () => {
    if (potPlayers.length < 2) return
    // Deduct chips immediately
    doAction(() => {
      const changes = {}
      const updatedPlayers = players.map(p => {
        const bet = potContribs[p.id] || 0
        if (bet <= 0) return p
        changes[p.id] = -bet
        return { ...p, money: p.money - bet, gameState: { ...p.gameState, chips: p.gameState.chips - bet } }
      })
      return { players: updatedPlayers, changes, details: { action: 'Bet', amount: basePot } }
    })
    setRoundNum(1)
    setFolded({})
    setExtraContribs({})
    setPhase('round')
  }

  // --- Round phase (lượt 1-3) ---
  const handleFold = (playerId) => {
    const newFolded = { ...folded, [playerId]: true }
    setFolded(newFolded)
    const remaining = potPlayers.filter(p => !newFolded[p.id])
    if (remaining.length <= 1) {
      setPhase('winner')
    }
  }

  const addExtra = (playerId, amount) => {
    const player = players.find(p => p.id === playerId)
    const current = extraContribs[playerId] || 0
    const available = (player?.gameState?.chips || 0) - current
    const actual = Math.min(amount, available)
    if (actual <= 0) return
    // Deduct immediately
    doAction(() => {
      const changes = { [playerId]: -actual }
      const updatedPlayers = players.map(p => {
        if (p.id !== playerId) return p
        return { ...p, money: p.money - actual, gameState: { ...p.gameState, chips: p.gameState.chips - actual } }
      })
      return { players: updatedPlayers, changes, details: { action: 'Raise', playerId, playerName: player.name, amount: actual } }
    })
    setExtraContribs(prev => ({ ...prev, [playerId]: current + actual }))
  }

  const nextRound = () => {
    if (roundNum >= 3) {
      setPhase('winner')
    } else {
      setRoundNum(prev => prev + 1)
    }
  }

  // --- Winner phase ---
  const handleAwardPot = (winnerId) => {
    doAction(() => {
      const winner = players.find(p => p.id === winnerId)
      const changes = { [winnerId]: totalPot }
      const updatedPlayers = players.map(p => {
        if (p.id !== winnerId) return p
        return { ...p, money: p.money + totalPot, gameState: { ...p.gameState, chips: p.gameState.chips + totalPot } }
      })
      return { players: updatedPlayers, changes, details: { action: 'Win Pot', winnerId, winnerName: winner.name, amount: totalPot } }
    })
    resetHand()
  }

  const resetHand = () => {
    setPotContribs({})
    setExtraContribs({})
    setFolded({})
    setRoundNum(0)
    setPhase('bet')
  }

  const handleBuyIn = (playerId, amt) => {
    doAction(() => buyInChips(players, playerId, amt))
  }

  const ranked = [...players].sort((a, b) => (b.gameState?.chips || 0) - (a.gameState?.chips || 0))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪙</span>
          <div>
            <div className="text-sm font-extrabold text-white/90">Ván {handNum}</div>
            <div className="text-[10px] text-white/40">
              {phase === 'round' ? `Lượt ${roundNum}/3 · ${ROUND_NAMES[roundNum]}` :
               phase === 'winner' ? 'Chọn người thắng' :
               'Đặt chip vào hủ'}
            </div>
          </div>
        </div>
        {totalPot > 0 && (
          <div className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-400/30 rounded-xl">
            <span className="text-sm font-extrabold text-yellow-400">Hủ: {totalPot}</span>
          </div>
        )}
      </div>

      {/* Player chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {players.map(player => {
          const chips = player.gameState?.chips || 0
          const contrib = potContribs[player.id] || 0
          const extra = extraContribs[player.id] || 0
          const isFolded = folded[player.id]
          const rank = ranked.findIndex(p => p.id === player.id)

          return (
            <div key={player.id}
              className={`relative p-4 rounded-2xl border-2 transition-all text-center
                ${isFolded ? 'border-white/10 bg-black/40 opacity-40'
                  : contrib > 0 || extra > 0 ? 'border-yellow-400/50 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                  : 'border-white/15 bg-black/40 backdrop-blur-sm'}
                ${player.animClass || ''}`}>
              {completedHands.length > 0 && (
                <div className={`absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                  rank === 0 ? 'bg-yellow-400 text-black' : rank === 1 ? 'bg-gray-300 text-black' : rank === 2 ? 'bg-orange-400 text-black' : 'bg-white/20 text-white/50'
                }`}>{rank + 1}</div>
              )}
              <div className="text-xs font-bold text-white/90 truncate">{player.name}</div>
              <div className={`text-2xl font-extrabold mt-1 ${chips === 0 ? 'text-red-400' : 'text-yellow-400'}`}>🪙 {chips}</div>
              {(contrib > 0 || extra > 0) && !isFolded && (
                <div className="text-[10px] text-yellow-300 font-bold mt-0.5">hủ: {contrib + extra}</div>
              )}
              {isFolded && <div className="text-[10px] text-red-400 font-bold mt-0.5">Bỏ</div>}
              {player.money !== 0 && (
                <div className={`text-[10px] font-bold mt-0.5 ${player.money > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {player.money > 0 ? '+' : ''}{player.money}
                </div>
              )}
              {(player.gameState?.totalBuyIn || 0) > 0 && (
                <div className="text-[8px] text-purple-400/60 mt-0.5">mua: +{player.gameState.totalBuyIn}</div>
              )}
              {chips <= 0 && !isFolded && phase !== 'round' && (
                <div className="flex gap-1 flex-wrap justify-center mt-2">
                  {[10, 20, 30, 50].map(n => (
                    <button key={n} onClick={() => handleBuyIn(player.id, n)}
                      className="px-1.5 py-1 rounded-lg text-[8px] font-bold bg-purple-500/30 text-purple-300 touch-bounce">+{n}</button>
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

      {/* History */}
      {completedHands.length > 0 && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Lịch sử ván</h3>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {[...completedHands].reverse().map((log, i) => (
              <div key={log.id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-white/5">
                <div className="w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-extrabold bg-yellow-500/30 text-yellow-400 shrink-0">
                  {completedHands.length - i}
                </div>
                <span className="text-xs font-bold text-yellow-400">{log.winnerName}</span>
                <span className="text-[10px] text-white/40">+{log.amount} chip</span>
                <span className="text-[10px] text-white/30 ml-auto shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BET phase */}
      {phase === 'bet' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl animate-fade-in space-y-4">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Ván {handNum} · Đặt chip vào hủ</h3>
          <div className="space-y-3">
            {players.map(p => {
              const chips = p.gameState?.chips || 0
              const contrib = potContribs[p.id] || 0
              const available = chips - contrib
              if (chips <= 0) return null
              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/80">{p.name} <span className="text-white/30">({chips})</span></span>
                    <span className="text-xs font-extrabold text-yellow-400">{contrib || '—'}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {[1, 2, 3, 5, 10].map(n => (
                      <button key={n} onClick={() => addChip(p.id, n)} disabled={available < n}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/10 text-white/70 hover:bg-yellow-500/30 hover:text-yellow-400 touch-bounce disabled:opacity-20">+{n}</button>
                    ))}
                    {contrib > 0 && (
                      <button onClick={() => clearChip(p.id)} className="px-2 py-1.5 rounded-lg text-[10px] font-bold bg-white/10 text-red-400 touch-bounce">✕</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {basePot > 0 && potPlayers.length >= 2 && (
            <button onClick={startHand}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 touch-bounce text-sm">
              🃏 Bắt đầu ván · Hủ {basePot} chip
            </button>
          )}
          {basePot > 0 && (
            <button onClick={() => { setPotContribs({}); }} className="w-full py-2 text-white/30 text-xs font-medium touch-bounce">Reset</button>
          )}
        </div>
      )}

      {/* ROUND phase (lượt 1-3) */}
      {phase === 'round' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl animate-slide-up space-y-4">
          <div className="text-center">
            <div className="text-sm font-extrabold text-yellow-400">Lượt {roundNum}/3 · {ROUND_NAMES[roundNum]}</div>
            <div className="text-[10px] text-white/40">Còn {activePlayers.length} người · Hủ: {totalPot}</div>
          </div>

          <div className="space-y-2">
            {potPlayers.map(p => {
              const isFolded = folded[p.id]
              const chips = p.gameState?.chips || 0
              const extra = extraContribs[p.id] || 0
              return (
                <div key={p.id} className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  isFolded ? 'bg-white/5 opacity-40' : 'bg-white/10'}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-bold truncate ${isFolded ? 'text-white/30 line-through' : 'text-white/90'}`}>{p.name}</span>
                    <span className={`text-[10px] font-bold ${chips === 0 ? 'text-red-400' : 'text-yellow-400/70'}`}>🪙{chips}</span>
                    {extra > 0 && <span className="text-[9px] text-orange-400">+{extra}</span>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {!isFolded && chips > 0 && (
                      <>
                        {[1, 2, 5].map(n => (
                          <button key={n} onClick={() => addExtra(p.id, n)} disabled={chips < n}
                            className="px-2 py-1 rounded-lg text-[9px] font-bold bg-orange-500/20 text-orange-400 touch-bounce disabled:opacity-20">+{n}</button>
                        ))}
                      </>
                    )}
                    {!isFolded && (
                      <button onClick={() => handleFold(p.id)}
                        className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-red-500/20 text-red-400 touch-bounce">❌ Bỏ</button>
                    )}
                    {isFolded && <span className="text-[10px] text-red-400/50 font-bold">Đã bỏ</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {roundNum < 3 ? (
            <button onClick={nextRound}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 touch-bounce text-sm">
              👁 {roundNum === 1 ? 'Xem lá 4' : roundNum === 2 ? 'Xem lá 5 + Show' : 'Tiếp'} →
            </button>
          ) : (
            <button onClick={() => setPhase('winner')}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-yellow-500/30 touch-bounce text-sm">
              🏆 Chọn người thắng · Hủ {totalPot}
            </button>
          )}
        </div>
      )}

      {/* WINNER phase */}
      {phase === 'winner' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl animate-slide-up space-y-3">
          <p className="text-center text-xs font-bold text-yellow-400">🏆 Ván {handNum} · Ai thắng hủ {totalPot} chip?</p>
          {activePlayers.length === 1 ? (
            <div className="text-center space-y-3">
              <p className="text-sm font-bold text-green-400">{activePlayers[0].name} thắng!</p>
              <button onClick={() => handleAwardPot(activePlayers[0].id)}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg touch-bounce text-sm">
                Gom {totalPot} chip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {activePlayers.map(p => (
                <button key={p.id} onClick={() => handleAwardPot(p.id)}
                  className="py-3 bg-gradient-to-br from-yellow-500/80 to-orange-500/80 text-white font-bold rounded-2xl shadow-lg touch-bounce text-sm flex flex-col items-center gap-0.5">
                  <span>{p.name}</span>
                  <span className="text-[10px] text-white/60">bỏ {(potContribs[p.id] || 0) + (extraContribs[p.id] || 0)}</span>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setPhase('round')} className="w-full py-2 text-white/40 text-xs font-medium touch-bounce">← Quay lại</button>
        </div>
      )}
    </div>
  )
}
