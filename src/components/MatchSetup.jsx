import { useState } from 'react'
import { getGame } from '../games/registry'
import GameGuide from './GameGuide'

export default function MatchSetup({ gameId, onStart }) {
  const game = getGame(gameId)
  const [players, setPlayers] = useState(['', '', '', ''])
  const [baseBet, setBaseBet] = useState(game?.defaultBaseBet || 2000)
  const [showGuide, setShowGuide] = useState(false)

  if (!game) return null

  const addPlayer = () => {
    if (players.length < game.maxPlayers) setPlayers([...players, ''])
  }
  const removePlayer = (index) => {
    if (players.length > game.minPlayers) setPlayers(players.filter((_, i) => i !== index))
  }
  const updateName = (index, name) => {
    const updated = [...players]
    updated[index] = name
    setPlayers(updated)
  }
  const handleStart = () => {
    const validPlayers = players.map((p, i) => p.trim() || `Player ${i + 1}`)
    onStart(gameId, validPlayers, baseBet)
  }

  const setupForm = (
    <div className="bg-white dark:bg-gray-800/90 rounded-3xl shadow-xl p-5 lg:p-8 space-y-5 lg:space-y-6 border border-gray-100 dark:border-gray-700/80 animate-scale-in">
      {/* Header */}
      <div className="text-center pt-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-purple-500/30 mb-3">
          {game.icon}
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{game.name}</h2>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 font-medium">Tạo ván mới</p>
      </div>

      {/* Base bet */}
      <div>
        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Mức cược</label>
        <div className="grid grid-cols-4 gap-2">
          {[1000, 2000, 5000, 10000].map(bet => (
            <button
              key={bet}
              onClick={() => setBaseBet(bet)}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all touch-bounce ${
                baseBet === bet
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'bg-gray-100 dark:bg-gray-700/80 text-gray-500 dark:text-gray-400'
              }`}
            >
              {(bet / 1000)}k
            </button>
          ))}
        </div>
      </div>

      {/* Players */}
      <div>
        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          Người chơi ({players.length}/{game.maxPlayers})
        </label>
        <div className="space-y-2">
          {players.map((name, i) => (
            <div key={i} className="flex gap-2 animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="w-10 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-extrabold shadow-sm">
                {i + 1}
              </div>
              <input
                type="text"
                value={name}
                onChange={e => updateName(i, e.target.value)}
                placeholder={`Player ${i + 1}`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {players.length > game.minPlayers && (
                <button
                  onClick={() => removePlayer(i)}
                  className="w-11 h-11 flex items-center justify-center text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl transition-colors touch-bounce"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {players.length < game.maxPlayers && (
          <button
            onClick={addPlayer}
            className="mt-2 w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-600/50 rounded-xl text-sm font-semibold text-gray-400 transition-all touch-bounce hover:border-purple-400 hover:text-purple-500"
          >
            + Thêm người chơi
          </button>
        )}
      </div>

      {/* Start */}
      <button
        onClick={handleStart}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-purple-500/30 transition-all touch-bounce"
      >
        Bắt đầu ván 🎮
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop: 2 columns - setup left, guide right */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
        {setupForm}
        <GameGuide guide={game.guide} />
      </div>

      {/* Mobile: setup + collapsible guide */}
      <div className="lg:hidden space-y-3">
        {setupForm}
        {game.guide && (
          <div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="w-full py-3 bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-100 dark:border-gray-700/80 text-sm font-semibold text-gray-500 dark:text-gray-400 touch-bounce flex items-center justify-center gap-2"
            >
              📖 {showGuide ? 'Ẩn hướng dẫn' : 'Xem hướng dẫn chơi'}
              <span className={`transition-transform ${showGuide ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {showGuide && (
              <div className="mt-2 animate-slide-up">
                <GameGuide guide={game.guide} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
