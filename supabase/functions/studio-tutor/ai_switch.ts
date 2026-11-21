// The AI switch: the owner turns each app's AI on or off in CDM Partners > Admin > App addresses and AI.
// When it is off, AI functions answer with a short message pointing people to WhatsApp instead of calling the AI.
// If Partners cannot be reached, the AI stays on (the switch never breaks an app).
const LINKS = 'https://uopvnuzjktebdsavwgbn.supabase.co/functions/v1/app-links'
export const WHATSAPP = 'https://wa.me/2348064068800'
export const AI_OFF_MESSAGE = 'Our AI assistant is switched off at the moment. Please chat with us on WhatsApp instead: ' + WHATSAPP + ' (0806 406 8800).'
let cache: { at: number; off: string[] } | null = null

export async function aiOff(app: string): Promise<boolean> {
  if (!cache || Date.now() - cache.at > 60_000) {
    try {
      const r = await fetch(LINKS, { signal: AbortSignal.timeout(2500) })
      const j = r.ok ? await r.json() : null
      const apps = Array.isArray(j?.apps) ? j.apps : null
      cache = { at: Date.now(), off: apps ? apps.filter((a: { ai_on?: boolean }) => a?.ai_on === false).map((a: { id: string }) => a.id) : cache?.off ?? [] }
    } catch {
      cache = { at: Date.now(), off: cache?.off ?? [] }
    }
  }
  return cache.off.includes(app)
}

export function aiOffResponse(headers: Record<string, string>): Response {
  return new Response(JSON.stringify({ error: AI_OFF_MESSAGE, reply: AI_OFF_MESSAGE, answer: AI_OFF_MESSAGE, ai_off: true, whatsapp: WHATSAPP }), {
    status: 200, headers: { ...headers, 'Content-Type': 'application/json' },
  })
}
