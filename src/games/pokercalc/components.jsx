import { useState } from 'react'
import { buyInChips } from './logic'

const ROUND_NAMES = ['Tạo hủ', 'Xem lá 4', 'Xem lá 5 + Show']

export default function PokerCalcBoard({ players, onAction, onViewPlayer, match }) {
  const [roundChips, setRoundChips] = useState({}) // chips being added this round
  const [roundNum, setRoundNum] = useState(0) // 0=tạo hủ, 1=lượt 2, 2=lượt 3
  const [totalPot, setTotalPot] = useState(0)
  const [phase, setPhase] = useState('collect') // 'collect' | 'winner'

  const roundPot = Object.values(roundChips).reduce((sum, c) => sum + c, 0)
  const displayPot = totalPot + roundPot

  const completedHands = (match?.logs || []).filter(l => l.action === 'Win Pot')
  const handNum = completedHands.length + 1

  const doAction = (fn) => onAction(null, null, fn)

  const addChip = (playerId, amount) => {
    const player = players.find(p => p.id === playerId)
    const current = roundChips[playerId] || 0
    const available = (player?.gameState?.chips || 0) - current
    const actual = Math.min(amount, available)
    if (actual <= 0) return
    setRoundChips(prev => ({ ...prev, [playerId]: current + actual }))
  }

  const clearChip = (playerId) => {
    setRoundChips(prev => { const n = { ...prev }; delete n[playerId]; return n })
  }

  // Confirm this round's chips → deduct immediately → next round or winner
  const confirmRound = () => {
    if (roundPot <= 0) return

    // Deduct chips
    const chips = { ...roundChips }
    doAction(() => {
      const changes = {}
      const updatedPlayers = players.map(p => {
        const bet = chips[p.id] || 0
        if (bet <= 0) return p
        changes[p.id] = -bet
        return { ...p, money: p.money - bet, gameState: { ...p.gameState, chips: p.gameState.chips - bet } }
      })
      return { players: updatedPlayers, changes, details: { action: 'Bet', amount: roundPot } }
    })

    const newTotal = totalPot + roundPot
    setTotalPot(newTotal)
    setRoundChips({})

    if (roundNum >= 2) {
      // Last round → go to winner
      setPhase('winner')
    } else {
      setRoundNum(prev => prev + 1)
    }
  }

  // Skip round (no extra chips this round)
  const skipRound = () => {
    if (roundNum >= 2) {
      setPhase('winner')
    } else {
      setRoundNum(prev => prev + 1)
    }
  }

  const handleAwardPot = (winnerId) => {
    const pot = displayPot
    doAction(() => {
      const winner = players.find(p => p.id === winnerId)
      const changes = { [winnerId]: pot }
      const updatedPlayers = players.map(p => {
        if (p.id !== winnerId) return p
        return { ...p, money: p.money + pot, gameState: { ...p.gameState, chips: p.gameState.chips + pot } }
      })
      return { players: updatedPlayers, changes, details: { action: 'Win Pot', winnerId, winnerName: winner.name, amount: pot } }
    })
    resetHand()
  }

  const resetHand = () => {
    setRoundChips({})
    setRoundNum(0)
    setTotalPot(0)
    setPhase('collect')
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
              {phase === 'winner' ? 'Chọn người thắng' : `Lượt ${roundNum + 1}/3 · ${ROUND_NAMES[roundNum]}`}
            </div>
          </div>
        </div>
        {displayPot > 0 && (
          <div className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-400/30 rounded-xl">
            <span className="text-sm font-extrabold text-yellow-400">Hủ: {displayPot}</span>
          </div>
        )}
      </div>

      {/* Player chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {players.map(player => {
          const chips = player.gameState?.chips || 0
          const thisRound = roundChips[player.id] || 0
          const rank = ranked.findIndex(p => p.id === player.id)

          return (
            <div key={player.id}
              className={`relative p-4 rounded-2xl border-2 transition-all text-center
                ${thisRound > 0 ? 'border-yellow-400/50 bg-yellow-500/10 shadow-lg shadow-yellow-500/20' : 'border-white/15 bg-black/40 backdrop-blur-sm'}
                ${player.animClass || ''}`}>
              {completedHands.length > 0 && (
                <div className={`absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                  rank === 0 ? 'bg-yellow-400 text-black' : rank === 1 ? 'bg-gray-300 text-black' : rank === 2 ? 'bg-orange-400 text-black' : 'bg-white/20 text-white/50'
                }`}>{rank + 1}</div>
              )}
              <div className="text-xs font-bold text-white/90 truncate">{player.name}</div>
              <div className={`text-2xl font-extrabold mt-1 ${chips === 0 ? 'text-red-400' : 'text-yellow-400'}`}>🪙 {chips}</div>
              {thisRound > 0 && <div className="text-[10px] text-yellow-300 font-bold mt-0.5 animate-bounce-in">+{thisRound} vào hủ</div>}
              {player.money !== 0 && (
                <div className={`text-[10px] font-bold mt-0.5 ${player.money > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {player.money > 0 ? '+' : ''}{player.money}
                </div>
              )}
              {(player.gameState?.totalBuyIn || 0) > 0 && (
                <div className="text-[8px] text-purple-400/60 mt-0.5">mua: +{player.gameState.totalBuyIn}</div>
              )}
              {chips <= 0 && (
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
                <span className="text-[10px] text-white/40">+{log.amount}</span>
                <span className="text-[10px] text-white/30 ml-auto shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collect phase */}
      {phase === 'collect' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">
              Lượt {roundNum + 1}/3 · {ROUND_NAMES[roundNum]}
            </h3>
            {totalPot > 0 && <span className="text-[10px] text-white/30">Hủ trước: {totalPot}</span>}
          </div>

          <div className="space-y-3">
            {players.map(p => {
              const chips = p.gameState?.chips || 0
              const contrib = roundChips[p.id] || 0
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

          <div className="flex gap-2">
            {/* Confirm round chips + next */}
            {roundPot > 0 && (
              <button onClick={confirmRound}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-yellow-500/30 touch-bounce text-sm">
                {roundNum >= 2 ? `🏆 Gom hủ ${displayPot} → Chọn người thắng` : `✓ Xác nhận +${roundPot} · Lượt tiếp →`}
              </button>
            )}
            {/* Skip (no extra chips this round) - only after round 0 */}
            {roundNum > 0 && roundPot === 0 && (
              <button onClick={skipRound}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 touch-bounce text-sm">
                {roundNum >= 2 ? `🏆 Gom hủ ${displayPot} → Chọn người thắng` : `Không thêm · Lượt tiếp →`}
              </button>
            )}
          </div>

          {(totalPot > 0 || roundPot > 0) && (
            <button onClick={resetHand} className="w-full py-2 text-white/30 text-xs font-medium touch-bounce">Hủy ván</button>
          )}
        </div>
      )}

      {/* Winner phase */}
      {phase === 'winner' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl animate-slide-up space-y-3">
          <p className="text-center text-xs font-bold text-yellow-400">🏆 Ván {handNum} · Ai thắng hủ {displayPot} chip?</p>
          <div className="grid grid-cols-2 gap-2">
            {players.filter(p => (p.gameState?.chips || 0) > 0 || displayPot > 0).map(p => (
              <button key={p.id} onClick={() => handleAwardPot(p.id)}
                className="py-3 bg-gradient-to-br from-yellow-500/80 to-orange-500/80 text-white font-bold rounded-2xl shadow-lg touch-bounce text-sm">
                {p.name}
              </button>
            ))}
          </div>
          <button onClick={() => setPhase('collect')} className="w-full py-2 text-white/40 text-xs font-medium touch-bounce">← Quay lại</button>
        </div>
      )}
    </div>
  )
}
