import { supabase } from '../lib/supabase'

export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase chưa được cấu hình')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getProfile(userId) {
  if (!supabase) return null
  const { data } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .single()
  return data
}

export function onAuthStateChange(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
  return supabase.auth.onAuthStateChange(callback)
}
