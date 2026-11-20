import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../lib/auth'
import { href, referralCode } from '../lib/router'
import { callFunction, supabase } from '../lib/supabase'
import { startEnrol, turnOff, verifiedFactor, verifyCode } from '../lib/twoStep'
import { Alert, fmtDate, Icon, Spinner } from '../components/ui'

type Prices = { price_monthly_ngn: number; price_yearly_ngn: number; price_monthly_usd: number; price_yearly_usd: number; free_builds_daily: number; premium_builds_daily: number; free_tutor_daily: number; premium_tutor_daily: number }
type Pay = { reference: string; amount: number; currency: string; period: string; status: string; created_at: string }
const GOALS = [['all', 'A bit of everything'], ['ai', 'Use AI well'], ['web', 'Build websites'], ['apps', 'Build apps'], ['games', 'Make games'], ['data', 'Analyse data']]

export default function Account() {
  const { session, profile, premium, ready, refresh, askSignIn } = useAuth()
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('all')
  const [saved, setSaved] = useState('')
  const [prices, setPrices] = useState<Prices | null>(null)
  const [usage, setUsage] = useState<{ builds: number; tutor: number } | null>(null)
  const [pays, setPays] = useState<Pay[]>([])
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const [notice, setNotice] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [newPw, setNewPw] = useState('')
  const resetting = location.hash.includes('reset=1')

  useEffect(() => { setName(profile?.name ?? ''); setGoal(profile?.goal ?? 'all') }, [profile])
  useEffect(() => {
    if (!session) return
    supabase.from('settings').select('price_monthly_ngn, price_yearly_ngn, price_monthly_usd, price_yearly_usd, free_builds_daily, premium_builds_daily, free_tutor_daily, premium_tutor_daily').maybeSingle().then(({ data }) => setPrices(data as Prices))
    const today = new Date(Date.now() + 3600e3).toISOString().slice(0, 10) // Lagos day
    supabase.from('ai_usage').select('builds, tutor').eq('user_id', session.user.id).eq('day', today).maybeSingle().then(({ data }) => setUsage((data as { builds: number; tutor: number }) ?? { builds: 0, tutor: 0 }))
    supabase.from('payments').select('reference, amount, currency, period, status, created_at').order('created_at', { ascending: false }).limit(10).then(({ data }) => setPays((data as Pay[]) ?? []))
    callFunction<{ data: { email: string } }>('studio-control', { action: 'whoami' }).then(() => setIsOwner(true)).catch(() => setIsOwner(false))
  }, [session])

  // back from Paystack
  useEffect(() => {
    // Paystack adds ?reference=… to the return address; with hash routes it can land after the # as well
    const q = new URLSearchParams(location.search || location.hash.split('?')[1] || '')
    const ref = q.get('reference') || q.get('trxref')
    if (!session || !ref || !/^cdmstudio_/.test(ref)) return
    setNotice('Checking your payment…')
    callFunction<{ paid: boolean; premium_until?: string; status?: string }>('studio-pay', { action: 'verify', reference: ref })
      .then((r) => { setNotice(r.paid ? `Payment received. Premium is on until ${fmtDate(r.premium_until!)}.` : 'The payment was not completed. You can try again.'); refresh(); history.replaceState(null, '', location.pathname + '#/account') })
      .catch((e) => setNotice((e as Error).message))
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <Spinner />
  if (!session) return <div className="mx-auto max-w-md"><Alert tone="info">Sign in to see your account. <button className="font-semibold underline" onClick={() => askSignIn()}>Sign in</button></Alert></div>

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('profiles').update({ name: name.trim().slice(0, 80) || null, goal }).eq('id', session!.user.id)
    setSaved(error ? error.message : 'Saved.'); refresh()
  }
  async function pay(period: 'monthly' | 'yearly', currency: 'NGN' | 'USD') {
    setBusy(period + currency); setErr('')
    try {
      const r = await callFunction<{ url: string }>('studio-pay', { action: 'start', period, currency, return_url: `${location.origin}${location.pathname}#/account`, referral_code: referralCode() })
      location.assign(r.url)
    } catch (e) { setErr((e as Error).message); setBusy('') }
  }
  async function changePassword() {
    if (newPw.length < 8) return setSaved('Use at least 8 characters.')
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setSaved(error ? error.message : 'Password changed.'); setNewPw('')
  }

  const lim = (free?: number, prem?: number) => (premium ? prem : free) ?? 0
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Your account</h1>
        <button className="btn btn-ghost" onClick={() => supabase.auth.signOut().then(() => { location.hash = '#/' })}>Sign out</button>
      </div>
      {notice && <Alert tone="info">{notice}</Alert>}
      {resetting && (
        <section className="card space-y-3 p-5">
          <h2 className="font-semibold">Choose a new password</h2>
          <input className="input" type="password" autoComplete="new-password" value={newPw} onChange={(e) => setNewPw(e.target.value)} minLength={8} aria-label="New password" />
          <button className="btn btn-primary" onClick={changePassword}>Save new password</button>
        </section>
      )}

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">{premium ? 'Premium' : 'Free plan'}</h2>
            <p className="text-sm text-slate-600">{premium ? `Until ${fmtDate(profile!.premium_until!)}` : 'Every lesson is free. Premium adds more AI and our strongest model.'}</p>
          </div>
          {premium && <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">★ Premium</span>}
        </div>
        {usage && prices && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[['AI builds today', usage.builds, lim(prices.free_builds_daily, prices.premium_builds_daily)], ['Tutor questions today', usage.tutor, lim(prices.free_tutor_daily, prices.premium_tutor_daily)]].map(([l, u, m]) => (
              <div key={l as string} className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm text-slate-600">{l}</p>
                <p className="font-bold">{u} of {m}</p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-violet-600" style={{ width: `${Math.min(100, (Number(u) / Math.max(1, Number(m))) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        )}
        {prices && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="mb-3 text-sm font-semibold">{premium ? 'Add more Premium time' : 'Get Premium'} (no automatic renewal)</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button className="btn btn-primary" disabled={!!busy} onClick={() => pay('monthly', 'NGN')}>1 month · ₦{prices.price_monthly_ngn.toLocaleString()}</button>
              <button className="btn btn-primary" disabled={!!busy} onClick={() => pay('yearly', 'NGN')}>1 year · ₦{prices.price_yearly_ngn.toLocaleString()}</button>
              <button className="btn btn-ghost" disabled={!!busy} onClick={() => pay('monthly', 'USD')}>1 month · ${prices.price_monthly_usd}</button>
              <button className="btn btn-ghost" disabled={!!busy} onClick={() => pay('yearly', 'USD')}>1 year · ${prices.price_yearly_usd}</button>
            </div>
            {err && <div className="mt-3"><Alert>{err}</Alert></div>}
            <p className="mt-2 text-xs text-slate-500">Secure payment by card or bank transfer through Paystack.</p>
          </div>
        )}
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold">About you</h2>
        <form onSubmit={saveProfile} className="grid gap-3 sm:grid-cols-2">
          <label><span className="label">Name</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></label>
          <label><span className="label">What do you most want to learn?</span>
            <select className="input" value={goal} onChange={(e) => setGoal(e.target.value)}>{GOALS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </label>
          <div className="flex items-center gap-3 sm:col-span-2"><button className="btn btn-primary">Save</button>{saved && <span className="text-sm text-slate-600">{saved}</span>}</div>
        </form>
        <p className="mt-3 text-sm text-slate-500">Signed in as {session.user.email}</p>
      </section>

      <TwoStepSettings />

      {pays.length > 0 && (
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Payments</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {pays.map((p) => <li key={p.reference} className="flex justify-between py-2"><span>{fmtDate(p.created_at)} · {p.period === 'yearly' ? '1 year' : '1 month'}</span><span>{p.currency === 'NGN' ? '₦' : '$'}{Number(p.amount).toLocaleString()} · {p.status}</span></li>)}
          </ul>
        </section>
      )}
      {isOwner && <a href={href('owner')} className="btn btn-ghost"><Icon.lock /> Owner dashboard</a>}
    </div>
  )
}

function TwoStepSettings() {
  const [factor, setFactor] = useState<{ id: string } | null | undefined>(undefined)
  const [enrol, setEnrol] = useState<{ factorId: string; qr: string; secret: string } | null>(null)
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  useEffect(() => { verifiedFactor().then(setFactor).catch(() => setFactor(null)) }, [])
  if (factor === undefined) return null
  return (
    <section className="card space-y-3 p-5">
      <h2 className="font-semibold">Two-step sign-in</h2>
      <p className="text-sm text-slate-600">Ask for a 6-digit code from an authenticator app (Google Authenticator, Microsoft Authenticator, Authy) when you sign in.</p>
      {factor ? (
        <div className="flex items-center gap-3"><span className="text-sm font-semibold text-emerald-700">On</span>
          <button className="btn btn-ghost" onClick={async () => { if (!confirm('Turn off two-step sign-in?')) return; try { await turnOff(factor.id); setFactor(null) } catch (e) { setMsg((e as Error).message) } }}>Turn off</button></div>
      ) : enrol ? (
        <div className="space-y-3">
          <p className="text-sm">Scan this with your authenticator app, then type the 6-digit code it shows.</p>
          <img src={enrol.qr} alt="QR code for your authenticator app" className="h-44 w-44 rounded-lg border" />
          <p className="break-all font-mono text-xs text-slate-500">Or type this key: {enrol.secret}</p>
          <div className="flex gap-2"><input className="input w-40 text-center tracking-widest" inputMode="numeric" maxLength={7} value={code} onChange={(e) => setCode(e.target.value)} aria-label="6-digit code" />
            <button className="btn btn-primary" onClick={async () => { try { await verifyCode(enrol.factorId, code); setEnrol(null); setFactor(await verifiedFactor()); setMsg('Two-step sign-in is on.') } catch (e) { setMsg((e as Error).message) } }}>Turn on</button></div>
        </div>
      ) : (
        <button className="btn btn-ghost" onClick={async () => { try { setEnrol(await startEnrol()) } catch (e) { setMsg((e as Error).message) } }}>Set up two-step sign-in</button>
      )}
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
    </section>
  )
}
