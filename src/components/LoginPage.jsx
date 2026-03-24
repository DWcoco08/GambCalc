import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function LoginPage() {
  const { signIn, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already logged in, redirect
  if (isLoggedIn) {
    navigate('/game/catte', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/game/catte', { replace: true })
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email hoặc mật khẩu không đúng'
        : err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center animate-fade-in z-10 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 space-y-6 border border-white/30 dark:border-gray-700/40">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-purple-500/30 mb-3">
              🎴
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Đăng nhập
            </h2>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 font-medium">
              GambCalc - Card Game Calculator
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs font-semibold animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-purple-500/30 transition-all touch-bounce disabled:opacity-60"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
            Liên hệ admin để nhận tài khoản
          </p>
        </div>

        {/* Skip login */}
        <button
          onClick={() => navigate('/game/catte', { replace: true })}
          className="w-full mt-4 py-3 text-gray-400 dark:text-gray-500 text-sm font-medium touch-bounce hover:text-purple-500 transition-colors"
        >
          Dùng không cần đăng nhập →
        </button>
      </div>
    </div>
  )
}
