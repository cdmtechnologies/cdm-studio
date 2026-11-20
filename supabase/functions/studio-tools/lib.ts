// Pure helpers for studio-tools (unit tested): API key settings, the files of a hosted / installable app, and checks
// for site names, domains and Android details.

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const NAME = /^[A-Z][A-Z0-9_]{1,40}$/
export const NETLIFY_IP = '75.2.60.5'

export type SecretInput = { projectId: string; name: string; value: string; allowedUrl: string; placement: 'bearer' | 'header' | 'query'; field: string | null; publicUse: boolean; dailyLimit: number }

export function cleanSecretInput(raw: Record<string, unknown>): { input?: SecretInput; error?: string } {
  const projectId = String(raw.project_id ?? '')
  if (!UUID.test(projectId)) return { error: 'Open a project first.' }
  const name = String(raw.name ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_')
  if (!NAME.test(name)) return { error: 'Name the key with capital letters, numbers and _ (for example WEATHER_KEY).' }
  const value = typeof raw.value === 'string' ? raw.value.trim() : ''
  if (value.length > 4000 || /[\r\n]/.test(value)) return { error: 'That value does not look like an API key.' }
  let allowed: URL
  try { allowed = new URL(String(raw.allowed_url ?? '').trim()) } catch { return { error: 'Enter the API address it may call, like https://api.example.com/v1' } }
  if (allowed.protocol !== 'https:' || allowed.username || allowed.password || allowed.search || !/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(allowed.hostname)) {
    return { error: 'The API address must start with https:// and use a domain name, like https://api.example.com/v1' }
  }
  const allowedUrl = `https://${allowed.host}${allowed.pathname.replace(/\/+$/, '')}`
  const placement = raw.placement === 'header' || raw.placement === 'query' ? raw.placement : 'bearer'
  const field = placement === 'bearer' ? null : String(raw.field ?? '').trim() || (placement === 'header' ? 'x-api-key' : 'key')
  if (field && !/^[A-Za-z0-9_-]{1,60}$/.test(field)) return { error: 'The header or parameter name can only use letters, numbers, - and _.' }
  if (placement === 'header' && field && /^(host|cookie|content-length|connection|transfer-encoding)$/i.test(field)) return { error: 'That header cannot be used.' }
  const dailyLimit = Math.min(100000, Math.max(1, Math.round(Number(raw.daily_limit) || 500)))
  return { input: { projectId, name, value, allowedUrl, placement, field, publicUse: raw.public_use === true, dailyLimit } }
}

/** A Netlify site name: lower case letters, numbers and dashes. */
export function siteName(raw: unknown, title: string): string {
  const base = String(raw || title || 'my-studio-app').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
  return base.length >= 3 ? base : `studio-${base || 'app'}`
}

export function cleanDomain(raw: unknown): string | null {
  const d = String(raw ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  if (!d) return null
  return /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(d) && d.length <= 200 && !/(netlify\.app|github\.io|supabase\.co)$/.test(d) ? d : null
}

/** What to add at the domain company (registrar) so the domain points at the site. */
export function dnsSteps(domain: string, netlifyHost: string): { type: string; name: string; value: string }[] {
  const parts = domain.split('.')
  const apex = parts.length === 2 || /\.(com|org|net|gov|edu|co|ac|sch)\.[a-z]{2}$/.test(domain) && parts.length === 3
  return apex
    ? [{ type: 'A', name: '@', value: NETLIFY_IP }, { type: 'CNAME', name: 'www', value: netlifyHost }]
    : [{ type: 'CNAME', name: parts[0], value: netlifyHost }]
}

export const cleanPackage = (raw: unknown) => {
  const p = String(raw ?? '').trim().toLowerCase()
  return /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(p) && p.length <= 150 ? p : null
}
export const cleanSha256 = (raw: unknown) => {
  const s = String(raw ?? '').trim().toUpperCase().replace(/\s+/g, '')
  return /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(s) ? s : null
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

/** The small script a hosted page uses to call its API keys through CDM Studio (published projects only). */
export function apiHelper(proxyUrl: string, slug: string | null): string {
  return `<script>/* CDM Studio: API keys stay on CDM Studio's server */
window.studio=window.studio||{};window.studio.api=async function(name,o){o=o||{};
${slug ? `try{var r=await fetch(${JSON.stringify(proxyUrl)},{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({slug:${JSON.stringify(slug)},secret:name,url:o.url,method:o.method||'GET',headers:o.headers,body:o.body})});return await r.json()}catch(e){return{ok:false,error:'Could not reach the API.'}}`
    : `return{ok:false,error:'Publish this project on CDM Studio to use its API keys.'}`}};<\/script>`
}

export type SiteFiles = Record<string, string | Uint8Array>
export type SiteOptions = { title: string; html: string; slug: string | null; proxyUrl: string; colour?: string; icons?: { s192?: Uint8Array; s512?: Uint8Array }; android?: { package: string; sha256: string } | null }

/** Every file of the hosted app: the page (with install support), manifest, offline worker, icons, Android link file. */
export function siteFiles(o: SiteOptions): SiteFiles {
  const colour = /^#[0-9a-f]{6}$/i.test(o.colour ?? '') ? o.colour! : '#6d28d9'
  const name = o.title.slice(0, 45) || 'My app'
  const head = `<link rel="manifest" href="./manifest.webmanifest"><meta name="theme-color" content="${colour}"><link rel="apple-touch-icon" href="./icon-192.png">`
  const tail = `${apiHelper(o.proxyUrl, o.slug)}<script>if('serviceWorker' in navigator){addEventListener('load',function(){navigator.serviceWorker.register('./sw.js').catch(function(){})})}<\/script>`
  let html = o.html
  html = /<\/head>/i.test(html) ? html.replace(/<\/head>/i, `${head}</head>`) : head + html
  // the helper goes first in <head> so the page's own scripts can use studio.api straight away
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + tail) : tail + html
  if (!/<title>/i.test(html)) html = html.replace(/<\/head>/i, `<title>${esc(name)}</title></head>`)
  const files: SiteFiles = {
    '/index.html': html,
    '/manifest.webmanifest': JSON.stringify({
      name, short_name: name.slice(0, 12), start_url: './', scope: './', display: 'standalone', background_color: '#ffffff', theme_color: colour,
      icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
    }, null, 2),
    '/sw.js': `// Works offline after the first visit: network first, then the saved copy.
const C='studio-${Date.now().toString(36)}';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'])).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});
`,
    '/_headers': `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: interest-cohort=()\n/.well-known/assetlinks.json\n  Content-Type: application/json\n  Access-Control-Allow-Origin: *\n`,
  }
  if (o.icons?.s192) files['/icon-192.png'] = o.icons.s192
  if (o.icons?.s512) files['/icon-512.png'] = o.icons.s512
  if (o.android) {
    files['/.well-known/assetlinks.json'] = JSON.stringify([{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: o.android.package, sha256_cert_fingerprints: [o.android.sha256] } }], null, 2)
  }
  return files
}

/** A PNG icon sent by the browser (drawn on a canvas): checks the PNG signature and size. */
export function pngFromBase64(raw: unknown, maxBytes = 400_000): Uint8Array | null {
  if (typeof raw !== 'string' || raw.length > maxBytes * 1.4) return null
  try {
    const bin = atob(raw.replace(/^data:image\/png;base64,/, ''))
    const out = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
    return sig.every((b, i) => out[i] === b) && out.length <= maxBytes ? out : null
  } catch { return null }
}
