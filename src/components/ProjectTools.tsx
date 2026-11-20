import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../lib/auth'
import { kindOf, shareUrl, type Project } from '../lib/builder'
import { go, href } from '../lib/router'
import { callFunction, supabase } from '../lib/supabase'
import { drawIcon, zip } from '../lib/zip'
import { Alert, Icon, Modal } from './ui'

type Tab = 'team' | 'keys' | 'host' | 'android' | 'sell' | 'transfer'
const TABS: [Tab, string, boolean][] = [['team', 'Team', false], ['keys', 'API keys', true], ['host', 'Own website', true], ['android', 'Play Store', true], ['sell', 'Sell', true], ['transfer', 'Transfer', true]]

/** Everything an owner does with a project besides building: team, API keys, hosting, Android app, selling, transfer. */
export default function ProjectTools({ project, role, onClose }: { project: Project; role: string; onClose: () => void }) {
  const owner = role === 'owner'
  const [tab, setTab] = useState<Tab>('team')
  return (
    <Modal open title="Project tools" onClose={onClose} wide>
      <div className="-mx-1 mb-4 flex gap-1 overflow-x-auto pb-1" role="tablist">
        {TABS.filter(([, , o]) => owner || !o).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`chip shrink-0 ${tab === k ? 'chip-on' : 'chip-off'}`}>{l}</button>
        ))}
      </div>
      {tab === 'team' && <Team project={project} owner={owner} />}
      {tab === 'keys' && <Keys project={project} />}
      {tab === 'host' && <Host project={project} />}
      {tab === 'android' && <Android project={project} />}
      {tab === 'sell' && <Sell project={project} />}
      {tab === 'transfer' && <Transfer project={project} />}
    </Modal>
  )
}

function useRun() {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  async function run(fn: () => Promise<string | void>) {
    setBusy(true); setMsg(null)
    try { const t = await fn(); if (t) setMsg({ ok: true, text: t }) } catch (e) { setMsg({ ok: false, text: (e as Error).message.replace(/^.*?ERROR:\s*/, '') }) } finally { setBusy(false) }
  }
  const note = msg && <Alert tone={msg.ok ? 'ok' : undefined}>{msg.text}</Alert>
  return { busy, run, note }
}
const rpc = async (fn: string, args: Record<string, unknown>) => { const { data, error } = await supabase.rpc(fn, args); if (error) throw new Error(error.message); return data }
const H = ({ children }: { children: ReactNode }) => <h3 className="mb-1 font-semibold">{children}</h3>
const P = ({ children }: { children: ReactNode }) => <p className="text-sm text-slate-600">{children}</p>

// ---------- team ----------
type Person = { user_id: string | null; name: string | null; email: string | null; role: string; invite_id: string | null }
function Team({ project, owner }: { project: Project; owner: boolean }) {
  const { session } = useAuth()
  const [people, setPeople] = useState<Person[]>([])
  const [email, setEmail] = useState('')
  const [as, setAs] = useState<'editor' | 'viewer'>('editor')
  const { busy, run, note } = useRun()
  const load = () => rpc('project_people', { p_project: project.id }).then((d) => setPeople((d as Person[]) ?? [])).catch(() => {})
  useEffect(() => { load() }, [project.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const link = `${location.origin}${location.pathname}#/account`
  return (
    <div className="space-y-4">
      <div><H>People on this project</H><P>Editors can change the page and use AI on it (AI uses their own free builds or credits). Viewers can only look. Only you can publish, sell, transfer or delete.</P></div>
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {people.map((x, i) => (
          <li key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate">{x.name || x.email || 'Member'}{x.email && x.name ? <span className="text-slate-500"> · {x.email}</span> : null}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize">{x.role}</span>
            {(owner && x.role !== 'owner') || (x.user_id && x.user_id === session?.user.id && x.role !== 'owner') ? (
              <button className="text-xs font-semibold text-red-700 hover:underline" disabled={busy} onClick={() => run(async () => { await rpc('remove_member', { p_project: project.id, p_user: x.user_id, p_invite: x.invite_id }); await load(); if (!owner) go('build') })}>{x.user_id === session?.user.id ? 'Leave' : 'Remove'}</button>
            ) : null}
          </li>
        ))}
      </ul>
      {owner && (
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); run(async () => { await rpc('invite_member', { p_project: project.id, p_email: email, p_role: as }); setEmail(''); await load(); return `Invitation saved. Ask them to sign in to CDM Studio with that email and open their account page to accept: ${link}` }) }}>
          <H>Invite someone</H>
          <div className="flex flex-wrap gap-2">
            <input className="input min-w-0 flex-1" type="email" required placeholder="their@email.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email to invite" />
            <select className="input w-32" value={as} onChange={(e) => setAs(e.target.value as 'editor' | 'viewer')} aria-label="Role"><option value="editor">Editor</option><option value="viewer">Viewer</option></select>
            <button className="btn btn-primary" disabled={busy}>Invite</button>
          </div>
        </form>
      )}
      {note}
    </div>
  )
}

