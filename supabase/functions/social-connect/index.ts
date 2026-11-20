// Supabase Edge Function: social-connect (connect Facebook Pages, Instagram, LinkedIn and X to a CDM Social workspace)
//   POST { action: 'start', workspace, platform, return_to } (signed in, owner or approver) -> { url } to approve on the network
//   GET  /social-connect/callback?code&state   the network sends the person back here; tokens go into Vault
// Deploy with "Verify JWT" OFF (the callback comes from the network; "start" checks the sign-in itself).
// Secrets: META_APP_ID, META_APP_SECRET, LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, X_CLIENT_ID, X_CLIENT_SECRET.
// Optional: META_GRAPH_VERSION (default v23.0).
import { createClient } from 'npm:@supabase/supabase-js@2'
import { authorizeUrl, PLATFORMS, pkceChallenge, randomString, safeReturn, UUID, type Platform } from '../_shared/social.ts'

const env = (k: string) => Deno.env.get(k) ?? ''
const GRAPH = env('META_GRAPH_VERSION') || 'v23.0'
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const back = (to: string, q: Record<string, string>) => {
  const u = new URL(to)
  for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v)
  return new Response(null, { status: 302, headers: { Location: u.toString(), 'Cache-Control': 'no-store' } })
}
const configured: Record<Platform, () => boolean> = {
  facebook: () => !!env('META_APP_ID') && !!env('META_APP_SECRET'), instagram: () => !!env('META_APP_ID') && !!env('META_APP_SECRET'),
  linkedin: () => !!env('LINKEDIN_CLIENT_ID') && !!env('LINKEDIN_CLIENT_SECRET'), x: () => !!env('X_CLIENT_ID') && !!env('X_CLIENT_SECRET'),
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const base = env('SUPABASE_URL')
  const redirect = `${base}/functions/v1/social-connect/callback`
  const admin = createClient(base, env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })
  const u = new URL(req.url)

  if (req.method === 'GET' && u.pathname.replace(/\/+$/, '').endsWith('/callback')) {
    const state = u.searchParams.get('state') ?? ''
    const { data: st } = await admin.from('sm_oauth').select('*').eq('state', state).maybeSingle()
    if (!st) return back(safeReturn(null), { error: 'The connection link expired. Please try again.' })
    await admin.from('sm_oauth').delete().eq('state', state)
    const to = safeReturn(st.return_to)
    if (Date.now() - new Date(st.created_at).getTime() > 15 * 60_000) return back(to, { error: 'The connection took too long. Please try again.' })
    const code = u.searchParams.get('code')
    if (!code) return back(to, { error: u.searchParams.get('error_description') ?? 'You did not approve the connection.' })
    try {
      const save = (platform: string, id: string, name: string, token: string, refresh: string | null, expires: string | null) =>
        admin.rpc('sm_save_account', { p_ws: st.workspace, p_user: st.user_id, p_platform: platform, p_external: id, p_name: name, p_token: token, p_refresh: refresh, p_expires: expires })
      let n = 0
      if (st.platform === 'facebook' || st.platform === 'instagram') {
        const t1 = await (await fetch(`https://graph.facebook.com/${GRAPH}/oauth/access_token?${new URLSearchParams({ client_id: env('META_APP_ID'), client_secret: env('META_APP_SECRET'), redirect_uri: redirect, code })}`)).json()
        if (!t1.access_token) throw new Error(t1.error?.message ?? 'Meta did not give a token')
        const t2 = await (await fetch(`https://graph.facebook.com/${GRAPH}/oauth/access_token?${new URLSearchParams({ grant_type: 'fb_exchange_token', client_id: env('META_APP_ID'), client_secret: env('META_APP_SECRET'), fb_exchange_token: t1.access_token })}`)).json()
        const userToken = t2.access_token ?? t1.access_token
        // Page tokens made from a long-lived user token do not expire
        const pages = await (await fetch(`https://graph.facebook.com/${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&limit=50&access_token=${encodeURIComponent(userToken)}`)).json()
        for (const p of pages.data ?? []) {
          if (!p.access_token) continue
          await save('facebook', String(p.id), String(p.name ?? 'Facebook Page'), p.access_token, null, null); n++
          if (p.instagram_business_account?.id) { await save('instagram', String(p.instagram_business_account.id), '@' + (p.instagram_business_account.username ?? 'instagram'), p.access_token, null, null); n++ }
        }
        if (!n) return back(to, { error: 'No Facebook Pages were shared. Choose your Page (and its Instagram) when Facebook asks.' })
      } else if (st.platform === 'linkedin') {
        const t = await (await fetch('https://www.linkedin.com/oauth/v2/accessToken', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirect, client_id: env('LINKEDIN_CLIENT_ID'), client_secret: env('LINKEDIN_CLIENT_SECRET') }) })).json()
        if (!t.access_token) throw new Error(t.error_description ?? 'LinkedIn did not give a token')
        const me = await (await fetch('https://api.linkedin.com/v2/userinfo', { headers: { Authorization: `Bearer ${t.access_token}` } })).json()
        if (!me.sub) throw new Error('LinkedIn did not share the profile')
        await save('linkedin', `urn:li:person:${me.sub}`, String(me.name ?? 'LinkedIn'), t.access_token, t.refresh_token ?? null, new Date(Date.now() + Number(t.expires_in ?? 5184000) * 1000).toISOString()); n++
      } else {
        const t = await (await fetch('https://api.x.com/2/oauth2/token', { method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${btoa(`${env('X_CLIENT_ID')}:${env('X_CLIENT_SECRET')}`)}` },
          body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirect, code_verifier: st.verifier ?? '', client_id: env('X_CLIENT_ID') }) })).json()
        if (!t.access_token) throw new Error(t.error_description ?? 'X did not give a token')
        const me = await (await fetch('https://api.x.com/2/users/me', { headers: { Authorization: `Bearer ${t.access_token}` } })).json()
        if (!me.data?.id) throw new Error('X did not share the account')
        await save('x', String(me.data.id), '@' + me.data.username, t.access_token, t.refresh_token ?? null, new Date(Date.now() + Number(t.expires_in ?? 7200) * 1000).toISOString()); n++
      }
      return back(to, { connected: String(n) })
    } catch (e) {
      console.error('social-connect callback', st.platform, (e as Error).message)
      return back(to, { error: 'The connection did not work. Please try again.' })
    }
  }

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    const { data: { user } } = token ? await admin.auth.getUser(token) : { data: { user: null } }
    if (!user) return json({ error: 'Please sign in again.' }, 401)
    const b = await req.json().catch(() => ({}))
    const platform = String(b.platform ?? '') as Platform
    if (b.action !== 'start' || !(PLATFORMS as readonly string[]).includes(platform)) return json({ error: 'Unknown request' }, 400)
    const ws = String(b.workspace ?? '')
    if (!UUID.test(ws)) return json({ error: 'Open a workspace first.' }, 400)
    const db = createClient(base, env('SUPABASE_ANON_KEY'), { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } })
    const { data: role } = await db.rpc('sm_role', { p_ws: ws })
    if (role !== 'owner' && role !== 'approver') return json({ error: 'Only the owner or an approver can connect accounts.' }, 403)
    if (!configured[platform]()) return json({ error: `${platform === 'x' ? 'X' : platform === 'linkedin' ? 'LinkedIn' : 'Facebook and Instagram'} is not set up yet. CDM is finishing the connection with the network.` })
    await admin.from('sm_oauth').delete().lt('created_at', new Date(Date.now() - 3600_000).toISOString())
    const state = randomString(24)
    const verifier = platform === 'x' ? randomString(48) : null
    const { error } = await admin.from('sm_oauth').insert({ state, workspace: ws, user_id: user.id, platform, verifier, return_to: safeReturn(b.return_to) })
    if (error) throw new Error(error.message)
    return json({ url: authorizeUrl(platform, { graph: GRAPH, metaAppId: env('META_APP_ID'), linkedinClientId: env('LINKEDIN_CLIENT_ID'), xClientId: env('X_CLIENT_ID'), redirect }, state, verifier ? await pkceChallenge(verifier) : undefined) })
  } catch (e) {
    console.error('social-connect', (e as Error).message)
    return json({ error: 'Something went wrong. Please try again.' })
  }
})
