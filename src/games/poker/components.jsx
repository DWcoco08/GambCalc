import { useState } from 'react'
import { placeBets, placeRaise, placeCall, awardPot, buyInChips } from './logic'

const ROUND_LABELS = ['', 'Vòng 1 · Xem 3 lá', 'Vòng 2 · Lá thứ 4', 'Vòng 3 · Lá thứ 5']

export default function PokerBoard({ players, onAction, onViewPlayer, baseBet, disabled, match }) {
  const [bets, setBets] = useState({})
  const [phase, setPhase] = useState('betting')
  const [folded, setFolded] = useState({})
  const [roundNum, setRoundNum] = useState(0)
  const [pot, setPot] = useState(0)
  const [pendingRaise, setPendingRaise] = useState(null) // { playerId, amount, playerName }
  const [respondedToRaise, setRespondedToRaise] = useState({})
  const [raisePlayer, setRaisePlayer] = useState(null)

  const prePot = Object.values(bets).reduce((sum, b) => sum + b, 0)
  const playersWithBets = players.filter(p => phase === 'betting' ? (bets[p.id] || 0) > 0 : true)
  const inHandPlayers = players.filter(p => p.gameState?.inHand && !folded[p.id])

  const addBet = (playerId, amount) => {
    const player = players.find(p => p.id === playerId)
    const currentBet = bets[playerId] || 0
    const available = (player?.gameState?.chips || 0) - currentBet
    const actual = Math.min(amount, available)
    if (actual <= 0) return
    setBets(prev => ({ ...prev, [playerId]: currentBet + actual }))
  }

  const clearBet = (playerId) => {
    setBets(prev => { const n = { ...prev }; delete n[playerId]; return n })
  }

  const startRounds = () => {
    const betPlayers = players.filter(p => (bets[p.id] || 0) > 0)
    if (betPlayers.length < 2) return
    const totalBet = Object.values(bets).reduce((sum, b) => sum + b, 0)
    onAction(null, null, () => {
      const result = placeBets(players, bets)
      result.players = result.players.map(p => ({
        ...p,
        gameState: { ...p.gameState, inHand: (bets[p.id] || 0) > 0 },
      }))
      return result
    })
    setPot(totalBet)
    setBets({})
    setFolded({})
    setRoundNum(1)
    setPendingRaise(null)
    setRespondedToRaise({})
    setRaisePlayer(null)
    setPhase('round')
  }

  const handleFold = (playerId) => {
    const newFolded = { ...folded, [playerId]: true }
    setFolded(newFolded)
    if (pendingRaise) {
      const newResponded = { ...respondedToRaise, [playerId]: true }
      setRespondedToRaise(newResponded)
      checkAllResponded(newFolded, newResponded)
    }
    const remaining = players.filter(p => p.gameState?.inHand && !newFolded[p.id])
    if (remaining.length <= 1) {
      setPendingRaise(null)
      setPhase('winner')
    }
  }

  const handleRaise = (playerId, amount) => {
    const player = players.find(p => p.id === playerId)
    const actual = Math.min(amount, player?.gameState?.chips || 0)
    if (actual <= 0) return
    onAction(null, null, () => placeRaise(players, playerId, actual))
    setPot(prev => prev + actual)
    // Everyone else (active, not folded, has chips) must respond
    setPendingRaise({ playerId, amount: actual, playerName: player.name })
    setRespondedToRaise({ [playerId]: true })
    setRaisePlayer(null)
  }

  const handleCallRaise = (playerId) => {
    if (!pendingRaise) return
    const player = players.find(p => p.id === playerId)
    const actual = Math.min(pendingRaise.amount, player?.gameState?.chips || 0)
    onAction(null, null, () => placeCall(players, playerId, actual))
    setPot(prev => prev + actual)
    const newResponded = { ...respondedToRaise, [playerId]: true }
    setRespondedToRaise(newResponded)
    checkAllResponded(folded, newResponded)
  }

  // Re-raise: someone who already responded now raises more
  const handleReRaise = (playerId, amount) => {
    const player = players.find(p => p.id === playerId)
    const actual = Math.min(amount, player?.gameState?.chips || 0)
    if (actual <= 0) return
    onAction(null, null, () => placeRaise(players, playerId, actual))
    setPot(prev => prev + actual)
    // Reset: everyone must respond again except re-raiser
    setPendingRaise({ playerId, amount: actual, playerName: player.name })
    setRespondedToRaise({ [playerId]: true })
    setRaisePlayer(null)
  }

  const checkAllResponded = (currentFolded, currentResponded) => {
    const needToRespond = players.filter(p =>
      p.gameState?.inHand && !currentFolded[p.id] && !currentResponded[p.id] && (p.gameState?.chips || 0) > 0
    )
    if (needToRespond.length === 0) {
      setPendingRaise(null)
      setRespondedToRaise({})
    }
  }

  const handleBuyIn = (playerId) => {
    onAction(null, null, () => buyInChips(players, playerId))
  }

  const nextRound = () => {
    if (roundNum >= 3) setPhase('winner')
    else setRoundNum(prev => prev + 1)
    setPendingRaise(null)
    setRespondedToRaise({})
    setRaisePlayer(null)
  }

  const handleSelectWinner = (winnerId) => {
    onAction(null, null, () => awardPot(players, winnerId, pot))
    resetAll()
  }

  const resetAll = () => {
    setBets({})
    setFolded({})
    setRoundNum(0)
    setPot(0)
    setPendingRaise(null)
    setRespondedToRaise({})
    setRaisePlayer(null)
    setPhase('betting')
  }

  const canNextRound = !pendingRaise

  return (
    <div className="space-y-4">
      {/* Poker table */}
      <div className="relative w-full aspect-[4/3] lg:aspect-[5/3] max-w-2xl mx-auto mb-4">
        <div className="absolute inset-6 sm:inset-10 rounded-[50%] bg-gradient-to-br from-green-900/80 to-green-800/80 border-4 border-yellow-700/60 shadow-2xl shadow-green-900/50">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl sm:text-4xl mb-1">🪙</div>
            <div className="text-white font-extrabold text-xl sm:text-2xl">
              {phase === 'betting' ? prePot : pot}
            </div>
            <div className="text-white/40 text-[10px] font-bold uppercase tracking-wider">POT</div>
            {phase === 'round' && (
              <div className="mt-1.5 px-3 py-1 bg-black/40 rounded-full text-yellow-400 text-[10px] font-bold animate-bounce-in">
                {ROUND_LABELS[roundNum]}
              </div>
            )}
            {pendingRaise && phase === 'round' && (
              <div className="mt-1 px-3 py-1 bg-red-500/30 rounded-full text-red-300 text-[10px] font-bold animate-shake">
                ⬆ {pendingRaise.playerName} tố +{pendingRaise.amount}!
              </div>
            )}
          </div>
        </div>

        {/* Player seats */}
        {players.map((player, idx) => {
          const angle = (idx / players.length) * 2 * Math.PI - Math.PI / 2
          const rx = 44, ry = 40
          const x = 50 + rx * Math.cos(angle)
          const y = 50 + ry * Math.sin(angle)
          const chips = player.gameState?.chips || 0
          const isFolded = folded[player.id]
          const preBet = bets[player.id] || 0
          const inHand = player.gameState?.inHand

          return (
            <div key={player.id} className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
              style={{ left: `${x}%`, top: `${y}%` }}>
              <div className={`relative px-2.5 py-2 rounded-2xl text-center min-w-[68px] sm:min-w-[90px] transition-all
                ${isFolded ? 'bg-black/60 border border-white/10 opacity-40'
                  : preBet > 0 || (inHand && phase !== 'betting') ? 'bg-yellow-500/20 border-2 border-yellow-400/50 shadow-lg shadow-yellow-500/20'
                  : 'bg-black/50 border border-white/15 backdrop-blur-sm'}
                ${player.animClass || ''}`}>
                <div className="text-[10px] sm:text-xs font-bold text-white/90 truncate max-w-[55px] sm:max-w-[80px]">
                  {player.name}
                </div>
                <div className={`text-sm sm:text-base font-extrabold ${chips === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                  🪙{chips}{phase === 'betting' && preBet > 0 ? <span className="text-white/40">→{chips - preBet}</span> : ''}
                </div>
                {player.money !== 0 && (
                  <div className={`text-[9px] font-bold ${player.money > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {player.money > 0 ? '+' : ''}{player.money}
                  </div>
                )}
                {phase === 'betting' && preBet > 0 && <div className="text-[9px] text-yellow-300 font-bold">đặt: {preBet}</div>}
                {isFolded && <div className="text-[9px] text-red-400 font-bold uppercase">Bỏ</div>}
                {/* Buy-in: show in betting phase OR during round when 0 chips */}
                {chips <= 0 && !isFolded && (
                  <button onClick={(e) => { e.stopPropagation(); handleBuyIn(player.id) }}
                    className="mt-1 px-2 py-0.5 rounded-lg text-[8px] font-bold bg-purple-500/30 text-purple-300 touch-bounce">
                    +Mua 50
                  </button>
                )}
                {(player.gameState?.totalBuyIn || 0) > 0 && (
                  <div className="text-[7px] text-purple-400/60">+{player.gameState.totalBuyIn} mua</div>
                )}
                {player.lastChange != null && player.lastChange !== 0 && (
                  <div className={`absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-xl text-[10px] font-extrabold animate-bounce-in shadow-lg ${
                    player.lastChange > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/40'
                      : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-500/40'}`}>
                    {player.lastChange > 0 ? '+' : ''}{player.lastChange}
                  </div>
                )}
                <button onClick={() => onViewPlayer?.(player.id)} className="text-[7px] text-white/25 hover:text-white/50">chi tiết</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Phase: Betting */}
      {phase === 'betting' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl animate-fade-in">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Đặt chip vào pot</h3>
          <div className="space-y-3">
            {players.map(player => {
              const chips = player.gameState?.chips || 0
              const currentBet = bets[player.id] || 0
              const available = chips - currentBet
              if (chips <= 0) return (
                <div key={player.id} className="flex items-center justify-between px-1 opacity-50">
                  <span className="text-xs font-bold text-white/40">{player.name} <span className="text-red-400">hết chip</span></span>
                  <button onClick={() => handleBuyIn(player.id)} className="text-[10px] font-bold text-purple-400 touch-bounce">+Mua 50</button>
                </div>
              )
              return (
                <div key={player.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/80">
                      {player.name} <span className="text-white/30">({chips}, còn {available})</span>
                    </span>
                    <span className="text-xs font-extrabold text-yellow-400">{currentBet || '—'}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {[1, 2, 3, 5, 10].map(n => (
                      <button key={n} onClick={() => addBet(player.id, n)} disabled={available < n}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/10 text-white/70 hover:bg-yellow-500/30 hover:text-yellow-400 touch-bounce disabled:opacity-20">
                        +{n}
                      </button>
                    ))}
                    {currentBet > 0 && (
                      <button onClick={() => clearBet(player.id)}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/10 text-red-400 touch-bounce">✕</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {prePot > 0 && (
            <div className="flex gap-2 mt-4">
              <button onClick={resetAll} className="flex-1 py-3 bg-white/10 text-white/60 font-semibold rounded-2xl touch-bounce text-sm">Reset</button>
              <button onClick={startRounds} disabled={Object.keys(bets).length < 2}
                className="flex-[2] py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 touch-bounce text-sm disabled:opacity-30">
                🃏 Bắt đầu · Pot {prePot}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Phase: Rounds */}
      {phase === 'round' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl animate-slide-up">
          <p className="text-center text-xs font-bold text-yellow-400 mb-1">{ROUND_LABELS[roundNum]}</p>
          <p className="text-center text-[10px] text-white/40 mb-3">Còn {inHandPlayers.length} người · Pot: {pot}</p>

          <div className="space-y-2 mb-4">
            {players.filter(p => p.gameState?.inHand).map(p => {
              const isFolded = folded[p.id]
              const chips = p.gameState?.chips || 0
              const hasChips = chips > 0
              const needsRespond = pendingRaise && !isFolded && !respondedToRaise[p.id] && p.id !== pendingRaise.playerId
              const hasResponded = pendingRaise && respondedToRaise[p.id] && p.id !== pendingRaise.playerId

              return (
                <div key={p.id} className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  isFolded ? 'bg-white/5 opacity-40'
                    : !hasChips ? 'bg-white/5 opacity-60'
                    : needsRespond ? 'bg-orange-500/15 border border-orange-400/30 animate-shake'
                    : 'bg-white/10'}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-bold truncate ${isFolded ? 'text-white/30 line-through' : 'text-white/90'}`}>
                      {p.name}
                    </span>
                    <span className={`text-[10px] font-bold ${chips === 0 ? 'text-red-400' : 'text-yellow-400/70'}`}>🪙{chips}</span>
                    {!hasChips && !isFolded && (
                      <button onClick={() => handleBuyIn(p.id)}
                        className="text-[9px] font-bold text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded touch-bounce">
                        +Mua 50
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {/* Needs to respond to raise */}
                    {!isFolded && needsRespond && hasChips && (
                      <button onClick={() => handleCallRaise(p.id)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-500/30 text-blue-300 hover:bg-blue-500/40 touch-bounce">
                        👁 Theo {Math.min(pendingRaise.amount, chips)}
                      </button>
                    )}
                    {/* Already responded - can re-raise */}
                    {!isFolded && hasResponded && hasChips && !raisePlayer && (
                      <button onClick={() => setRaisePlayer(p.id)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-orange-500/20 text-orange-400 touch-bounce">
                        ⬆ Tố lại
                      </button>
                    )}
                    {/* No pending raise - can raise */}
                    {!isFolded && !pendingRaise && hasChips && !raisePlayer && (
                      <button onClick={() => setRaisePlayer(p.id)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-orange-500/20 text-orange-400 touch-bounce">
                        ⬆ Tố
                      </button>
                    )}
                    {/* No chips */}
                    {!isFolded && needsRespond && !hasChips && (
                      <span className="text-[10px] text-red-400/60 font-bold">Hết chip</span>
                    )}
                    {/* Fold button */}
                    {!isFolded && (
                      <button onClick={() => handleFold(p.id)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-400 touch-bounce">
                        ❌ Bỏ
                      </button>
                    )}
                    {isFolded && <span className="text-[10px] text-red-400/50 font-bold">Đã bỏ</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Raise amount selector */}
          {raisePlayer && (
            <div className="mb-4 p-3 bg-orange-500/10 border border-orange-400/20 rounded-xl animate-fade-in">
              <p className="text-[10px] text-orange-400 font-bold mb-2">
                {players.find(p => p.id === raisePlayer)?.name} tố bao nhiêu? (còn {players.find(p => p.id === raisePlayer)?.gameState?.chips || 0} chip)
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {[1, 2, 3, 5].map(n => {
                  const rp = players.find(p => p.id === raisePlayer)
                  return (
                    <button key={n} onClick={() => pendingRaise ? handleReRaise(raisePlayer, n) : handleRaise(raisePlayer, n)}
                      disabled={(rp?.gameState?.chips || 0) < n}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-orange-500/30 text-orange-300 hover:bg-orange-500/50 touch-bounce disabled:opacity-20">
                      +{n}
                    </button>
                  )
                })}
                <button onClick={() => setRaisePlayer(null)}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-white/10 text-white/40 touch-bounce">Hủy</button>
              </div>
            </div>
          )}

          {/* Next round / showdown */}
          {!raisePlayer && (
            <div className="flex gap-2">
              {canNextRound && roundNum < 3 && (
                <button onClick={nextRound}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 touch-bounce text-sm">
                  👁 Xem lá tiếp →
                </button>
              )}
              {canNextRound && roundNum >= 3 && (
                <button onClick={() => setPhase('winner')}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-yellow-500/30 touch-bounce text-sm">
                  🏆 So bài
                </button>
              )}
              {!canNextRound && (
                <div className="flex-1 py-3 text-center text-orange-400 text-xs font-bold">
                  ⏳ Chờ mọi người theo hoặc bỏ...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Phase: Winner */}
      {phase === 'winner' && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-xl animate-slide-up">
          <p className="text-center text-xs font-bold text-yellow-400 mb-3">🏆 Ai thắng? · Pot: {pot}</p>
          {inHandPlayers.length === 1 ? (
            <div className="text-center space-y-3">
              <p className="text-sm font-bold text-green-400">{inHandPlayers[0].name} thắng!</p>
              <button onClick={() => handleSelectWinner(inHandPlayers[0].id)}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg touch-bounce text-sm">
                Gom {pot} chip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {inHandPlayers.map(p => (
                <button key={p.id} onClick={() => handleSelectWinner(p.id)}
                  className="py-3 bg-gradient-to-br from-yellow-500/80 to-orange-500/80 text-white font-bold rounded-2xl shadow-lg touch-bounce text-sm">
                  {p.name}
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setPhase('round')} className="w-full mt-2 py-2 text-white/40 text-xs font-medium touch-bounce">← Quay lại</button>
        </div>
      )}
    </div>
  )
}
