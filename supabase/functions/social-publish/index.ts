// Supabase Edge Function: social-publish (posts approved CDM Social posts when their time comes)
//   POST { action: 'run' } with x-cron-secret (the 5-minute schedule)   -> posts everything approved and due
//   POST { action: 'now', post } signed in as owner/approver            -> runs at once (the post must already be approved)
// Only posts claimed by sm_claim_due are sent: approved, unchanged since approval, and due. X posts take credits from
// the workspace owner (X charges per post). Deploy with "Verify JWT" OFF.
// Secrets: X_CLIENT_ID and X_CLIENT_SECRET (to refresh X tokens). Optional META_GRAPH_VERSION (default v23.0).
import { createClient } from 'npm:@supabase/supabase-js@2'
import { linkedinBody, problem, UUID, xCredits, type Platform } from '../_shared/social.ts'

const env = (k: string) => Deno.env.get(k) ?? ''
const GRAPH = env('META_GRAPH_VERSION') || 'v23.0'
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret' }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
type Admin = ReturnType<typeof createClient>
type Post = { id: string; workspace: string; text: string; media: { url: string }[]; accounts: string[] }
type Account = { id: string; platform: Platform; external_id: string; name: string; expires_at: string | null }
const short = (e: unknown) => String((e as Error)?.message ?? e).slice(0, 300)

async function call(url: string, init: RequestInit) {
  const r = await fetch(url, { ...init, signal: AbortSignal.timeout(30_000) })
  const j = await r.json().catch(() => ({}))
  if (!r.ok || j.error) throw new Error(j.error?.message ?? j.detail ?? j.message ?? `${r.status}`)
  return j
}