// ---------- API keys ----------
type Secret = { id: string; name: string; allowed_url: string; placement: string; field: string | null; public_use: boolean; daily_limit: number; hint: string | null; used_count: number; used_day: string | null; last_used: string | null }
function Keys({ project }: { project: Project }) {
  const [list, setList] = useState<Secret[]>([])
  const [f, setF] = useState({ name: '', value: '', allowed_url: '', placement: 'bearer', field: '', public_use: false, daily_limit: 500 })
  const [editing, setEditing] = useState<string | null>(null)
  const { busy, run, note } = useRun()
  const load = () => supabase.from('project_secrets').select('id, name, allowed_url, placement, field, public_use, daily_limit, hint, used_count, used_day, last_used').eq('project_id', project.id).order('name').then(({ data }) => setList((data as Secret[]) ?? []))
  useEffect(() => { load() }, [project.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const today = new Date(Date.now() + 3600e3).toISOString().slice(0, 10)
  const edit = (s: Secret) => { setEditing(s.name); setF({ name: s.name, value: '', allowed_url: s.allowed_url, placement: s.placement, field: s.field ?? '', public_use: s.public_use, daily_limit: s.daily_limit }) }
  return (
    <div className="space-y-4">
      <div>
        <H>API keys, kept safe on our server</H>
        <P>Never paste an API key into your page: anyone can read a published page. Save it here and your page calls the API with <code className="rounded bg-slate-100 px-1">studio.api('NAME', {'{'} url {'}'})</code>. CDM Studio adds the key on its server, only for the one address you allow, and never shows it again. Ask the AI builder to "use my WEATHER_KEY to show today's weather" and it writes the call for you.</P>
      </div>
      {list.length > 0 && (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
          {list.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
              <span className="font-mono font-semibold">{s.name}</span>
              <span className="text-slate-500">…{s.hint} · {s.allowed_url}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{s.public_use ? 'Editor + published page' : 'Editor only'}</span>
              <span className="text-xs text-slate-500">{s.used_day === today ? s.used_count : 0}/{s.daily_limit} today</span>
              <span className="ml-auto flex gap-2">
                <button className="text-xs font-semibold text-violet-700 hover:underline" onClick={() => edit(s)}>Change</button>
                <button className="text-xs font-semibold text-red-700 hover:underline" disabled={busy} onClick={() => confirm(`Delete ${s.name}? Pages using it will stop working.`) && run(async () => { await callFunction('studio-tools', { action: 'secret_delete', project_id: project.id, name: s.name }); await load(); return 'Deleted.' })}>Delete</button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <form className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); run(async () => { await callFunction('studio-tools', { action: 'secret_save', project_id: project.id, ...f }); setF({ ...f, value: '' }); setEditing(null); await load(); return 'Saved. The value is encrypted and will not be shown again.' }) }}>
        <p className="font-semibold sm:col-span-2">{editing ? `Change ${editing}` : 'Add an API key'}</p>
        <label className="text-sm"><span className="label">Name (used in your code)</span><input className="input font-mono" required pattern="[A-Za-z][A-Za-z0-9_ -]{1,40}" disabled={!!editing} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value.toUpperCase().replace(/[\s-]+/g, '_') })} placeholder="WEATHER_KEY" /></label>
        <label className="text-sm"><span className="label">{editing ? 'New value (leave empty to keep)' : 'The key'}</span><input className="input font-mono" type="password" autoComplete="off" required={!editing} value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} placeholder="paste the key" /></label>
        <label className="text-sm sm:col-span-2"><span className="label">The only API address it may call</span><input className="input" required value={f.allowed_url} onChange={(e) => setF({ ...f, allowed_url: e.target.value })} placeholder="https://api.openweathermap.org/data/2.5" /></label>
        <label className="text-sm"><span className="label">How the API wants the key</span>
          <select className="input" value={f.placement} onChange={(e) => setF({ ...f, placement: e.target.value })}>
            <option value="bearer">Authorization: Bearer KEY</option><option value="header">A header (e.g. x-api-key)</option><option value="query">In the address (?key=…)</option>
          </select></label>
        {f.placement !== 'bearer' ? <label className="text-sm"><span className="label">{f.placement === 'header' ? 'Header name' : 'Parameter name'}</span><input className="input font-mono" value={f.field} onChange={(e) => setF({ ...f, field: e.target.value })} placeholder={f.placement === 'header' ? 'x-api-key' : 'appid'} /></label> : <span />}
        <label className="text-sm"><span className="label">Calls allowed a day</span><input className="input" type="number" min={1} max={100000} value={f.daily_limit} onChange={(e) => setF({ ...f, daily_limit: Number(e.target.value) })} /></label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" className="h-4 w-4 accent-violet-700" checked={f.public_use} onChange={(e) => setF({ ...f, public_use: e.target.checked })} /> Also allow it on the published page, own website and Android app (visitors can then use up the daily limit)</label>
        <div className="flex gap-2 sm:col-span-2"><button className="btn btn-primary" disabled={busy}>Save key</button>{editing && <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setF({ name: '', value: '', allowed_url: '', placement: 'bearer', field: '', public_use: false, daily_limit: 500 }) }}>Cancel</button>}</div>
      </form>
      {note}
    </div>
  )
}

