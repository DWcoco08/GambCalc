import { supabase } from '../lib/supabase'

export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase chưa được cấu hình')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  // Always clear local auth state first
  try {
    // Clear Supabase auth tokens from localStorage
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('sb-') && key.includes('-auth-token')) {
        localStorage.removeItem(key)
      }
    })
  } catch {}

  // Then try Supabase signOut (non-blocking)
  if (supabase) {
    try { await supabase.auth.signOut() } catch {}
  }
}

export async function getSession() {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    return data.session
  } catch {
    return null
  }
}

export async function getProfile(userId) {
  if (!supabase) return null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()
    return data
  } catch {
    return null
  }
}

export function onAuthStateChange(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
  return supabase.auth.onAuthStateChange(callback)
}
