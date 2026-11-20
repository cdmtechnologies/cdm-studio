import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { kindOf, KINDS } from '../lib/builder'
import { go, href } from '../lib/router'
import { supabase } from '../lib/supabase'
import { Alert, Spinner } from '../components/ui'

type Item = { project_id: string; slug: string; title: string; kind: string; price_credits: number; blurb: string; sales: number; views: number; seller_name: string }

/** Ready-made projects people sell: try the live version, buy a copy to make your own. */
export default function Market() {
  const { session, credits, askSignIn, refresh } = useAuth()
  const [items, setItems] = useState<Item[] | null>(null)
  const [kind, setKind] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  useEffect(() => {
    const t = setTimeout(() => supabase.rpc('market', { p_kind: kind, p_q: q.trim() || null }).then(({ data }) => setItems((data as Item[]) ?? [])), 250)
    return () => clearTimeout(t)
  }, [kind, q])
  async function buy(i: Item) {
    if (!session) return askSignIn('Create a free account to buy projects.')
    if (!confirm(`Buy "${i.title}" for ${i.price_credits} credits? You get your own copy to change.`)) return
    setBusy(i.project_id); setErr('')
    const { data, error } = await supabase.rpc('buy_project', { p_project: i.project_id })
    setBusy('')
    if (error) return setErr(error.message)
    refresh(); go(`build/${data}`)
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Marketplace</h1>
        <p className="mt-1 text-slate-600">Ready-made websites, apps, games and tools by CDM Studio makers. Try them live, buy a copy with credits and make it yours. Makers: sell your own from a project's <b>More → Sell</b>.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <input className="input min-w-0 flex-1 sm:max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search the marketplace" />
        <button className={`chip ${!kind ? 'chip-on' : 'chip-off'}`} onClick={() => setKind(null)}>All</button>
        {KINDS.map((k) => <button key={k.id} className={`chip ${kind === k.id ? 'chip-on' : 'chip-off'}`} onClick={() => setKind(k.id)}>{k.emoji} {k.label}</button>)}
      </div>
      {err && <Alert>{err} {/credits/i.test(err) && <a className="font-semibold underline" href={href('account')}>Buy credits</a>}</Alert>}
      {!items ? <Spinner /> : items.length === 0 ? <p className="text-slate-500">Nothing here yet. Be the first to sell a project!</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.project_id} className="card flex flex-col p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-2xl" aria-hidden="true">{kindOf(i.kind).emoji}</span>
                <div className="min-w-0 flex-1"><h2 className="font-semibold">{i.title}</h2><p className="text-xs text-slate-500">by {i.seller_name} · {i.sales} sold · {i.views} views</p></div>
              </div>
              <p className="mt-3 line-clamp-4 flex-1 text-sm text-slate-600">{i.blurb || 'No description.'}</p>
              <p className="mt-3 font-bold text-violet-800">{i.price_credits.toLocaleString()} credits <span className="text-sm font-normal text-slate-500">(₦{(i.price_credits * 10).toLocaleString()})</span></p>
              <div className="mt-3 flex gap-2">
                <a className="btn btn-ghost flex-1" href={href(`p/${i.slug}`)} target="_blank" rel="noreferrer">Try it</a>
                <button className="btn btn-primary flex-1" disabled={!!busy} onClick={() => buy(i)}>{busy === i.project_id ? 'Buying…' : 'Buy'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {session && <p className="text-sm text-slate-500">You have {credits.toLocaleString()} credits.</p>}
    </div>
  )
}