// ---------- own website (Netlify), download ----------
type Hosting = { site_id: string; site_url: string; custom_domain: string | null; android_package: string | null; android_sha256: string | null; deployed_at: string }
function useHosting(id: string) {
  const [h, setH] = useState<Hosting | null | undefined>(undefined)
  const [netlify, setNetlify] = useState<string | null | undefined>(undefined)
  const load = async () => {
    const [{ data: a }, { data: b }] = await Promise.all([
      supabase.from('project_hosting').select('site_id, site_url, custom_domain, android_package, android_sha256, deployed_at').eq('project_id', id).maybeSingle(),
      supabase.from('user_tokens').select('account').eq('provider', 'netlify').maybeSingle(),
    ])
    setH((a as Hosting) ?? null); setNetlify(b ? String((b as { account: string | null }).account ?? 'connected') : null)
  }
  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  return { h, netlify, load }
}
async function icons(p: Project) {
  const label = kindOf(p.kind).emoji
  return { s192: await drawIcon(192, label, '#6d28d9'), s512: await drawIcon(512, label, '#6d28d9') }
}
async function deployNow(p: Project, siteName?: string) {
  return callFunction<{ site_url: string; api_ready: boolean }>('studio-tools', { action: 'deploy', project_id: p.id, site_name: siteName, icons: await icons(p) })
}

