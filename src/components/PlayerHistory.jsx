export default function PlayerHistory({ player, logs, onClose }) {
  const playerLogs = logs.map(log => ({
    round: log.round,
    change: log.changes?.[player.id] || 0,
    isWinner: log.winnerId === player.id,
    action: log.action,
    winnerName: log.winnerName,
    streak: log.winnerId === player.id ? log.streak : null,
    timestamp: log.timestamp,
  }))

  let runningTotal = 0
  const rows = playerLogs.map(l => {
    runningTotal += l.change
    return { ...l, total: runningTotal }
  })

  const wins = rows.filter(r => r.isWinner).length
  const losses = rows.filter(r => !r.isWinner).length

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col border-t border-gray-100 dark:border-gray-700 animate-slide-up">
        {/* Handle */}
        <div className="pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
              {player.name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-lg font-extrabold ${
                player.money > 0 ? 'text-green-500' : player.money < 0 ? 'text-red-500' : 'text-gray-400'
              }`}>
                {player.money > 0 ? '+' : ''}{formatMoney(player.money)}
              </span>
              <div className="flex gap-2 text-[10px] font-bold uppercase">
                <span className="text-green-500">{wins}W</span>
                <span className="text-red-400">{losses}L</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-400 touch-bounce"
          >
            ✕
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {rows.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Chưa có lượt nào</p>
          ) : (
            <div className="space-y-1.5">
              {rows.map((row, i) => {
                const winStreak = row.isWinner ? (row.streak || 0) : 0
                const isDemon = winStreak >= 5
                const isHot = winStreak >= 3

                const rowBg = isDemon
                  ? 'bg-gradient-to-r from-red-950/30 via-purple-950/20 to-red-950/30 dark:from-red-950/40 dark:via-purple-950/30 dark:to-red-950/40 border border-red-500/20'
                  : isHot
                  ? 'bg-gradient-to-r from-orange-50 via-red-50/50 to-orange-50 dark:from-orange-900/15 dark:via-red-900/10 dark:to-orange-900/15 border border-orange-200/30 dark:border-orange-800/20'
                  : row.isWinner
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/5'
                  : 'bg-gradient-to-r from-red-50 to-rose-50/50 dark:from-red-900/10 dark:to-rose-900/5'

                return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${rowBg}`}
                >
                  <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-extrabold shrink-0 ${
                    isDemon
                      ? 'bg-gradient-to-br from-red-600 via-purple-600 to-red-600 text-white shadow-sm shadow-red-500/30'
                      : isHot
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                      : row.isWinner
                      ? 'bg-green-500 text-white'
                      : 'bg-red-400 text-white'
                  }`}>
                    {row.round}
                  </span>
                  <span className="flex-1 min-w-0 text-xs">
                    {row.isWinner ? (
                      <span className={`font-bold ${isDemon ? 'text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {row.action === 'Instant Win' ? '⚡ Tới trắng' : '🏆 Thắng'}
                        {winStreak >= 5 && <span className="text-purple-400"> 👹x{winStreak}</span>}
                        {winStreak >= 3 && winStreak < 5 && <span className="text-red-500"> 🔥x{winStreak}</span>}
                        {winStreak > 1 && winStreak < 3 && <span className="text-orange-500"> 🔥x{winStreak}</span>}
                      </span>
                    ) : (
                      <span className="text-gray-400 font-medium">
                        vs {row.winnerName}
                      </span>
                    )}
                  </span>
                  <span className={`font-extrabold text-xs shrink-0 ${
                    row.change > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {row.change > 0 ? '+' : ''}{formatMoney(row.change)}
                  </span>
                  <span className={`font-mono text-[10px] font-bold shrink-0 w-10 text-right ${
                    row.total > 0 ? 'text-green-600 dark:text-green-400' : row.total < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'
                  }`}>
                    {row.total > 0 ? '+' : ''}{formatMoney(row.total)}
                  </span>
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
