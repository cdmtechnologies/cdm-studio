import { useEffect, useState } from 'react'
import { KINDS, kindOf, type Kind } from '../lib/builder'
import { href } from '../lib/router'
import { supabase } from '../lib/supabase'
import { ago, Spinner } from '../components/ui'

type Item = { slug: string; title: string; kind: Kind; views: number; updated_at: string; author: string }

export default function Explore() {
  const [kind, setKind] = useState<Kind | null>(null)
  const [sort, setSort] = useState<'new' | 'top'>('new')
  const [items, setItems] = useState<Item[] | null>(null)
  const [more, setMore] = useState(true)

  useEffect(() => {
    setItems(null)
    supabase.rpc('gallery', { p_kind: kind, p_sort: sort, p_limit: 24, p_offset: 0 }).then(({ data }) => { setItems((data as Item[]) ?? []); setMore((data ?? []).length === 24) })
  }, [kind, sort])

  async function loadMore() {
    const { data } = await supabase.rpc('gallery', { p_kind: kind, p_sort: sort, p_limit: 24, p_offset: items?.length ?? 0 })
    setItems((x) => [...(x ?? []), ...((data as Item[]) ?? [])]); setMore((data ?? []).length === 24)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Explore</h1>
        <p className="mt-1 text-slate-600">Websites, apps and games people built with AI. Open one, then remix it to make it yours.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className={`chip ${kind === null ? 'chip-on' : 'chip-off'}`} onClick={() => setKind(null)}>All</button>
        {KINDS.map((k) => <button key={k.id} className={`chip ${kind === k.id ? 'chip-on' : 'chip-off'}`} onClick={() => setKind(k.id)}><span aria-hidden="true">{k.emoji}</span>{k.label}</button>)}
        <select className="input ml-auto w-auto py-1.5" value={sort} onChange={(e) => setSort(e.target.value as 'new' | 'top')} aria-label="Sort">
          <option value="new">Newest</option><option value="top">Most viewed</option>
        </select>
      </div>
      {!items ? <Spinner /> : items.length === 0 ? (
        <div className="card p-8 text-center"><p className="font-semibold">Nothing here yet.</p><p className="mt-1 text-sm text-slate-600">Be the first: <a className="font-semibold text-violet-700 underline" href={href('build')}>build something</a> and publish it.</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <a key={i.slug} href={href(`p/${i.slug}`)} className="card group p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-amber-50 text-5xl" aria-hidden="true">{kindOf(i.kind).emoji}</div>
              <h2 className="mt-3 truncate font-semibold group-hover:text-violet-700">{i.title}</h2>
              <p className="text-xs text-slate-500">by {i.author} · {i.views} views · {ago(i.updated_at)}</p>
            </a>
          ))}
        </div>
      )}
      {items && more && <div className="text-center"><button className="btn btn-ghost" onClick={loadMore}>Show more</button></div>}
    </div>
  )
}
