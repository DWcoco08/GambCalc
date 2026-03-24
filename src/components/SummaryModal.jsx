export default function SummaryModal({ summary, onClose }) {
  if (!summary) return null

  const { ranking, round, gameName, logs } = summary

  const topWinner = ranking[0]
  const highestStreak = Math.max(...logs.map(l => l.streak || 0), 0)

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md p-6 space-y-5 animate-slide-up border-t border-gray-100 dark:border-gray-700 max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto sm:hidden" />

        {/* Trophy */}
        <div className="text-center">
          <div className="relative inline-block">
            <span className="text-6xl animate-bounce-in inline-block">🏆</span>
            <div className="absolute -top-2 -right-2 animate-confetti">✨</div>
            <div className="absolute -top-1 -left-3 animate-confetti" style={{ animationDelay: '0.2s' }}>🎉</div>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-3">
            Kết thúc ván!
          </h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium mt-1">
            {gameName} · {round} lượt
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: round, label: 'Lượt', color: 'text-purple-500', bg: 'from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10' },
            { value: topWinner?.name, label: 'Top 1', color: 'text-green-500', bg: 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10', truncate: true },
            { value: highestStreak, label: 'Max 🔥', color: 'text-orange-500', bg: 'from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10' },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-3 text-center`}>
              <div className={`text-xl font-extrabold ${stat.color} ${stat.truncate ? 'truncate text-base' : ''}`}>
                {stat.value}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Ranking */}
        <div className="space-y-2">
          {ranking.map((player, i) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-3 rounded-2xl animate-slide-up ${
                i === 0
                  ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/10 border border-yellow-200/60 dark:border-yellow-800/40 shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-700/30'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-extrabold shadow-sm ${
                i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-yellow-400/30' :
                i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {i === 0 ? '👑' : i + 1}
              </div>
              <div className="flex-1 font-bold text-gray-900 dark:text-white text-sm">
                {player.name}
              </div>
              <div className={`font-extrabold text-sm ${
                player.money > 0 ? 'text-green-500' : player.money < 0 ? 'text-red-500' : 'text-gray-400'
              }`}>
                {player.money > 0 ? '+' : ''}{formatMoney(player.money)}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 transition-all touch-bounce"
        >
          Đóng
        </button>
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
