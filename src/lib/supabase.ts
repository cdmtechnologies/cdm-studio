import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when the app was built without its Supabase settings (shows a friendly message instead of crashing). */
export const notConfigured = !url || !key

export const supabase = createClient(url || 'https://example.supabase.co', key || 'public-anon-key', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
})

export type FnError = Error & { limited?: boolean; premiumNeeded?: boolean; signIn?: boolean }

/** Calls an edge function and returns its JSON, turning errors into readable messages. */
export async function callFunction<T = Record<string, unknown>>(name: string, body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) {
    let msg = error.message
    let status = 0
    try {
      const res = (error as { context?: Response }).context
      status = res?.status ?? 0
      msg = (await res?.json())?.error || msg
    } catch { /* keep message */ }
    const e = new Error(status === 401 ? 'Please sign in again.' : msg || 'Something went wrong. Please try again.') as FnError
    e.signIn = status === 401
    throw e
  }
  if (data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error) {
    const e = new Error((data as { error: string }).error) as FnError
    e.limited = !!(data as { limited?: boolean }).limited
    e.premiumNeeded = !!(data as { premium_needed?: boolean }).premium_needed
    throw e
  }
  return data as T
}
