export default function LogPanel({ logs }) {
  // Only show main results (Win/Win Pot/Instant Win), not intermediate actions (Bet/Raise/Call/Fold/Buy-in)
  const mainLogs = logs.filter(log =>
    log.action === 'Win' || log.action === 'Instant Win' || log.action === 'Win Pot'
  )

  if (!mainLogs || mainLogs.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs">
        Chưa có ván nào
      </div>
    )
  }

  // Track lose streaks per player across main logs
  const loseStreaks = {}
  mainLogs.forEach(log => {
    if (log.winnerId) loseStreaks[log.winnerId] = 0
    if (log.changes) {
      Object.entries(log.changes).forEach(([pid, change]) => {
        if (Number(pid) !== log.winnerId && change < 0) {
          loseStreaks[pid] = (loseStreaks[pid] || 0) + 1
        }
      })
    }
  })

  return (
    <div className="space-y-1.5 max-h-64 lg:max-h-none overflow-y-auto">
      {[...mainLogs].reverse().map((log, i) => {
        const streak = log.streak || 0
        const isDemon = streak >= 5
        const isHot = streak >= 3

        // Row bg based on streak tier
        const rowBg = isDemon
          ? 'bg-gradient-to-r from-red-950/30 via-purple-950/20 to-red-950/30 dark:from-red-950/40 dark:via-purple-950/30 dark:to-red-950/40 border border-red-500/20'
          : isHot
          ? 'bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 dark:from-orange-900/15 dark:via-red-900/10 dark:to-orange-900/15 border border-orange-300/20 dark:border-orange-800/20'
          : log.action === 'Instant Win'
          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10'
          : 'bg-gray-50 dark:bg-gray-800/50'

        // Round badge color
        const roundBg = isDemon
          ? 'bg-gradient-to-br from-red-600 via-purple-600 to-red-600 text-white shadow-sm shadow-red-500/30'
          : isHot
          ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
          : log.action === 'Instant Win'
          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'

        // Streak badge
        const streakBadge = isDemon
          ? 'bg-gradient-to-r from-red-600 via-purple-600 to-red-600 text-white shadow-md shadow-red-500/40 animate-demon-badge'
          : isHot
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm'
          : streak > 1
          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500'
          : null

        return (
          <div
            key={log.id}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl text-sm ${i === 0 ? 'animate-slide-in' : ''} ${rowBg} ${isDemon ? 'animate-demon-card' : ''}`}
          >
            <div className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-extrabold shrink-0 ${roundBg}`}>
              {log.round}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`font-bold text-xs truncate ${isDemon ? 'text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {log.winnerName}
                </span>
                {streak > 1 && streakBadge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${streakBadge}`}>
                    {isDemon ? '👹' : '🔥'}{streak}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-semibold ${
                  log.action === 'Instant Win' ? 'text-yellow-600 dark:text-yellow-400'
                    : log.action === 'Win Pot' ? 'text-yellow-500 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {log.action === 'Instant Win' ? '⚡ Tới trắng'
                    : log.action === 'Win Pot' ? '🪙 Thắng pot'
                    : '🏆 Thắng'}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`font-extrabold text-xs ${isDemon ? 'text-red-400' : 'text-green-500'}`}>
                +{formatMoney(log.amount)}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatMoney(amount) {
  if (Math.abs(amount) >= 1000) {
    return (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + 'k'
  }
  return amount.toString()
}
