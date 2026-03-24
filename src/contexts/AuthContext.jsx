import { createContext, useState, useEffect } from 'react'
import { getSession, getProfile, onAuthStateChange, signIn as authSignIn, signOut as authSignOut } from '../services/auth'
import { supabase } from '../lib/supabase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Timeout: if Supabase doesn't respond in 3s, continue without auth
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 3000)

    // Get initial session
    getSession()
      .then(async (session) => {
        const u = session?.user || null
        setUser(u)
        if (u) {
          try {
            const p = await getProfile(u.id)
            setProfile(p)
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timeout)
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (_event, session) => {
      const u = session?.user || null
      setUser(u)
      if (u) {
        try {
          const p = await getProfile(u.id)
          setProfile(p)
        } catch {}
      } else {
        setProfile(null)
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    const data = await authSignIn(email, password)
    const u = data?.user || null
    setUser(u)
    if (u) {
      try {
        const p = await getProfile(u.id)
        setProfile(p)
      } catch {}
    }
    return data
  }

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    try { await authSignOut() } catch {}
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isLoggedIn: !!user,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
