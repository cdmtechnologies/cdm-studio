// A page's studio.api(...) call, made by the app through the studio-proxy function (the secret never reaches the page).
import { supabase } from './supabase'
import type { ApiRequest } from './sandbox'

export async function proxyCall(req: ApiRequest, target: { slug: string } | { project_id: string }): Promise<unknown> {
  if (typeof req.name !== 'string' || typeof req.url !== 'string') return { ok: false, error: 'studio.api needs a key name and a url.' }
  const { data, error } = await supabase.functions.invoke('studio-proxy', {
    body: { ...target, secret: req.name, url: req.url, method: req.method, headers: req.headers ?? undefined, body: req.body ?? undefined },
  })
  if (error) {
    try { return await (error as { context?: Response }).context?.json() } catch { return { ok: false, error: 'The API call failed.' } }
  }
  return data
}
