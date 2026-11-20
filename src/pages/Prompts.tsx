import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { blanksOf, fill, PENDING_BUILD, PROMPT_BANK, type PromptTemplate } from '../lib/prompts'
import { go } from '../lib/router'
import { callFunction, type FnError } from '../lib/supabase'
import { Alert, Icon, Md, Modal } from '../components/ui'
import type { Kind } from '../lib/builder'
import { BuyCreditsLink } from '../components/Credits'

/** Ready prompts with blanks to fill in, and an AI that turns any idea into a strong prompt. */
export default function Prompts() {
  const { session, askSignIn, refresh } = useAuth()
  const [group, setGroup] = useState(PROMPT_BANK[0].id)
  const [open, setOpen] = useState<PromptTemplate | null>(null)
  const [idea, setIdea] = useState('')
  const [cat, setCat] = useState('Websites')
  const [busy, setBusy] = useState(false)
  const [made, setMade] = useState('')
  const [err, setErr] = useState<FnError | null>(null)
  const g = PROMPT_BANK.find((x) => x.id === group)!

  async function generate() {
    if (!session) return askSignIn('Create a free account to turn your ideas into prompts with AI.')
    if (idea.trim().length < 5) return
    setBusy(true); setErr(null); setMade('')
    try {
      const r = await callFunction<{ reply: string }>('studio-tutor', { mode: 'prompt', message: idea.trim().slice(0, 1500), category: cat })
      setMade(r.reply); refresh()
    } catch (e) { setErr(e as FnError) } finally { setBusy(false) }
  }
  const firstBlock = (md: string) => /```[a-z]*\n([\s\S]*?)```/.exec(md)?.[1]?.trim() ?? ''

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Prompt bank</h1>
        <p className="mt-1 text-slate-600">Good prompts get good results. Pick one and fill in the blanks, or let AI write one for your idea.</p>
      </div>

      <section className="card space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-semibold"><Icon.sparkle /> Turn my idea into a prompt</h2>
        <div className="flex flex-wrap gap-2">
          {PROMPT_BANK.map((x) => <button key={x.id} className={`chip ${cat === x.title ? 'chip-on' : 'chip-off'}`} onClick={() => setCat(x.title)}><span aria-hidden="true">{x.emoji}</span>{x.title}</button>)}
        </div>
        <textarea className="input min-h-[80px]" value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={1500} placeholder="Describe your idea in your own words, e.g. an app for my tailoring shop to track customers' measurements and when their clothes are ready" aria-label="Your idea" />
        <button className="btn btn-primary" disabled={busy || idea.trim().length < 5} onClick={generate}>{busy ? 'Writing your prompt…' : 'Write my prompt'}</button>
        {err && <Alert>{err.message} <BuyCreditsLink err={err} /></Alert>}
        {made && (
          <div className="space-y-3 rounded-xl border border-violet-200 bg-violet-50/50 p-4">
            {firstBlock(made) ? (
              <>
                <p className="font-semibold">Your prompt</p>
                <div className="whitespace-pre-wrap rounded-xl border border-violet-200 bg-white p-3 text-sm">{firstBlock(made)}</div>
                <UseButtons text={firstBlock(made)} kind={kindFor(cat)} data={cat === 'Data analysis'} />
                <Md text={made.replace(/^[\s\S]*?```[a-z]*\n[\s\S]*?```\s*/, '')} />
              </>
            ) : <Md text={made} />}
          </div>
        )}
      </section>

      <section>
        <div className="flex gap-2 overflow-x-auto pb-2" role="tablist">
          {PROMPT_BANK.map((x) => (
            <button key={x.id} role="tab" aria-selected={group === x.id} onClick={() => setGroup(x.id)} className={`chip shrink-0 ${group === x.id ? 'chip-on' : 'chip-off'}`}><span aria-hidden="true">{x.emoji}</span>{x.title}</button>
          ))}
        </div>
        <p className="mt-2 text-sm text-slate-500">{g.blurb}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {g.items.map((t) => (
            <button key={t.id} className="card p-4 text-left hover:border-violet-300" onClick={() => setOpen(t)}>
              <h3 className="font-semibold">{t.title}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-slate-600">{fill(t.text, {})}</p>
            </button>
          ))}
        </div>
      </section>
      {open && <Fill t={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function kindFor(cat: string): Kind | undefined {
  return cat === 'Websites' ? 'website' : cat === 'Apps and tools' ? 'app' : cat === 'Games' ? 'game' : undefined
}

function Fill({ t, onClose }: { t: PromptTemplate; onClose: () => void }) {
  const blanks = blanksOf(t.text)
  const [vals, setVals] = useState<Record<string, string>>({})
  const text = fill(t.text, vals)
  return (
    <Modal open title={t.title} onClose={onClose} wide>
      <div className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          {blanks.map((b) => (
            <label key={b.key} className="text-sm"><span className="label">{b.label}</span>
              <input className="input" placeholder={b.example} value={vals[b.key] ?? ''} onChange={(e) => setVals({ ...vals, [b.key]: e.target.value })} maxLength={500} />
            </label>
          ))}
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-sm whitespace-pre-wrap">{text}</div>
        <UseButtons text={text} kind={t.build} data={!t.build && t.id.startsWith('d-')} />
      </div>
    </Modal>
  )
}

function UseButtons({ text, kind, data }: { text: string; kind?: Kind; data?: boolean }) {
  const [copied, setCopied] = useState(false)
  if (!text) return null
  return (
    <div className="flex flex-wrap gap-2">
      {kind && <button className="btn btn-primary" onClick={() => { try { sessionStorage.setItem(PENDING_BUILD, JSON.stringify({ prompt: text, kind })) } catch { /* ignore */ } go('build') }}><Icon.hammer /> Use in Build</button>}
      {data && <button className="btn btn-primary" onClick={() => { try { sessionStorage.setItem('cdm-studio-pending-question', text) } catch { /* ignore */ } go('data') }}>Use in Analyse data</button>}
      <button className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })}>{copied ? <Icon.check /> : <Icon.copy />} {copied ? 'Copied' : 'Copy'}</button>
    </div>
  )
}
