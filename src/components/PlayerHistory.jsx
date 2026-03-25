import { useState } from 'react'

const ACTION_LABELS = {
  'Win': '🏆 Thắng',
  'Instant Win': '⚡ Tới trắng',
  'Win Pot': '🪙 Thắng pot',
  'Bet': '💰 Đặt',
  'Raise': '⬆ Tố',
  'Call': '👁 Theo',
  'Fold': '❌ Bỏ',
  'Buy-in': '🛒 Mua thêm 50',
}

const WIN_ACTIONS = ['Win', 'Instant Win', 'Win Pot']

export default function PlayerHistory({ player, logs, gameId, onClose }) {
  const [expandedHand, setExpandedHand] = useState(null)
  const isPoker = gameId === 'poker' || gameId === 'pokercalc'

  // Group logs by hand/round for Poker, or just list wins for Cát Tê
  let hands = []

  if (isPoker) {
    // Step 1: Group ALL logs into hands (split by "Win Pot"), keep Buy-ins separate
    let allHands = []
    let currentHand = []
    let handNum = 0
    logs.forEach(log => {
      // Buy-in: standalone entry for this player
      if (log.action === 'Buy-in' && log.playerId === player.id) {
        hands.push({
          num: null,
          summary: `🛒 Mua thêm ${log.amount} chip`,
          isWinner: false,
          isBuyIn: true,
          totalChange: 0,
          details: null,
        })
        return
      }

      currentHand.push(log)
      if (log.action === 'Win Pot') {
        allHands.push(currentHand)
        currentHand = []
      }
    })
    if (currentHand.length > 0) allHands.push(currentHand)

    // Step 2: For each hand, extract player's actions
    allHands.forEach((handLogs, idx) => {
      const playerActions = handLogs.filter(log =>
        log.winnerId === player.id
        || (log.changes && log.changes[player.id] !== undefined)
        || log.playerId === player.id
      )
      if (playerActions.length === 0) return

      handNum++
      const winLog = handLogs.find(l => l.action === 'Win Pot')
      const isFinished = !!winLog
      const isWinner = winLog?.winnerId === player.id
      const totalChange = playerActions.reduce((sum, l) => sum + (l.changes?.[player.id] || 0), 0)

      hands.push({
        num: handNum,
        summary: !isFinished
          ? '⏳ Đang chơi'
          : isWinner
          ? `🪙 Thắng pot`
          : `Thua ${winLog.winnerName}`,
        isWinner,
        totalChange,
        details: playerActions.map(l => ({
          action: l.action,
          change: l.changes?.[player.id] || 0,
          amount: l.amount,
          playerName: l.playerName,
          winnerName: l.winnerName,
        })),
      })
    })
  } else {
    // Cát Tê: each win/loss log is one hand
    const mainLogs = logs.filter(l => WIN_ACTIONS.includes(l.action))
    let handNum = 0
    mainLogs.forEach(log => {
      handNum++
      const change = log.changes?.[player.id] || 0
      const isWinner = log.winnerId === player.id
      const streak = isWinner ? log.streak : null
      hands.push({
        num: handNum,
        summary: isWinner
          ? `${log.action === 'Instant Win' ? '⚡ Tới trắng' : '🏆 Thắng'} +${formatMoney(Math.abs(change))}${streak > 1 ? ` 🔥x${streak}` : ''}`
          : `Thua ${log.winnerName} -${formatMoney(Math.abs(change))}`,
        isWinner,
        totalChange: change,
        streak,
        details: null, // Cát Tê không cần detail dropdown
      })
    })
  }

  // Running total
  let runningTotal = 0
  hands = hands.map(h => {
    runningTotal += h.totalChange
    return { ...h, runningTotal }
  })

  const wins = hands.filter(h => h.isWinner).length
  const losses = hands.filter(h => !h.isWinner && h.totalChange < 0).length

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-gray-800/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col border-t border-white/15 animate-slide-up">
        {/* Handle */}
        <div className="pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10 dark:border-gray-700/30">
          <div>
            <h3 className="text-lg font-extrabold text-white">
              {player.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-lg font-extrabold ${
                player.money > 0 ? 'text-green-500' : player.money < 0 ? 'text-red-500' : 'text-gray-400'
              }`}>
                {player.money > 0 ? '+' : ''}{formatMoney(player.money)}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-green-500/20 text-green-400 text-[10px] font-bold">{wins} thắng</span>
              <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-bold">{losses} thua</span>
              {isPoker && player.gameState?.chips !== undefined && (
                <span className="text-[10px] font-bold text-yellow-400">🪙 {player.gameState.chips}</span>
              )}
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-700 text-gray-400 touch-bounce">
            ✕
          </button>
        </div>

        {/* Hands list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {hands.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Chưa có ván nào</p>
          ) : (
            <div className="space-y-2">
              {hands.map((hand, i) => {
                // Buy-in: simple gray row
                if (hand.isBuyIn) {
                  return (
                    <div key={i} className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3 px-3 py-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-extrabold shrink-0 bg-gray-600/50 text-gray-400">
                          🛒
                        </div>
                        <div className="text-sm font-medium text-gray-400">{hand.summary}</div>
                      </div>
                    </div>
                  )
                }

                const isExpanded = expandedHand === i
                const streak = hand.streak || 0
                const isDemon = streak >= 5
                const isHot = streak >= 3

                return (
                  <div key={i} className={`rounded-xl overflow-hidden transition-all ${
                    isDemon ? 'bg-gradient-to-r from-red-950/40 via-purple-950/30 to-red-950/40 border border-red-500/20'
                      : isHot ? 'bg-orange-900/15 border border-orange-800/20'
                      : hand.isWinner ? 'bg-green-900/10 border border-green-800/15'
                      : hand.totalChange < 0 ? 'bg-red-900/10 border border-red-800/15'
                      : 'bg-white/5 border border-white/10'
                  }`}>
                    {/* Hand summary - clickable for Poker */}
                    <button
                      onClick={() => hand.details && setExpandedHand(isExpanded ? null : i)}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-left ${hand.details ? 'touch-bounce' : ''}`}
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-extrabold shrink-0 ${
                        isDemon ? 'bg-gradient-to-br from-red-600 via-purple-600 to-red-600 text-white'
                          : isHot ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                          : hand.isWinner ? 'bg-green-500 text-white'
                          : hand.totalChange < 0 ? 'bg-red-500/80 text-white'
                          : 'bg-white/20 text-white/60'
                      }`}>
                        {hand.num}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-bold ${
                          isDemon ? 'text-red-400'
                            : hand.isWinner ? 'text-green-400'
                            : hand.totalChange < 0 ? 'text-red-400/80'
                            : 'text-white/50'
                        }`}>
                          {hand.summary}
                          {isDemon && <span className="text-purple-400"> 👹x{streak}</span>}
                          {isHot && !isDemon && <span className="text-red-400"> 🔥x{streak}</span>}
                        </div>
                      </div>

                      {hand.totalChange !== 0 && (
                        <span className={`text-sm font-extrabold shrink-0 ${
                          hand.totalChange > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {hand.totalChange > 0 ? '+' : ''}{hand.totalChange}
                        </span>
                      )}

                      {hand.details && (
                        <span className={`text-white/30 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                      )}
                    </button>

                    {/* Detail dropdown - Poker only */}
                    {isExpanded && hand.details && (
                      <div className="px-3 pb-3 space-y-1 animate-slide-in border-t border-white/5">
                        {hand.details.map((d, j) => (
                          <div key={j} className="flex items-center justify-between py-1.5 px-2">
                            <span className={`text-xs ${
                              d.action === 'Win Pot' ? 'text-green-400 font-bold'
                                : d.action === 'Fold' ? 'text-gray-500'
                                : d.change < 0 ? 'text-red-400/70'
                                : 'text-white/50'
                            }`}>
                              {ACTION_LABELS[d.action] || d.action}
                              {d.change !== 0 && d.action !== 'Win Pot' && ` ${Math.abs(d.change)}`}
                              {d.action === 'Win Pot' && ` ${d.amount}`}
                            </span>
                            {d.change !== 0 && (
                              <span className={`text-xs font-bold ${d.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {d.change > 0 ? '+' : ''}{d.change}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Running total */}
                    <div className={`px-3 py-1.5 text-[10px] font-bold flex justify-between ${
                      hand.runningTotal > 0 ? 'bg-green-500/10 text-green-400/70'
                        : hand.runningTotal < 0 ? 'bg-red-500/10 text-red-400/70'
                        : 'bg-white/5 text-gray-500'
                    }`}>
                      <span>Tổng</span>
                      <span>{hand.runningTotal > 0 ? '+' : ''}{hand.runningTotal}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatMoney(amount) {
  if (Math.abs(amount) >= 1000) {
    return (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + 'k'
  }
  return amount.toString()
}
