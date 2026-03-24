import { useState } from 'react'
import { buyInChips } from './logic'

const ROUND_NAMES = ['Tạo hủ', 'Xem lá 4', 'Xem lá 5', 'Show']

export default function PokerCalcBoard({ players, onAction, onViewPlayer, match }) {
  const [roundChips, setRoundChips] = useState({})
  const [roundNum, setRoundNum] = useState(0)
  const [totalPot, setTotalPot] = useState(0)
  const [phase, setPhase] = useState('collect')
  const [folded, setFolded] = useState({})
  const [handPlayers, setHandPlayers] = useState({}) // players in current hand

  const roundPot = Object.values(roundChips).reduce((sum, c) => sum + c, 0)
  const displayPot = totalPot + roundPot
  const activePlayers = players.filter(p => handPlayers[p.id] && !folded[p.id])
  const isInHand = roundNum > 0 || totalPot > 0 // hand started

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

  const startHand = () => {
    const betPlayers = players.filter(p => (roundChips[p.id] || 0) > 0)
    if (betPlayers.length < 2) return

    // Mark who's in hand
    const hp = {}
    betPlayers.forEach(p => { hp[p.id] = true })
    setHandPlayers(hp)

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
      return { players: updatedPlayers, changes, details: { action: 'Bet', amount: Object.values(chips).reduce((s, c) => s + c, 0) } }
    })

    setTotalPot(roundPot)
    setRoundChips({})
    setRoundNum(1)
    setFolded({})
  }

  const confirmRound = () => {
    if (roundPot <= 0) return
    const chips = { ...roundChips }
    doAction(() => {
      const changes = {}
      const updatedPlayers = players.map(p => {
        const bet = chips[p.id] || 0
        if (bet <= 0) return p
        changes[p.id] = -bet
        return { ...p, money: p.money - bet, gameState: { ...p.gameState, chips: p.gameState.chips - bet } }
      })
      return { players: updatedPlayers, changes, details: { action: 'Bet', amount: Object.values(chips).reduce((s, c) => s + c, 0) } }
    })
    setTotalPot(prev => prev + roundPot)
    setRoundChips({})
    if (roundNum >= 3) setPhase('winner')
    else setRoundNum(prev => prev + 1)
  }

  const skipRound = () => {
    if (roundNum >= 3) setPhase('winner')
    else setRoundNum(prev => prev + 1)
  }

  const handleFold = (playerId) => {
    const newFolded = { ...folded, [playerId]: true }
    setFolded(newFolded)
    const remaining = players.filter(p => handPlayers[p.id] && !newFolded[p.id])
    if (remaining.length <= 1) {
      // Confirm any pending chips first
      if (roundPot > 0) {
        const chips = { ...roundChips }
        doAction(() => {
          const changes = {}
          const updatedPlayers = players.map(p => {
            const bet = chips[p.id] || 0
            if (bet <= 0) return p
            changes[p.id] = -bet
            return { ...p, money: p.money - bet, gameState: { ...p.gameState, chips: p.gameState.chips - bet } }
          })
          return { players: updatedPlayers, changes, details: { action: 'Bet', amount: Object.values(chips).reduce((s, c) => s + c, 0) } }
        })
        setTotalPot(prev => prev + roundPot)
        setRoundChips({})
      }
      setPhase('winner')
    }
  }

  const handleAwardPot = (winnerId) => {
    const pot = totalPot + roundPot
    doAction(() => {
      const winner = players.find(p => p.id === winnerId)
      return {
        players: players.map(p => p.id !== winnerId ? p : { ...p, money: p.money + pot, gameState: { ...p.gameState, chips: p.gameState.chips + pot } }),
        changes: { [winnerId]: pot },
        details: { action: 'Win Pot', winnerId, winnerName: winner.name, amount: pot },
      }
    })
    resetHand()
  }

  const handleBuyIn = (playerId, amt) => {
    doAction(() => buyInChips(players, playerId, amt))
  }

  const resetHand = () => {
    setRoundChips({})
    setRoundNum(0)
    setTotalPot(0)
    setPhase('collect')
    setFolded({})
    setHandPlayers({})
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
              {phase === 'winner' ? 'Chọn người thắng' :
                isInHand ? `Lượt ${roundNum + 1}/4 · ${ROUND_NAMES[roundNum]}` : 'Đặt chip vào hủ'}
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
          const isFolded = folded[player.id]
          const rank = ranked.findIndex(p => p.id === player.id)

          return (
            <div key={player.id}
              className={`relative p-4 rounded-2xl border-2 transition-all text-center
                ${isFolded ? 'border-white/10 bg-black/40 opacity-40'
                  : thisRound > 0 ? 'border-yellow-400/50 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                  : 'border-white/15 bg-black/40 backdrop-blur-sm'}
                ${player.animClass || ''}`}>
              {completedHands.length > 0 && (
                <div className={`absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                  rank === 0 ? 'bg-yellow-400 text-black' : rank === 1 ? 'bg-gray-300 text-black' : rank === 2 ? 'bg-orange-400 text-black' : 'bg-white/20 text-white/50'
                }`}>{rank + 1}</div>
              )}
              <div className="text-xs font-bold text-white/90 truncate">{player.name}</div>
              <div className={`text-2xl font-extrabold mt-1 ${chips === 0 ? 'text-red-400' : 'text-yellow-400'}`}>🪙 {chips}</div>
              {thisRound > 0 && <div className="text-[10px] text-yellow-300 font-bold mt-0.5 animate-bounce-in">+{thisRound} vào hủ</div>}
              {isFolded && <div className="text-[10px] text-red-400 font-bold mt-0.5">Bỏ</div>}
              {player.money !== 0 && (
                <div className={`text-[10px] font-bold mt-0.5 ${player.money > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {player.money > 0 ? '+' : ''}{player.money}
                </div>
              )}
              {(player.gameState?.totalBuyIn || 0) > 0 && (
                <div className="text-[8px] text-purple-400/60 mt-0.5">mua: +{player.gameState.totalBuyIn}</div>
              )}
              {chips <= 0 && !isFolded && (
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

      {/* Collect phase */}
      {phase === 'collect' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">
              {isInHand ? `Lượt ${roundNum + 1}/4 · ${ROUND_NAMES[roundNum]}` : `Ván ${handNum} · Tạo hủ`}
            </h3>
            {totalPot > 0 && <span className="text-[10px] text-white/30">Hủ trước: {totalPot}</span>}
          </div>

          <div className="space-y-3">
            {players.map(p => {
              const chips = p.gameState?.chips || 0
              const contrib = roundChips[p.id] || 0
              const available = chips - contrib
              const isFolded = folded[p.id]
              if (chips <= 0 || isFolded) return null
              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/80">{p.name} <span className="text-white/30">({chips})</span></span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-yellow-400">{contrib || '—'}</span>
                      {isInHand && handPlayers[p.id] && (
                        <button onClick={() => handleFold(p.id)}
                          className="px-2 py-1 rounded-lg text-[9px] font-bold bg-red-500/20 text-red-400 touch-bounce">❌ Bỏ</button>
                      )}
                    </div>
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
            {/* Show folded players */}
            {players.filter(p => folded[p.id]).map(p => (
              <div key={p.id} className="flex items-center justify-between px-1 opacity-40">
                <span className="text-xs font-bold text-white/30 line-through">{p.name}</span>
                <span className="text-[10px] text-red-400 font-bold">Đã bỏ</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {!isInHand && roundPot > 0 && Object.keys(roundChips).length >= 2 && (
              <button onClick={startHand}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 touch-bounce text-sm">
                🃏 Bắt đầu ván · Hủ {roundPot}
              </button>
            )}
            {isInHand && roundPot > 0 && (
              <button onClick={confirmRound}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-yellow-500/30 touch-bounce text-sm">
                {roundNum >= 3 ? `🏆 Gom hủ ${displayPot} → Chọn người thắng` : `✓ Xác nhận +${roundPot} · Lượt tiếp →`}
              </button>
            )}
            {isInHand && roundPot === 0 && (
              <button onClick={skipRound}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 touch-bounce text-sm">
                {roundNum >= 3 ? `🏆 Gom hủ ${displayPot} → Chọn người thắng` : `Không thêm · Lượt tiếp →`}
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
          {activePlayers.length === 1 ? (
            <div className="text-center space-y-3">
              <p className="text-sm font-bold text-green-400">{activePlayers[0].name} thắng!</p>
              <button onClick={() => handleAwardPot(activePlayers[0].id)}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg touch-bounce text-sm">
                Gom {displayPot} chip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {activePlayers.map(p => (
                <button key={p.id} onClick={() => handleAwardPot(p.id)}
                  className="py-3 bg-gradient-to-br from-yellow-500/80 to-orange-500/80 text-white font-bold rounded-2xl shadow-lg touch-bounce text-sm">
                  {p.name}
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setPhase('collect')} className="w-full py-2 text-white/40 text-xs font-medium touch-bounce">← Quay lại</button>
        </div>
      )}
    </div>
  )
}
