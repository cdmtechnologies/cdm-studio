import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { build, IDEAS, KINDS, kindOf, type Kind, type Project } from '../lib/builder'
import { go, href } from '../lib/router'
import { supabase, type FnError } from '../lib/supabase'
import { Alert, ago, Icon, Spinner } from '../components/ui'
import { BestToggle, BuyCreditsLink, useBestAI } from '../components/Credits'

const PENDING = 'cdm-studio-pending-build'

export default function Build() {
  const { session, askSignIn, refresh } = useAuth()
  const [best, setBest] = useBestAI()
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [kind, setKind] = useState<Kind>('website')
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<FnError | null>(null)

  useEffect(() => {
    if (!session) { setProjects([]); return }
    supabase.from('projects').select('id, title, kind, published, slug, views, updated_at').order('updated_at', { ascending: false }).limit(100)
      .then(({ data }) => setProjects((data as Project[]) ?? []))
  }, [session])

  // a prompt typed before signing in is picked up after
  useEffect(() => {
    if (!session) return
    try {
      const p = JSON.parse(sessionStorage.getItem(PENDING) || 'null')
      if (p?.prompt) { sessionStorage.removeItem(PENDING); setPrompt(p.prompt); setKind(p.kind) }
    } catch { /* ignore */ }
  }, [session])

  async function create() {
    const text = prompt.trim()
    if (text.length < 8) return setErr(Object.assign(new Error('Describe what you want in a sentence or two.'), {}))
    if (!session) {
      try { sessionStorage.setItem(PENDING, JSON.stringify({ prompt: text, kind })) } catch { /* ignore */ }
      return askSignIn('Create a free account to build with AI. Your idea is kept.')
    }
    setBusy(true); setErr(null)
    try {
      const r = await build({ kind, prompt: text, mode: 'create', best })
      refresh()
      go(`build/${r.project.id}`)
    } catch (e) { setErr(e as FnError) } finally { setBusy(false) }
  }

  async function blank() {
    if (!session) return askSignIn('Create a free account to start a project.')
    const { data, error } = await supabase.from('projects').insert({ title: 'My page', kind, html: STARTER }).select('id').single()
    if (error) return setErr(Object.assign(new Error(error.message), {}))
    await supabase.from('project_versions').insert({ project_id: data.id, html: STARTER, source: 'start', summary: 'Empty page' })
    go(`build/${data.id}`)
  }

  return (
    <div className="space-y-10">
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-br from-violet-700 to-fuchsia-600 p-6 text-white sm:p-8">
          <h1 className="font-display text-3xl font-bold">What do you want to build?</h1>
          <p className="mt-1 text-violet-100">Describe it in plain words. AI builds it, explains what it did, and you keep improving it together.</p>
        </div>
        <div className="space-y-4 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Type">
            {KINDS.map((k) => (
              <button key={k.id} role="radio" aria-checked={kind === k.id} onClick={() => setKind(k.id)} className={`chip ${kind === k.id ? 'chip-on' : 'chip-off'}`}>
                <span aria-hidden="true">{k.emoji}</span>{k.label}
              </button>
            ))}
          </div>
          <textarea className="input min-h-[120px] text-base" value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={3000}
            placeholder={kindOf(kind).hint + '…'} aria-label="Describe your project"
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) create() }} />
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ideas to try</p>
            <div className="flex flex-col gap-2">
              {IDEAS[kind].map((i) => <button key={i} className="rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:border-violet-300 hover:bg-violet-50" onClick={() => setPrompt(i)}>{i}</button>)}
            </div>
          </div>
          {err && <Alert>{err.message} <BuyCreditsLink err={err} /></Alert>}
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn btn-primary px-5 py-3 text-base" onClick={create} disabled={busy}>
              {busy ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Building… (up to a minute)</> : <><Icon.sparkle /> Build it</>}
            </button>
            <button className="btn btn-ghost" onClick={blank} disabled={busy}><Icon.code /> Start from an empty page</button>
            {session && <BestToggle best={best} onChange={setBest} />}
          </div>
          <p className="text-sm text-slate-500">Need a better prompt? <a className="font-semibold text-violet-700 hover:underline" href={href('prompts')}>Open the prompt bank</a></p>
        </div>
      </section>

      {session && (
        <section>
          <h2 className="font-display text-2xl font-bold">Your projects</h2>
          {!projects ? <Spinner /> : projects.length === 0 ? <p className="mt-3 text-slate-600">Nothing yet. Your first project will appear here.</p> : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <a key={p.id} href={href(`build/${p.id}`)} className="card flex items-center gap-3 p-4 hover:border-violet-300">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-2xl" aria-hidden="true">{kindOf(p.kind).emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{p.title}</span>
                    <span className="text-xs text-slate-500">{ago(p.updated_at)}{p.published ? ` · published · ${p.views} views` : ''}</span>
                  </span>
                </a>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

const STARTER = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My page</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 32px; background: #f5f3ff; color: #1e1b4b; }
    h1 { color: #6d28d9; }
  </style>
</head>
<body>
  <h1>Hello!</h1>
  <p>Edit this page in the Code tab, or tell the AI what to build.</p>
</body>
</html>
`
