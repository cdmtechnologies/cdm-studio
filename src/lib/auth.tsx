import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type Profile = { id: string; name: string | null; country: string | null; goal: string | null; level: string | null; premium_until: string | null; created_at: string }

type Auth = {
  session: Session | null
  profile: Profile | null
  premium: boolean
  ready: boolean
  refresh: () => Promise<void>
  askSignIn: (why?: string) => void
  signInAsk: string | null
  closeSignIn: () => void
}
const Ctx = createContext<Auth | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ready, setReady] = useState(false)
  const [signInAsk, setAsk] = useState<string | null>(null)

  const loadProfile = useCallback(async (s: Session | null) => {
    if (!s) { setProfile(null); return }
    const { data } = await supabase.from('profiles').select('id, name, country, goal, level, premium_until, created_at').eq('id', s.user.id).maybeSingle()
    setProfile((data as Profile) ?? null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => { setSession(data.session); await loadProfile(data.session); setReady(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); loadProfile(s); if (s) setAsk(null) })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const premium = !!profile?.premium_until && new Date(profile.premium_until) > new Date()
  return (
    <Ctx.Provider value={{ session, profile, premium, ready, refresh: () => loadProfile(session), askSignIn: (why) => setAsk(why || 'Sign in to save your work.'), signInAsk, closeSignIn: () => setAsk(null) }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth(): Auth {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth outside AuthProvider')
  return v
}
