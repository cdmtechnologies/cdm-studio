// Lesson progress. Works without an account (kept in this browser); after sign-in it is saved to the account
// and what was done before signing in is added to it.
import { supabase } from './supabase'

const KEY = 'cdm-studio-progress-v1'
export type Done = Record<string, string> // lesson id -> ISO date

export function localDone(): Done {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}')
    return v && typeof v === 'object' ? v : {}
  } catch { return {} }
}
function saveLocal(d: Done) { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch { /* private mode */ } }

export function mergeDone(a: Done, b: Done): Done {
  const out: Done = { ...a }
  for (const [k, v] of Object.entries(b)) if (!out[k] || v < out[k]) out[k] = v
  return out
}

export async function loadDone(userId: string | null): Promise<Done> {
  const local = localDone()
  if (!userId) return local
  const { data } = await supabase.from('progress').select('lesson_id, done_at').eq('user_id', userId)
  const remote: Done = Object.fromEntries((data ?? []).map((r: { lesson_id: string; done_at: string }) => [r.lesson_id, r.done_at]))
  const missing = Object.keys(local).filter((k) => !remote[k])
  if (missing.length) await supabase.from('progress').upsert(missing.map((id) => ({ user_id: userId, lesson_id: id, done_at: local[id] })), { onConflict: 'user_id,lesson_id', ignoreDuplicates: true })
  const all = mergeDone(remote, local)
  saveLocal(all)
  return all
}

export async function markDone(userId: string | null, lessonId: string, code?: string): Promise<Done> {
  const d = { ...localDone(), [lessonId]: localDone()[lessonId] || new Date().toISOString() }
  saveLocal(d)
  if (userId) await supabase.from('progress').upsert({ user_id: userId, lesson_id: lessonId, code: code?.slice(0, 100000) ?? null }, { onConflict: 'user_id,lesson_id' })
  return d
}

const CODE = (id: string) => `cdm-studio-code-${id}`
export const savedCode = (id: string) => { try { return localStorage.getItem(CODE(id)) } catch { return null } }
export const keepCode = (id: string, code: string) => { try { localStorage.setItem(CODE(id), code.slice(0, 100000)) } catch { /* full */ } }
export const dropCode = (id: string) => { try { localStorage.removeItem(CODE(id)) } catch { /* ignore */ } }
