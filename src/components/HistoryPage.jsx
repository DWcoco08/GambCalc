import { useState, useEffect, useCallback } from 'react'
import { getAllGames } from '../games/registry'
import {
  loadMatchHistory,
  softDeleteMatchService,
  restoreMatchService,
  permanentDeleteMatchService,
  clearHistoryService,
  restoreAllService,
  permanentDeleteAllService,
  uploadLocalHistoryToCloud,
} from '../services/matchService'
import useAuth from '../hooks/useAuth'
import PlayerHistory from './PlayerHistory'

export default function HistoryPage() {
  const { user, isLoggedIn } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterGame, setFilterGame] = useState('all')
  const [showDeleted, setShowDeleted] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [viewingPlayer, setViewingPlayer] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const games = getAllGames()

  const refreshHistory = useCallback(async () => {
    try {
      const data = await loadMatchHistory(user?.id)
      setHistory(data || [])
    } catch {
      setHistory([])
    }
  }, [user?.id])

  // Load on mount + when user changes
  useEffect(() => {
    setLoading(true)
    refreshHistory().finally(() => setLoading(false))
  }, [refreshHistory])

  // Refresh when page becomes visible (tab switch, navigate back)
  useEffect(() => {
    const handleFocus = () => refreshHistory()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refreshHistory])

  const filtered = history.filter(m => {
    if (!showDeleted && m.deleted) return false
    if (showDeleted && !m.deleted) return false
    if (filterGame !== 'all' && m.gameId !== filterGame) return false
    return true
  })

  const deletedCount = history.filter(m => m.deleted).length

  const handleSoftDelete = async (matchId) => {
    await softDeleteMatchService(matchId, user?.id)
    await refreshHistory()
  }
  const handleRestore = async (matchId) => {
    await restoreMatchService(matchId, user?.id)
    await refreshHistory()
  }
  const handlePermanentDelete = async (matchId) => {
    if (confirm('Xóa vĩnh viễn ván này?')) {
      await permanentDeleteMatchService(matchId, user?.id)
      await refreshHistory()
    }
  }
  const handleClearAll = async () => {
    if (confirm('Xóa tất cả? (khôi phục trong thùng rác)')) {
      await clearHistoryService(user?.id)
      await refreshHistory()
    }
  }
  const handleRestoreAll = async () => {
    if (confirm('Khôi phục tất cả ván đã xóa?')) {
      setShowDeleted(false)
      await restoreAllService(user?.id)
      await refreshHistory()
    }
  }
  const handlePermanentDeleteAll = async () => {
    if (confirm('Xóa vĩnh viễn tất cả trong thùng rác? Không thể hoàn tác!')) {
      setShowDeleted(false)
      await permanentDeleteAllService(user?.id)
      await refreshHistory()
    }
  }
  const handleUploadLocal = async () => {
    setSyncing(true)
    const count = await uploadLocalHistoryToCloud(user.id)
    await refreshHistory()
    setSyncing(false)
    alert(`Đã đồng bộ ${count} ván lên cloud!`)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-white">
            {showDeleted ? '🗑️ Thùng rác' : '📋 Lịch sử'}
          </h2>
          <div className="flex gap-1.5">
            {deletedCount > 0 && (
              <button
                onClick={() => setShowDeleted(!showDeleted)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all touch-bounce ${
                  showDeleted
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}
              >
                🗑️ {deletedCount}
              </button>
            )}
            {!showDeleted && history.filter(m => !m.deleted).length > 0 && (
              <button onClick={handleClearAll} className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-bold touch-bounce">
                Xóa tất cả
              </button>
            )}
          </div>
        </div>
        {/* Trash actions */}
        {showDeleted && deletedCount > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleRestoreAll} className="py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold touch-bounce">
              ↩ Khôi phục tất cả
            </button>
            <button onClick={handlePermanentDeleteAll} className="py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-bold touch-bounce">
              Xóa vĩnh viễn tất cả
            </button>
          </div>
        )}
      </div>

      {/* Sync button */}
      {isLoggedIn && !showDeleted && (
        <button
          onClick={handleUploadLocal}
          disabled={syncing}
          className="w-full py-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-bold touch-bounce flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {syncing ? '⏳ Đang đồng bộ...' : '☁️ Đồng bộ dữ liệu local lên cloud'}
        </button>
      )}

      {loading && (
        <div className="text-center py-8">
          <span className="text-2xl animate-bounce-in inline-block">🎴</span>
          <p className="text-gray-400 text-xs mt-2">Đang tải...</p>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {[{ id: 'all', name: 'Tất cả', icon: '🎮' }, ...games].map(g => (
          <button
            key={g.id}
            onClick={() => setFilterGame(g.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all touch-bounce shrink-0 ${
              filterGame === g.id
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}
          >
            {g.icon} {g.name}
          </button>
        ))}
      </div>

      {/* List */}
      {!loading && filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <span className="text-5xl block mb-3">{showDeleted ? '🗑️' : '🎴'}</span>
          <p className="text-sm font-medium">{showDeleted ? 'Thùng rác trống' : 'Chưa có ván nào'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(match => (
            <div
              key={match.id}
              className={`bg-gray-800/90 backdrop-blur-md rounded-2xl border overflow-hidden transition-all shadow-sm ${
                match.deleted
                  ? 'border-gray-200 dark:border-gray-700 opacity-60'
                  : 'border-white/10'
              }`}
            >
              <button
                onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
                className="w-full p-3.5 flex items-center gap-3 text-left touch-bounce"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/20 rounded-xl flex items-center justify-center text-lg shrink-0">
                  {games.find(g => g.id === match.gameId)?.icon || '🎮'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm">
                    {match.gameName}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {new Date(match.startedAt).toLocaleDateString('vi-VN')} · {match.round} ván · {match.players.length} người
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-green-500">
                    🏆 {match.ranking?.[0]?.name}
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold mt-0.5">
                    +{formatMoney(match.ranking?.[0]?.money || 0)}
                  </div>
                </div>
                <span className={`text-gray-300 dark:text-gray-600 text-xs transition-transform ${expandedId === match.id ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>

              {expandedId === match.id && (
                <div className="px-3.5 pb-3.5 space-y-2 animate-slide-in border-t border-white/10 pt-3">
                  {/* Ranking */}
                  <div className="space-y-1">
                    {match.ranking?.map((player, i) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-2.5 text-sm py-1.5 px-2 rounded-xl touch-bounce hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                        onClick={() => setViewingPlayer({ player, logs: match.logs, gameId: match.gameId })}
                      >
                        <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-extrabold ${
                          i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                          i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                          i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                          'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="flex-1 text-gray-700 dark:text-gray-300 text-xs font-semibold">
                          {player.name}
                          <span className="text-[10px] text-gray-400 ml-1 font-normal">xem</span>
                        </span>
                        <span className={`font-extrabold text-xs ${
                          player.money > 0 ? 'text-green-500' : player.money < 0 ? 'text-red-500' : 'text-gray-400'
                        }`}>
                          {player.money > 0 ? '+' : ''}{formatMoney(player.money)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    {match.deleted ? (
                      <>
                        <button onClick={() => handleRestore(match.id)} className="flex-1 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold touch-bounce">
                          ↩ Khôi phục
                        </button>
                        <button onClick={() => handlePermanentDelete(match.id)} className="flex-1 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-bold touch-bounce">
                          Xóa vĩnh viễn
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleSoftDelete(match.id)} className="py-2 px-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-bold touch-bounce">
                        🗑️ Xóa
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Player detail modal */}
      {viewingPlayer && (
        <PlayerHistory
          player={viewingPlayer.player}
          logs={viewingPlayer.logs}
          gameId={viewingPlayer.gameId}
          onClose={() => setViewingPlayer(null)}
        />
      )}
    </div>
  )
}

function formatMoney(amount) {
  if (Math.abs(amount) >= 1000) {
    return (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + 'k'
  }
  return amount.toString()
}