function Host({ project }: { project: Project }) {
  const { h, netlify, load } = useHosting(project.id)
  const [token, setToken] = useState('')
  const [site, setSite] = useState('')
  const [domain, setDomain] = useState('')
  const [dns, setDns] = useState<{ type: string; name: string; value: string }[] | null>(null)
  const { busy, run, note } = useRun()
  async function downloadZip() {
    const r = await callFunction<{ files: Record<string, { text?: string; base64?: string }> }>('studio-tools', { action: 'files', project_id: project.id, icons: await icons(project) })
    const files: Record<string, Uint8Array | string> = {}
    for (const [k, v] of Object.entries(r.files)) files[k] = v.text ?? Uint8Array.from(atob(v.base64 ?? ''), (c) => c.charCodeAt(0))
    const blob = new Blob([zip(files).buffer as ArrayBuffer], { type: 'application/zip' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${project.title.replace(/[^\w-]+/g, '-').slice(0, 40) || 'app'}.zip` })
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000)
    return 'Downloaded. Upload the files to any web host (Netlify Drop, GitHub Pages, cPanel): index.html is the start page.'
  }
  return (
    <div className="space-y-5">
      <div>
        <H>Where it lives now</H>
        <P>Published projects are hosted free on CDM Studio{project.slug ? <> at <a className="font-semibold text-violet-700 underline" href={shareUrl(project.slug)} target="_blank" rel="noreferrer">its share link</a></> : ' once you publish'}. You can also put it on your own website address (your own domain), or download it as files.</P>
      </div>
      <section className="space-y-2 rounded-xl border border-slate-200 p-3">
        <H>1. Put it on your own Netlify (free)</H>
        {netlify === null && (
          <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); run(async () => { const r = await callFunction<{ account: string | null }>('studio-tools', { action: 'netlify_connect', token }); setToken(''); await load(); return `Connected to Netlify${r.account ? ` (${r.account})` : ''}.` }) }}>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
              <li>Create a free account at <a className="underline" href="https://app.netlify.com/signup" target="_blank" rel="noreferrer">netlify.com</a>.</li>
              <li>Open <a className="underline" href="https://app.netlify.com/user/applications#personal-access-tokens" target="_blank" rel="noreferrer">User settings → Applications → Personal access tokens</a>, choose <b>New access token</b>, name it "CDM Studio", and copy it.</li>
              <li>Paste it here. It is encrypted on our server and never shown again; you can disconnect any time.</li>
            </ol>
            <div className="flex gap-2"><input className="input min-w-0 flex-1 font-mono" type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} placeholder="nfp_…" aria-label="Netlify token" /><button className="btn btn-primary" disabled={busy || token.length < 20}>Connect</button></div>
          </form>
        )}
        {netlify && (
          <div className="space-y-2">
            <p className="text-sm">Netlify connected: <b>{netlify}</b> · <button className="text-xs font-semibold text-red-700 hover:underline" onClick={() => run(async () => { await callFunction('studio-tools', { action: 'netlify_disconnect' }); await load(); return 'Disconnected. Your sites stay on Netlify.' })}>Disconnect</button></p>
            {h ? <p className="text-sm">Live at <a className="font-semibold text-violet-700 underline" href={h.custom_domain ? `https://${h.custom_domain}` : h.site_url} target="_blank" rel="noreferrer">{h.custom_domain ?? h.site_url}</a> · last update {new Date(h.deployed_at).toLocaleString()}</p>
              : <label className="block text-sm"><span className="label">Site name (becomes name.netlify.app)</span><input className="input" value={site} onChange={(e) => setSite(e.target.value)} placeholder={project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')} /></label>}
            <button className="btn btn-primary" disabled={busy} onClick={() => run(async () => { const r = await deployNow(project, site || undefined); await load(); return `${h ? 'Updated' : 'Live'} at ${r.site_url}. It installs like an app on phones and works offline.${r.api_ready ? '' : ' Publish the project on CDM Studio too if it uses API keys.'}` })}>{busy ? 'Uploading…' : h ? 'Update the live site with my latest version' : 'Put it online'}</button>
          </div>
        )}
      </section>
      {netlify && h && (
        <section className="space-y-2 rounded-xl border border-slate-200 p-3">
          <H>2. Use your own domain</H>
          <P>Buy a domain from any company (Whogohost, Qservers, Namecheap, GoDaddy…), then connect it here.</P>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); run(async () => { const r = await callFunction<{ domain: string; dns: { type: string; name: string; value: string }[] }>('studio-tools', { action: 'domain', project_id: project.id, domain }); setDns(r.dns); await load(); return `${r.domain} added. Now add the records below at your domain company.` }) }}>
            <input className="input min-w-0 flex-1" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder={h.custom_domain ?? 'mybakery.com'} aria-label="Your domain" /><button className="btn btn-primary" disabled={busy || !domain}>Connect</button>
          </form>
          {(dns || h.custom_domain) && (
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="mb-1 font-semibold">At your domain company, add these DNS records:</p>
              <table className="w-full text-left"><thead><tr><th>Type</th><th>Name</th><th>Value</th></tr></thead>
                <tbody>{(dns ?? (h.custom_domain ? (h.custom_domain.split('.').length === 2 ? [{ type: 'A', name: '@', value: '75.2.60.5' }, { type: 'CNAME', name: 'www', value: new URL(h.site_url).host }] : [{ type: 'CNAME', name: h.custom_domain.split('.')[0], value: new URL(h.site_url).host }]) : [])).map((r) => <tr key={r.type + r.name}><td>{r.type}</td><td className="font-mono">{r.name}</td><td className="font-mono">{r.value}</td></tr>)}</tbody>
              </table>
              <p className="mt-2 text-xs text-slate-500">Changes can take a few hours. Netlify then adds the secure https certificate by itself.</p>
            </div>
          )}
        </section>
      )}
      <section className="space-y-2 rounded-xl border border-slate-200 p-3">
        <H>Or download everything</H>
        <P>A .zip with the page, app icons, offline support and install file. Works on any host.</P>
        <button className="btn btn-ghost" disabled={busy} onClick={() => run(downloadZip)}><Icon.download /> Download .zip</button>
      </section>
      {note}
    </div>
  )
}

