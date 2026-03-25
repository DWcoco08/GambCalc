import { useState } from 'react'
import { getGame } from '../games/registry'
import MatchSetup from './MatchSetup'
import LogPanel from './LogPanel'
import SummaryModal from './SummaryModal'
import PlayerHistory from './PlayerHistory'

export default function GameContainer({ gameId, match, onStartMatch, onAction, onUndo, onRedo, canUndo, canRedo, onEndMatch, onResetStreak, onToggleDisabled, onAddPlayer }) {
  const [summary, setSummary] = useState(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [viewingPlayer, setViewingPlayer] = useState(null)
  const [showLog, setShowLog] = useState(true) // default open
  const game = getGame(gameId)

  if (!game) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Game không tồn tại</div>
  }

  if (!match || match.gameId !== gameId) {
    return (
      <>
        <MatchSetup gameId={gameId} onStart={onStartMatch} />
        <SummaryModal summary={summary} onClose={() => setSummary(null)} />
      </>
    )
  }

  const BoardComponent = game.BoardComponent

  const handleEndMatch = () => {
    const result = onEndMatch()
    if (result) setSummary(result)
    setShowEndConfirm(false)
  }

  const statusBar = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-sm border border-white/30 dark:border-gray-700/40">
          <span className="text-lg">{game.icon}</span>
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{game.name}</div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
              Lượt {match.round}{match.baseBet > 0 ? ` · ${(match.baseBet / 1000)}k` : ''}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-1.5">
        <button onClick={onUndo} disabled={!canUndo} title="Undo"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/30 text-gray-500 dark:text-gray-400 shadow-sm disabled:opacity-20 disabled:shadow-none transition-all touch-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 0 1 0 10H9" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l4-4m-4 4l4 4" />
          </svg>
        </button>
        <button onClick={onRedo} disabled={!canRedo} title="Redo"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/30 text-gray-500 dark:text-gray-400 shadow-sm disabled:opacity-20 disabled:shadow-none transition-all touch-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 0 0 0 10h4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10l-4-4m4 4l-4 4" />
          </svg>
        </button>
        {/* Log toggle - mobile only */}
        <button onClick={() => setShowLog(!showLog)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl border shadow-sm transition-all touch-bounce ${
            showLog
              ? 'bg-purple-500 border-purple-500 text-white shadow-purple-500/30'
              : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/80 text-gray-500 dark:text-gray-400'
          }`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </button>
        <button onClick={() => setShowEndConfirm(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-500 shadow-sm transition-all touch-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )

  const logCount = match.logs.filter(l => l.action === 'Win' || l.action === 'Instant Win' || l.action === 'Win Pot').length

  return (
    <>
      {/* Desktop: board + optional log panel side by side */}
      <div className="hidden lg:block animate-fade-in">
        <div className="mb-4">{statusBar}</div>
        <div className="flex gap-6 items-start">
          <div className={`${showLog ? 'flex-1' : 'w-full'} space-y-4 overflow-visible min-w-0`}>
            <BoardComponent
              players={match.players}
              onAction={onAction}
              onViewPlayer={setViewingPlayer}
              onResetStreak={onResetStreak}
              onToggleDisabled={onToggleDisabled}
              onAddPlayer={onAddPlayer}
              baseBet={match.baseBet}
              disabled={!match.active}
              match={match}
            />
          </div>
          {showLog && (
            <div className="w-80 shrink-0 sticky top-4 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col max-h-[80vh] animate-slide-in-right">
              <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  Lịch sử ({logCount} ván)
                </h3>
                <button onClick={() => setShowLog(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 touch-bounce text-xs">
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <LogPanel logs={match.logs} gameName={game.name} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: single column */}
      <div className="lg:hidden space-y-4 animate-fade-in">
        {statusBar}

        <BoardComponent
          players={match.players}
          onAction={onAction}
          onViewPlayer={setViewingPlayer}
          onResetStreak={onResetStreak}
          onToggleDisabled={onToggleDisabled}
          onAddPlayer={onAddPlayer}
          baseBet={match.baseBet}
          disabled={!match.active}
          match={match}
        />

        {showLog && (
          <div className="animate-slide-up">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/40 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Lịch sử ({logCount} ván)
              </h3>
              <LogPanel logs={match.logs} gameName={game.name} />
            </div>
          </div>
        )}
      </div>

      {/* Modals (shared) */}
      {showEndConfirm && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center animate-fade-in">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 w-full sm:max-w-sm space-y-4 animate-slide-up border-t border-white/30 dark:border-gray-700/40">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto sm:hidden" />
            <div className="text-center">
              <span className="text-3xl">🏁</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">Kết thúc ván?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kết quả sẽ được lưu vào lịch sử</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowEndConfirm(false)} className="py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold transition-colors touch-bounce">
                Hủy
              </button>
              <button onClick={handleEndMatch} className="py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold shadow-lg shadow-red-500/30 transition-all touch-bounce">
                Kết thúc
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingPlayer && (
        <PlayerHistory
          player={match.players.find(p => p.id === viewingPlayer)}
          logs={match.logs}
          gameId={match.gameId}
          onClose={() => setViewingPlayer(null)}
        />
      )}

      <SummaryModal summary={summary} onClose={() => setSummary(null)} />
    </>
  )
}
