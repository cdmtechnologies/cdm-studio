import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { go, href } from '../lib/router'
import { supabase } from '../lib/supabase'
import { Alert, fmtDate } from './ui'

type Req = { kind: 'invite' | 'transfer'; id: string; project_id: string; title: string; from_name: string; role: string | null; created_at: string }

/** Invitations to projects and projects offered to me. */
export function Requests() {
  const [list, setList] = useState<Req[]>([])
  const [err, setErr] = useState('')
  const load = () => supabase.rpc('my_requests').then(({ data }) => setList((data as Req[]) ?? []))
  useEffect(() => { load() }, [])
  if (!list.length) return null
  async function answer(r: Req, yes: boolean) {
    setErr('')
    const { error } = r.kind === 'invite'
      ? await supabase.rpc('answer_invite', { p_invite: r.id, p_accept: yes })
      : yes ? await supabase.rpc('accept_transfer', { p_project: r.project_id }) : await supabase.rpc('cancel_transfer', { p_project: r.project_id })
    if (error) return setErr(error.message)
    if (yes) go(`build/${r.project_id}`); else load()
  }
  return (
    <section className="card space-y-3 border-violet-300 p-5 ring-2 ring-violet-100">
      <h2 className="font-semibold">Waiting for you</h2>
      <ul className="divide-y divide-slate-100">
        {list.map((r) => (
          <li key={r.kind + r.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
            <span className="min-w-0 flex-1">{r.kind === 'invite' ? <>{r.from_name} invited you to <b>{r.title}</b> as {r.role}</> : <>{r.from_name} wants to give you the project <b>{r.title}</b></>}</span>
            <button className="btn btn-primary px-3 py-1.5" onClick={() => answer(r, true)}>Accept</button>
            <button className="btn btn-ghost px-3 py-1.5" onClick={() => answer(r, false)}>Decline</button>
          </li>
        ))}
      </ul>
      {err && <Alert>{err}</Alert>}
    </section>
  )
}

type Payout = { id: number; credits: number; amount_ngn: number; bank_name: string; account_name: string; status: string; note: string | null; created_at: string }

/** Money earned from selling projects: turn into credits, or ask for a bank payout. */
export function Earnings() {
  const { session, refresh } = useAuth()
  const [earn, setEarn] = useState(0)
  const [min, setMin] = useState(1000)
  const [pays, setPays] = useState<Payout[]>([])
  const [amount, setAmount] = useState('')
  const [bank, setBank] = useState({ bank: '', name: '', no: '' })
  const [msg, setMsg] = useState('')
  const load = async () => {
    if (!session) return
    const [{ data: p }, { data: s }, { data: r }] = await Promise.all([
      supabase.from('profiles').select('earnings').eq('id', session.user.id).maybeSingle(),
      supabase.from('settings').select('min_payout_credits').maybeSingle(),
      supabase.from('payout_requests').select('id, credits, amount_ngn, bank_name, account_name, status, note, created_at').order('created_at', { ascending: false }).limit(10),
    ])
    setEarn(Number((p as { earnings: number } | null)?.earnings ?? 0)); setMin(Number((s as { min_payout_credits: number } | null)?.min_payout_credits ?? 1000)); setPays((r as Payout[]) ?? [])
  }
  useEffect(() => { load() }, [session]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!earn && !pays.length) return null
  const n = Number(amount)
  async function act(fn: string, args: Record<string, unknown>, ok: string) {
    setMsg('')
    const { error } = await supabase.rpc(fn, args)
    if (error) return setMsg(error.message)
    setMsg(ok); setAmount(''); refresh(); load()
  }
  return (
    <section className="card space-y-3 p-5">
      <div className="flex items-end justify-between"><h2 className="font-semibold">Marketplace earnings</h2><p className="font-display text-2xl font-bold text-emerald-700">{earn.toLocaleString()} <span className="text-sm text-slate-500">credits · ₦{(earn * 10).toLocaleString()}</span></p></div>
      {earn > 0 && (
        <div className="space-y-2">
          <input className="input w-40" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} placeholder="Amount" aria-label="Amount of earnings" />
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-ghost" disabled={!(n > 0 && n <= earn)} onClick={() => act('earnings_to_credits', { p_amount: n }, 'Moved to your credits.')}>Use as credits</button>
          </div>
          <details className="rounded-xl border border-slate-200 p-3 text-sm">
            <summary className="cursor-pointer font-semibold">Pay to my bank account (from {min.toLocaleString()} credits)</summary>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <input className="input" value={bank.bank} onChange={(e) => setBank({ ...bank, bank: e.target.value })} placeholder="Bank" aria-label="Bank" />
              <input className="input" value={bank.name} onChange={(e) => setBank({ ...bank, name: e.target.value })} placeholder="Account name" aria-label="Account name" />
              <input className="input" inputMode="numeric" maxLength={10} value={bank.no} onChange={(e) => setBank({ ...bank, no: e.target.value.replace(/\D/g, '') })} placeholder="10-digit account number" aria-label="Account number" />
            </div>
            <button className="btn btn-primary mt-2" disabled={!(n >= min && n <= earn) || bank.no.length !== 10} onClick={() => act('request_payout', { p_amount: n, p_bank: bank.bank, p_account_name: bank.name, p_account_no: bank.no }, 'Payout requested. CDM pays within 3 working days.')}>Request ₦{((n || 0) * 10).toLocaleString()}</button>
            <p className="mt-1 text-xs text-slate-500">The account name must match your name. Your account number is only seen by CDM to pay you.</p>
          </details>
        </div>
      )}
      {msg && <Alert tone="info">{msg}</Alert>}
      {pays.length > 0 && <ul className="divide-y divide-slate-100 text-sm">{pays.map((p) => <li key={p.id} className="flex justify-between gap-2 py-1.5"><span>{fmtDate(p.created_at)} · ₦{Number(p.amount_ngn).toLocaleString()} to {p.bank_name}</span><span className={p.status === 'paid' ? 'text-emerald-700' : p.status === 'refused' ? 'text-red-700' : 'text-slate-600'}>{p.status}{p.note ? ` (${p.note})` : ''}</span></li>)}</ul>}
    </section>
  )
}

type Cert = { code: string; title: string; score: number; issued_at: string }
export function Certificates() {
  const [list, setList] = useState<Cert[]>([])
  useEffect(() => { supabase.from('certificates').select('code, title, score, issued_at').order('issued_at', { ascending: false }).then(({ data }) => setList((data as Cert[]) ?? [])) }, [])
  if (!list.length) return null
  return (
    <section className="card p-5">
      <h2 className="mb-2 font-semibold">Your certificates</h2>
      <ul className="divide-y divide-slate-100 text-sm">{list.map((c) => <li key={c.code} className="flex justify-between gap-2 py-2"><a className="font-semibold text-violet-700 hover:underline" href={href(`cert/${c.code}`)}>🎓 {c.title}</a><span className="text-slate-500">{c.score}% · {fmtDate(c.issued_at)}</span></li>)}</ul>
    </section>
  )
}
