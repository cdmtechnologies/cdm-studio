import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../lib/auth'
import { href } from '../lib/router'
import { callFunction, supabase } from '../lib/supabase'
import { startEnrol, turnOff, verifiedFactor, verifyCode } from '../lib/twoStep'
import { Alert, fmtDate, Icon, Spinner } from '../components/ui'
import CreditsPanel from '../components/Credits'
import { Certificates, Earnings, Requests } from '../components/AccountExtras'

type Pay = { reference: string; amount: number; currency: string; period: string; status: string; created_at: string; credits: number | null }
const GOALS = [['all', 'A bit of everything'], ['ai', 'Use AI well'], ['web', 'Build websites'], ['apps', 'Build apps'], ['games', 'Make games'], ['data', 'Analyse data']]

export default function Account() {
  const { session, profile, ready, refresh, askSignIn } = useAuth()
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('all')
  const [saved, setSaved] = useState('')
  const [pays, setPays] = useState<Pay[]>([])
  const [notice, setNotice] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [newPw, setNewPw] = useState('')
  const resetting = location.hash.includes('reset=1')

  useEffect(() => { setName(profile?.name ?? ''); setGoal(profile?.goal ?? 'all') }, [profile])
  useEffect(() => {
    if (!session) return
    supabase.from('payments').select('reference, amount, currency, period, status, created_at, credits').order('created_at', { ascending: false }).limit(10).then(({ data }) => setPays((data as Pay[]) ?? []))
    callFunction<{ data: { email: string } }>('studio-control', { action: 'whoami' }).then(() => setIsOwner(true)).catch(() => setIsOwner(false))
  }, [session])

  // back from Paystack
  useEffect(() => {
    // Paystack adds ?reference=… to the return address; with hash routes it can land after the # as well
    const q = new URLSearchParams(location.search || location.hash.split('?')[1] || '')
    const ref = q.get('reference') || q.get('trxref')
    if (!session || !ref || !/^cdmstudio_/.test(ref)) return
    setNotice('Checking your payment…')
    callFunction<{ paid: boolean; premium_until?: string; credits_added?: number | null; balance?: number | null; status?: string }>('studio-pay', { action: 'verify', reference: ref })
      .then((r) => { setNotice(!r.paid ? 'The payment was not completed. You can try again.' : r.credits_added ? `Payment received. ${Number(r.credits_added).toLocaleString()} credits added${r.balance != null ? ` (balance ${Math.floor(Number(r.balance)).toLocaleString()})` : ''}.` : `Payment received. Premium is on until ${fmtDate(r.premium_until!)}.`); refresh(); history.replaceState(null, '', location.pathname + '#/account') })
      .catch((e) => setNotice((e as Error).message))
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <Spinner />
  if (!session) return <div className="mx-auto max-w-md"><Alert tone="info">Sign in to see your account. <button className="font-semibold underline" onClick={() => askSignIn()}>Sign in</button></Alert></div>

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('profiles').update({ name: name.trim().slice(0, 80) || null, goal }).eq('id', session!.user.id)
    setSaved(error ? error.message : 'Saved.'); refresh()
  }
  async function changePassword() {
    if (newPw.length < 8) return setSaved('Use at least 8 characters.')
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setSaved(error ? error.message : 'Password changed.'); setNewPw('')
  }

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

      <Requests />
      <CreditsPanel />
      <Earnings />
      <Certificates />

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
            {pays.map((p) => <li key={p.reference} className="flex justify-between py-2"><span>{fmtDate(p.created_at)} · {p.period === 'credits' ? `${Number(p.credits ?? 0).toLocaleString()} credits` : p.period === 'yearly' ? '1 year Premium' : '1 month Premium'}</span><span>{p.currency === 'NGN' ? '₦' : '$'}{Number(p.amount).toLocaleString()} · {p.status}</span></li>)}
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
