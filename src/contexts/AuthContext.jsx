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

    // Get initial session
    getSession().then(async (session) => {
      const u = session?.user || null
      setUser(u)
      if (u) {
        const p = await getProfile(u.id)
        setProfile(p)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (_event, session) => {
      const u = session?.user || null
      setUser(u)
      if (u) {
        const p = await getProfile(u.id)
        setProfile(p)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const data = await authSignIn(email, password)
    return data
  }

  const signOut = async () => {
    await authSignOut()
    setUser(null)
    setProfile(null)
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