// ---------- Play Store ----------
function Android({ project }: { project: Project }) {
  const { h, load } = useHosting(project.id)
  const [pkg, setPkg] = useState('')
  const [sha, setSha] = useState('')
  const { busy, run, note } = useRun()
  useEffect(() => { if (h) { setPkg(h.android_package ?? ''); setSha(h.android_sha256 ?? '') } }, [h])
  const live = h ? (h.custom_domain ? `https://${h.custom_domain}` : h.site_url) : ''
  return (
    <div className="space-y-4">
      <div>
        <H>Publish on Google Play</H>
        <P>Your project becomes a real Android app (a "Trusted Web Activity") that opens your website full screen, with your icon, and updates whenever you update the site. You need a Google Play developer account (a one-time $25 fee paid to Google, in your own name).</P>
      </div>
      {!h ? <Alert tone="info">First put the app on your own website (the "Own website" tab). Play Store apps must open your own address.</Alert> : (
        <ol className="list-decimal space-y-3 pl-5 text-sm">
          <li>Open <a className="font-semibold text-violet-700 underline" href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(live)}`} target="_blank" rel="noreferrer">PWABuilder with your site</a> (free, made by Microsoft). Choose <b>Package for stores → Android → Generate</b> and download the zip. Keep the signing key file safe: you need it for every update.</li>
          <li>In that zip, open <b>assetlinks.json</b> (or the "next steps" page) and copy the <b>package name</b> and the <b>SHA-256 fingerprint</b> here:
            <form className="mt-2 grid gap-2 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); run(async () => { await callFunction('studio-tools', { action: 'android', project_id: project.id, package: pkg, sha256: sha }); await deployNow(project); await load(); return 'Linked. Your site now proves it owns the Android app, so it opens full screen without a browser bar.' }) }}>
              <input className="input font-mono" value={pkg} onChange={(e) => setPkg(e.target.value)} placeholder="com.yourname.appname" aria-label="Package name" />
              <input className="input font-mono text-xs" value={sha} onChange={(e) => setSha(e.target.value)} placeholder="AB:CD:EF:…" aria-label="SHA-256 fingerprint" />
              <button className="btn btn-primary sm:col-span-2" disabled={busy}>{busy ? 'Saving and updating the site…' : 'Link the app and update the site'}</button>
            </form>
          </li>
          <li>In the <a className="underline" href="https://play.google.com/console" target="_blank" rel="noreferrer">Google Play Console</a>, create an app, fill in the store listing (description, screenshots, privacy policy link), and upload the <b>.aab</b> file from PWABuilder under <b>Production → Create new release</b>.</li>
          <li>Google reviews new apps (often a few days). New personal developer accounts must first run a closed test with testers before going public; the Play Console shows exactly what is needed.</li>
        </ol>
      )}
      {note}
    </div>
  )
}

// ---------- sell ----------
function Sell({ project }: { project: Project }) {
  const [l, setL] = useState<{ price_credits: number; blurb: string; active: boolean; sales: number } | null | undefined>(undefined)
  const [price, setPrice] = useState(200)
  const [blurb, setBlurb] = useState('')
  const [pct, setPct] = useState(20)
  const { busy, run, note } = useRun()
  const load = () => supabase.from('listings').select('price_credits, blurb, active, sales').eq('project_id', project.id).maybeSingle().then(({ data }) => {
    setL(data as typeof l ?? null)
    if (data) { setPrice((data as { price_credits: number }).price_credits); setBlurb((data as { blurb: string }).blurb) }
  })
  useEffect(() => { load(); supabase.from('settings').select('market_commission_pct').maybeSingle().then(({ data }) => data && setPct(Number((data as { market_commission_pct: number }).market_commission_pct))) }, [project.id]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="space-y-4">
      <div>
        <H>Sell it in the CDM Studio marketplace</H>
        <P>Buyers try the published version, then pay in credits and get their own copy to change. You earn the price less {pct}% CDM commission, which you can turn into credits or have paid to your bank (see your account). You keep your project.</P>
      </div>
      {!project.published ? <Alert tone="info">Publish the project first, so buyers can try it.</Alert> : (
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); run(async () => { await rpc('list_for_sale', { p_project: project.id, p_price: price, p_blurb: blurb, p_active: true }); await load(); return 'Listed in the marketplace.' }) }}>
          <label className="block text-sm"><span className="label">Price in credits (1 credit = ₦10)</span><input className="input w-40" type="number" min={1} max={1000000} value={price} onChange={(e) => setPrice(Number(e.target.value))} /></label>
          <p className="text-xs text-slate-500">You receive about {Math.round(price * (100 - pct)) / 100} credits (₦{(price * (100 - pct) / 10).toLocaleString()}) per sale.</p>
          <label className="block text-sm"><span className="label">What buyers get</span><textarea className="input min-h-[80px]" maxLength={1000} value={blurb} onChange={(e) => setBlurb(e.target.value)} placeholder="A complete restaurant website with menu, WhatsApp ordering and opening hours. Change the name, prices and colours in minutes." /></label>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" disabled={busy}>{l ? 'Save' : 'List for sale'}</button>
            {l && <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => run(async () => { await rpc('list_for_sale', { p_project: project.id, p_price: price, p_blurb: blurb, p_active: !l.active }); await load(); return l.active ? 'Taken off the marketplace.' : 'Back on sale.' })}>{l.active ? 'Stop selling' : 'Sell again'}</button>}
            <a className="btn btn-ghost" href={href('market')}>See the marketplace</a>
          </div>
          {l && <p className="text-sm text-slate-600">{l.active ? 'On sale' : 'Not on sale'} · {l.sales} sold</p>}
        </form>
      )}
      {note}
    </div>
  )
}

// ---------- transfer ----------
function Transfer({ project }: { project: Project }) {
  const [t, setT] = useState<{ to_email: string } | null>(null)
  const [email, setEmail] = useState('')
  const [noteText, setNoteText] = useState('')
  const { busy, run, note } = useRun()
  const load = () => supabase.from('project_transfers').select('to_email').eq('project_id', project.id).maybeSingle().then(({ data }) => setT(data as { to_email: string } | null))
  useEffect(() => { load() }, [project.id]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="space-y-4">
      <div><H>Give this project to someone else</H><P>The new owner gets the project, its versions and its share link. Its API keys, own-website link and marketplace listing are removed, because they belong to your accounts. Editors stay on the project.</P></div>
      {t ? (
        <div className="space-y-2">
          <Alert tone="info">Waiting for {t.to_email} to accept in their account page.</Alert>
          <button className="btn btn-ghost" disabled={busy} onClick={() => run(async () => { await rpc('cancel_transfer', { p_project: project.id }); await load(); return 'Transfer cancelled.' })}>Cancel the transfer</button>
        </div>
      ) : (
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (!confirm(`Offer "${project.title}" to ${email}? Once they accept, it is theirs.`)) return; run(async () => { await rpc('offer_transfer', { p_project: project.id, p_email: email, p_note: noteText || null }); await load(); return 'Offer sent. They accept it after signing in with that email.' }) }}>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="new.owner@email.com" aria-label="New owner's email" />
          <input className="input" maxLength={300} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="A note for them (optional)" aria-label="Note" />
          <button className="btn btn-primary" disabled={busy}>Offer transfer</button>
        </form>
      )}
      {note}
    </div>
  )
}
