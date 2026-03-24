import { NavLink } from 'react-router-dom'
import { getAllGames } from '../games/registry'

export default function Sidebar({ isOpen, onClose, user, profile, isLoggedIn, onSignOut }) {
  const games = getAllGames()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50
        w-72 bg-black/30 backdrop-blur-sm border-r border-white/10
        flex flex-col transition-transform duration-300 ease-out shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-5 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold flex items-center gap-2">
              <span>🎴</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">GambCalc</span>
            </h1>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-colors touch-bounce"
            >
              ✕
            </button>
          </div>
          <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-1">
            Card Game Calculator
          </p>
        </div>

        {/* Games */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Games
          </p>
          {games.map(game => (
            <NavLink
              key={game.id}
              to={`/game/${game.id}`}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all touch-bounce
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

          <button
            disabled
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-white/25 w-full font-medium"
          >
            <span className="text-xl w-6 h-6 flex items-center justify-center rounded-lg border-2 border-dashed border-white/20 text-xs">+</span>
            Thêm game...
          </button>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <NavLink
            to="/history"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all touch-bounce
              ${isActive
                ? 'bg-white/15 text-white shadow-lg'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            <span className="text-xl">📋</span>
            Lịch sử
          </NavLink>

          {/* Auth */}
          {isLoggedIn ? (
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {(profile?.display_name || user?.email)?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {profile?.display_name || user?.email}
                </div>
                <button onClick={() => { onSignOut(); onClose() }} className="text-[10px] text-red-400 hover:text-red-500 font-semibold">
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all touch-bounce"
            >
              <span className="text-xl">👤</span>
              Đăng nhập
            </NavLink>
          )}
        </div>
      </aside>
    </>
  )
}
