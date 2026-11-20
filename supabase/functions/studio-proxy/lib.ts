// Pure helpers for studio-proxy (unit tested). Everything a page sends is checked here before any call is made.

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const NAME = /^[A-Z][A-Z0-9_]{1,40}$/
export const SLUG = /^[a-z0-9]{10}$/
export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const
export const MAX_BODY = 200_000
export const MAX_REPLY = 2_000_000

export type ProxyInput = { slug: string | null; projectId: string | null; name: string; url: URL; method: string; headers: Record<string, string>; body: string | null }

/** Host names that must never be called: this machine, private networks, cloud metadata, bare IP addresses. */
export function blockedHost(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, '')
  if (!h.includes('.')) return true
  if (/^\[|^[0-9.]+$|^[0-9a-f:]+$/.test(h)) return true // IP addresses (v4 and v6)
  return /(^|\.)(localhost|local|internal|intranet|lan|home|corp|localdomain)$/.test(h) || h === 'metadata.google.internal' || h.endsWith('.supabase.internal')
}

/** True when the url is inside the allowed address: same host and port, path under the allowed path. */
export function underAllowed(url: URL, allowed: string): boolean {
  let a: URL
  try { a = new URL(allowed) } catch { return false }
  if (url.protocol !== 'https:' || a.protocol !== 'https:') return false
  if (url.username || url.password) return false
  if (url.host.toLowerCase() !== a.host.toLowerCase()) return false
  const base = a.pathname.replace(/\/+$/, '')
  let path: string
  try { path = decodeURIComponent(url.pathname) } catch { return false }
  if (path.includes('/../') || path.endsWith('/..')) return false
  return base === '' || url.pathname === base || url.pathname.startsWith(base + '/')
}

const SAFE_HEADER = /^(accept|content-type|accept-language|x-[a-z0-9-]{1,40})$/
const BLOCKED_X = /^x-(forwarded|real-ip|cdm|supabase|client-info)/

export function cleanProxyInput(raw: unknown): { input?: ProxyInput; error?: string } {
  const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const slug = typeof b.slug === 'string' && SLUG.test(b.slug) ? b.slug : null
  const projectId = typeof b.project_id === 'string' && UUID.test(b.project_id) ? b.project_id : null
  if (!slug && !projectId) return { error: 'Missing project.' }
  const name = typeof b.secret === 'string' ? b.secret.trim() : ''
  if (!NAME.test(name)) return { error: 'Unknown API key name.' }
  let url: URL
  try { url = new URL(String(b.url ?? '')) } catch { return { error: 'The address is not valid.' } }
  if (url.protocol !== 'https:') return { error: 'Only https:// addresses can be called.' }
  if (blockedHost(url.hostname)) return { error: 'That address cannot be called.' }
  url.hash = ''
  const method = String(b.method ?? 'GET').toUpperCase()
  if (!(METHODS as readonly string[]).includes(method)) return { error: 'That method is not allowed.' }
  const headers: Record<string, string> = {}
  if (b.headers && typeof b.headers === 'object' && !Array.isArray(b.headers)) {
    for (const [k, v] of Object.entries(b.headers as Record<string, unknown>).slice(0, 12)) {
      const key = k.toLowerCase().trim()
      if (!SAFE_HEADER.test(key) || BLOCKED_X.test(key) || typeof v !== 'string' || v.length > 500 || /[\r\n]/.test(v)) continue
      headers[key] = v
    }
  }
  let body: string | null = null
  if (b.body !== undefined && b.body !== null && method !== 'GET') {
    body = typeof b.body === 'string' ? b.body : JSON.stringify(b.body)
    if (body.length > MAX_BODY) return { error: 'The data sent is too big.' }
    if (typeof b.body !== 'string' && !headers['content-type']) headers['content-type'] = 'application/json'
  }
  return { input: { slug, projectId, name, url, method, headers, body } }
}

/** Puts the secret where the API expects it. */
export function withSecret(i: ProxyInput, value: string, placement: string, field: string | null): { url: URL; headers: Record<string, string> } {
  const url = new URL(i.url.toString())
  const headers = { ...i.headers }
  if (placement === 'query') url.searchParams.set(field || 'key', value)
  else if (placement === 'header') headers[(field || 'x-api-key').toLowerCase()] = value
  else headers['authorization'] = `Bearer ${value}`
  return { url, headers }
}

/** Takes the secret out of anything sent back, in case an API echoes it. */
export function scrub(text: string, secret: string): string {
  if (!secret || secret.length < 4) return text
  return text.split(secret).join('[hidden]')
}

export const REASONS: Record<string, string> = {
  project: 'This project cannot use API keys here.',
  name: 'That API key does not exist in this project. Add it under "API keys".',
  private: 'This API key is only for the editor. The owner can allow it on the published page.',
  limit: "This API key has reached today's limit. It starts again tomorrow.",
}