async function xToken(a: Admin, acc: Account): Promise<string> {
  const { data } = await a.rpc('sm_account_token', { p_account: acc.id })
  const t = data?.[0]
  if (!t?.token) throw new Error('Reconnect this account')
  if (!acc.expires_at || new Date(acc.expires_at).getTime() > Date.now() + 120_000) return t.token
  if (!t.refresh) throw new Error('Reconnect this account')
  const r = await (await fetch('https://api.x.com/2/oauth2/token', { method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${btoa(`${env('X_CLIENT_ID')}:${env('X_CLIENT_SECRET')}`)}` },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: t.refresh, client_id: env('X_CLIENT_ID') }) })).json()
  if (!r.access_token) throw new Error('Reconnect this account')
  const { data: ws } = await a.from('sm_accounts').select('workspace, connected_by').eq('id', acc.id).single()
  await a.rpc('sm_save_account', { p_ws: ws!.workspace, p_user: ws!.connected_by, p_platform: 'x', p_external: acc.external_id, p_name: acc.name, p_token: r.access_token, p_refresh: r.refresh_token ?? t.refresh, p_expires: new Date(Date.now() + Number(r.expires_in ?? 7200) * 1000).toISOString() })
  return r.access_token
}

async function sendOne(a: Admin, post: Post, acc: Account, owner: string): Promise<{ id: string; url: string | null }> {
  const why = problem(acc.platform, post.text, post.media)
  if (why) throw new Error(why)
  if (acc.platform === 'x') {
    const { data: s } = await a.from('settings').select('x_post_credits, x_link_post_credits').single()
    const cost = xCredits(post.text, s as { x_post_credits: number; x_link_post_credits: number })
    if (cost > 0) {
      const { error } = await a.rpc('wallet_move', { p_user: owner, p_wallet: 'credits', p_change: -cost, p_reason: 'social_post', p_ref: 'X post' })
      if (error) throw new Error('Not enough credits for X (the workspace owner pays per post)')
    }
    const token = await xToken(a, acc)
    try {
      const j = await call('https://api.x.com/2/tweets', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: post.text }) })
      return { id: j.data.id, url: `https://x.com/i/web/status/${j.data.id}` }
    } catch (e) {
      if (cost > 0) await a.rpc('wallet_move', { p_user: owner, p_wallet: 'credits', p_change: cost, p_reason: 'refund', p_ref: 'X post failed' })
      throw e
    }
  }
  const { data } = await a.rpc('sm_account_token', { p_account: acc.id })
  const token = data?.[0]?.token
  if (!token) throw new Error('Reconnect this account')
  if (acc.platform === 'facebook') {
    const g = `https://graph.facebook.com/${GRAPH}/${acc.external_id}`
    const j = post.media.length
      ? await call(`${g}/photos`, { method: 'POST', body: new URLSearchParams({ url: post.media[0].url, caption: post.text, access_token: token }) })
      : await call(`${g}/feed`, { method: 'POST', body: new URLSearchParams({ message: post.text, access_token: token }) })
    const id = String(j.post_id ?? j.id)
    return { id, url: `https://www.facebook.com/${id}` }
  }
  if (acc.platform === 'instagram') {
    const g = `https://graph.facebook.com/${GRAPH}/${acc.external_id}`
    const c = await call(`${g}/media`, { method: 'POST', body: new URLSearchParams({ image_url: post.media[0].url, caption: post.text, access_token: token }) })
    const p = await call(`${g}/media_publish`, { method: 'POST', body: new URLSearchParams({ creation_id: c.id, access_token: token }) })
    return { id: String(p.id), url: null }
  }
  const r = await fetch('https://api.linkedin.com/v2/ugcPosts', { method: 'POST', signal: AbortSignal.timeout(30_000),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' }, body: JSON.stringify(linkedinBody(acc.external_id, post.text)) })
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message ?? `LinkedIn ${r.status}`)
  const id = r.headers.get('x-restli-id') ?? ''
  return { id, url: id ? `https://www.linkedin.com/feed/update/${id}` : null }
}

async function run(a: Admin) {
  const { data: posts, error } = await a.rpc('sm_claim_due', { p_limit: 20 })
  if (error) throw new Error(error.message)
  let sent = 0
  for (const post of (posts ?? []) as Post[]) {
    const { data: w } = await a.from('sm_workspaces').select('owner').eq('id', post.workspace).single()
    const { data: accs } = await a.from('sm_accounts').select('id, platform, external_id, name, expires_at').eq('workspace', post.workspace).in('id', post.accounts)
    let ok = 0, bad = 0
    for (const acc of (accs ?? []) as Account[]) {
      try {
        const r = await sendOne(a, post, acc, w!.owner)
        await a.from('sm_results').insert({ post: post.id, account: acc.id, platform: acc.platform, ok: true, external_id: r.id, url: r.url }); ok++
      } catch (e) {
        const msg = short(e)
        await a.from('sm_results').insert({ post: post.id, account: acc.id, platform: acc.platform, ok: false, error: msg }); bad++
        if (/reconnect|expired|session|OAuth/i.test(msg)) await a.from('sm_accounts').update({ status: 'expired', last_error: msg }).eq('id', acc.id)
      }
    }
    await a.from('sm_posts').update({ status: bad === 0 && ok > 0 ? 'posted' : ok > 0 ? 'partly' : 'failed' }).eq('id', post.id)
    sent += ok
  }
  return { posts: (posts ?? []).length, sent }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const base = env('SUPABASE_URL')
  const admin = createClient(base, env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })
  try {
    const cron = req.headers.get('x-cron-secret')
    if (cron !== null) {
      const { data: ok } = await admin.rpc('sm_cron_ok', { p_secret: cron })
      if (!ok) return json({ error: 'Forbidden' }, 401)
      return json(await run(admin))
    }
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    const { data: { user } } = token ? await admin.auth.getUser(token) : { data: { user: null } }
    if (!user) return json({ error: 'Please sign in again.' }, 401)
    const b = await req.json().catch(() => ({}))
    if (b.action !== 'now' || !UUID.test(String(b.post ?? ''))) return json({ error: 'Unknown request' }, 400)
    const db = createClient(base, env('SUPABASE_ANON_KEY'), { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } })
    const { data: p } = await db.from('sm_posts').select('workspace, status').eq('id', b.post).maybeSingle()
    if (!p) return json({ error: 'Post not found.' }, 404)
    const { data: role } = await db.rpc('sm_role', { p_ws: p.workspace })
    if (role !== 'owner' && role !== 'approver') return json({ error: 'Only the owner or an approver can post.' }, 403)
    if (p.status !== 'approved') return json({ error: 'Approve the post first.' })
    return json(await run(admin))
  } catch (e) {
    console.error('social-publish', short(e))
    return json({ error: 'Something went wrong while posting.' })
  }
})
