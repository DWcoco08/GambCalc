import { useState } from 'react'
import { Routes, Route, Navigate, useParams, NavLink } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import GameContainer from './components/GameContainer'
import HistoryPage from './components/HistoryPage'
import LoginPage from './components/LoginPage'
import useMatch from './hooks/useMatch'
import useAuth from './hooks/useAuth'
import useDarkMode from './hooks/useDarkMode'
import { getAllGames } from './games/registry'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useDarkMode()
  const { match, startMatch, executeAction, undo, redo, canUndo, canRedo, endMatch, resetStreak } = useMatch()
  const { user, profile, isLoggedIn, signOut, loading: authLoading } = useAuth()
  const games = getAllGames()

  if (authLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-950 dark:to-purple-950/20">
        <div className="text-center animate-fade-in">
          <span className="text-4xl">🎴</span>
          <p className="text-gray-400 text-sm mt-2 font-medium">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[100dvh] relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/las-vegas-night-time-neon-lights-casinos.jpg)' }} />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative flex w-full h-full">
      {/* Sidebar - mobile overlay */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        profile={profile}
        isLoggedIn={isLoggedIn}
        onSignOut={signOut}
      />

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-black/25 backdrop-blur-sm border-r border-white/10 flex-col shrink-0">
        <div className="p-5 pb-4 border-b border-white/10">
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <span>🎴</span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">GambCalc</span>
          </h1>
          <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-1">
            Card Game Calculator
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">Games</p>
          {games.map(game => (
            <NavLink
              key={game.id}
              to={`/game/${game.id}`}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all
                ${isActive
                  ? 'bg-white/15 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <span className="text-xl">{game.icon}</span>
              {game.name}
            </NavLink>
          ))}
          <button disabled className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-white/25 w-full font-medium">
            <span className="text-xl w-6 h-6 flex items-center justify-center rounded-lg border-2 border-dashed border-white/20 text-xs">+</span>
            Thêm game...
          </button>
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <NavLink
            to="/history"
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all
              ${isActive
                ? 'bg-white/15 text-white shadow-lg'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            <span className="text-xl">📋</span>
            Lịch sử
          </NavLink>
          {/* Auth - desktop */}
          {isLoggedIn ? (
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                {(profile?.display_name || user.email)?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {profile?.display_name || user.email}
                </div>
                <button onClick={signOut} className="text-[10px] text-red-400 hover:text-red-500 font-semibold">
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all"
            >
              <span className="text-xl">👤</span>
              Đăng nhập
            </NavLink>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar - mobile */}
        <header className="lg:hidden sticky top-0 z-30 glass px-4 py-2.5 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white/70 transition-all touch-bounce"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎴 GambCalc
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-4 py-4 lg:px-8 lg:py-8 w-full">
            <Routes>
              <Route path="/" element={<Navigate to="/game/catte" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/game/:gameId"
                element={<GameRoute match={match} startMatch={startMatch} executeAction={executeAction} undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} endMatch={endMatch} resetStreak={resetStreak} />}
              />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </div>
        </main>
      </div>
      </div>
    </div>
  )
}

function GameRoute({ match, startMatch, executeAction, undo, redo, canUndo, canRedo, endMatch, resetStreak }) {
  const { gameId } = useParams()
  return (
    <GameContainer
      gameId={gameId}
      match={match}
      onStartMatch={startMatch}
      onAction={executeAction}
      onUndo={undo}
      onRedo={redo}
      canUndo={canUndo}
      canRedo={canRedo}
      onEndMatch={endMatch}
      onResetStreak={resetStreak}
    />
  )
}
