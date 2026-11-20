import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../lib/auth'
import { build, download, explain, kindOf, QUICK_CHANGES, shareUrl, type Project, type Version } from '../lib/builder'
import { go, href } from '../lib/router'
import { answerApi, buildDoc, cleanError, listen, newNonce, SANDBOX, type ApiRequest } from '../lib/sandbox'
import { proxyCall } from '../lib/api'
import ProjectTools from '../components/ProjectTools'
import { supabase, type FnError } from '../lib/supabase'
import { Alert, ago, CodeEditor, Icon, Md, Modal, Spinner } from '../components/ui'
import { BestToggle, BuyCreditsLink, chargeNote, useBestAI } from '../components/Credits'

type Turn = { role: 'user' | 'ai'; text: string; at?: string }

export default function ProjectPage({ id }: { id: string }) {
  const { session, ready, askSignIn, refresh } = useAuth()
  const [best, setBest] = useBestAI()
  const [p, setP] = useState<Project | null>(null)
  const [missing, setMissing] = useState(false)
  const [versions, setVersions] = useState<Version[]>([])
  const [turns, setTurns] = useState<Turn[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState<FnError | null>(null)
  const [code, setCode] = useState('')
  const [tab, setTab] = useState<'preview' | 'code' | 'chat'>('preview')
  const [device, setDevice] = useState<'phone' | 'wide'>('wide')
  const [doc, setDoc] = useState('')
  const [pageErrors, setPageErrors] = useState<string[]>([])
  const [share, setShare] = useState(false)
  const [history, setHistory] = useState(false)
  const [tools, setTools] = useState(false)
  const [role, setRole] = useState<string>('owner')
  const [usage, setUsage] = useState('')
  const frame = useRef<HTMLIFrameElement>(null)
  const nonce = useRef('')
  const chatEnd = useRef<HTMLDivElement>(null)

  const show = useCallback((html: string) => {
    nonce.current = newNonce()
    setPageErrors([])
    setDoc(buildDoc(html, nonce.current))
  }, [])

  const load = useCallback(async () => {
    const [{ data: proj }, { data: vs }] = await Promise.all([
      supabase.from('projects').select('id, title, kind, html, published, slug, views, updated_at, remix_of').eq('id', id).maybeSingle(),
      supabase.from('project_versions').select('id, html, prompt, summary, source, created_at').eq('project_id', id).order('id', { ascending: true }).limit(50),
    ])
    if (!proj) { setMissing(true); return }
    supabase.rpc('project_role', { p_project: id }).then(({ data }) => setRole(String(data ?? 'owner')))
    setP(proj as Project); setCode((proj as Project).html); show((proj as Project).html)
    const v = (vs as Version[]) ?? []
    setVersions(v)
    setTurns(v.flatMap((x) => [
      ...(x.prompt ? [{ role: 'user' as const, text: x.prompt, at: x.created_at }] : []),
      ...(x.summary ? [{ role: 'ai' as const, text: x.summary, at: x.created_at }] : []),
    ]))
  }, [id, show])

  useEffect(() => { if (session) load() }, [session, load])
  useEffect(() => listen(() => frame.current, () => nonce.current, (m) => {
    if (m.type === 'error') setPageErrors((e) => (e.length >= 5 ? e : [...e, cleanError(m.message) + (m.line ? ` (line ${m.line})` : '')]))
    // the preview calls an API with one of the project's keys: made as the signed-in owner or editor
    if (m.type === 'api') { const n = nonce.current; proxyCall(m as unknown as ApiRequest, { project_id: id }).then((r) => answerApi(frame.current, n, Number(m.id), r)) }
  }), [id])
  useEffect(() => { chatEnd.current?.scrollIntoView({ block: 'nearest' }) }, [turns, busy])

  if (!ready) return <Spinner />
  if (!session) return <div className="mx-auto max-w-md p-6"><Alert tone="info">Sign in to open your projects. <button className="font-semibold underline" onClick={() => askSignIn()}>Sign in</button></Alert></div>
  if (missing) return <div className="mx-auto max-w-md p-6"><Alert>That project was not found. <a className="underline" href={href('build')}>Your projects</a></Alert></div>
  if (!p) return <Spinner />

  const dirty = code !== p.html

  async function ask(prompt: string, mode: 'change' | 'fix' = 'change') {
    const q = prompt.trim()
    if (!q || busy) return
    if (dirty && !confirm('You have code edits that are not saved. The AI will start from the last saved version. Continue?')) return
    setBusy(mode === 'fix' ? 'Fixing…' : 'Building…'); setErr(null)
    setTurns((t) => [...t, { role: 'user', text: q }])
    setText('')
    try {
      const r = await build({ project_id: p!.id, prompt: q, mode, best, error: mode === 'fix' ? pageErrors.join('\n') : undefined })
      setUsage(chargeNote(r, 'AI builds')); refresh()
      setP(r.project); setCode(r.project.html); show(r.project.html)
      setTurns((t) => [...t, { role: 'ai', text: r.summary }])
      setTab((x) => (x === 'chat' ? 'preview' : x))
      const { data } = await supabase.from('project_versions').select('id, html, prompt, summary, source, created_at').eq('project_id', p!.id).order('id', { ascending: true }).limit(50)
      setVersions((data as Version[]) ?? [])
    } catch (e) {
      setErr(e as FnError)
      setTurns((t) => t.slice(0, -1))
      setText(q)
    } finally { setBusy(null) }
  }

  async function explainIt() {
    setBusy('Explaining…'); setErr(null)
    try {
      const r = await explain(p!.id)
      setTurns((t) => [...t, { role: 'user', text: 'Explain how this project works' }, { role: 'ai', text: r.reply }])
      setTab((x) => (x === 'preview' || x === 'code' ? x : 'chat'))
    } catch (e) { setErr(e as FnError) } finally { setBusy(null) }
  }

  async function saveEdits() {
    setBusy('Saving…')
    const { data, error } = await supabase.from('projects').update({ html: code }).eq('id', p!.id).select('id, title, kind, html, published, slug, views, updated_at, remix_of').single()
    if (!error) {
      await supabase.from('project_versions').insert({ project_id: p!.id, html: code, source: 'edit', summary: 'You edited the code.' })
      setP(data as Project); show(code)
      setTurns((t) => [...t, { role: 'ai', text: 'Saved your code edits.' }])
    } else setErr(Object.assign(new Error(error.message), {}))
    setBusy(null)
  }

  async function restore(v: Version) {
    const { data, error } = await supabase.from('projects').update({ html: v.html }).eq('id', p!.id).select('id, title, kind, html, published, slug, views, updated_at, remix_of').single()
    if (error) return alert(error.message)
    await supabase.from('project_versions').insert({ project_id: p!.id, html: v.html, source: 'restore', summary: `Went back to the version from ${ago(v.created_at)}.` })
    setP(data as Project); setCode(v.html); show(v.html); setHistory(false); load()
  }

  async function rename(title: string) {
    const t = title.trim().slice(0, 80)
    if (!t || t === p!.title) return
    const { data } = await supabase.from('projects').update({ title: t }).eq('id', p!.id).select('id, title, kind, html, published, slug, views, updated_at, remix_of').single()
    if (data) setP(data as Project)
  }

  async function remove() {
    if (!confirm(`Delete "${p!.title}"? This cannot be undone.`)) return
    await supabase.from('projects').delete().eq('id', p!.id)
    go('build')
  }

  const chat = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {turns.length === 0 && <p className="text-sm text-slate-500">Tell the AI what to change. It will update the page and explain what it did.</p>}
        {turns.map((t, i) => (
          <div key={i} className={t.role === 'user' ? 'ml-8 rounded-2xl rounded-br-sm bg-violet-700 px-3 py-2 text-sm text-white' : 'mr-4 rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2 text-sm'}>
            {t.role === 'user' ? <p className="whitespace-pre-wrap">{t.text}</p> : <Md text={t.text} />}
          </div>
        ))}
        {busy && <p className="flex items-center gap-2 text-sm text-violet-700"><span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-700" />{busy} this can take up to a minute</p>}
        {err && <Alert>{err.message} <BuyCreditsLink err={err} /></Alert>}
        <div ref={chatEnd} />
      </div>
      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
          {QUICK_CHANGES.map((q) => <button key={q} className="chip chip-off shrink-0 text-xs" disabled={!!busy} onClick={() => ask(q)}>{q}</button>)}
        </div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(text) }}>
          <textarea className="input min-h-[52px] flex-1 resize-none" rows={2} maxLength={3000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe a change… e.g. add a contact form" aria-label="Change request"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(text) } }} />
          <button className="btn btn-primary self-end px-3" disabled={!!busy || !text.trim()} aria-label="Send"><Icon.send /></button>
        </form>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <button className="font-semibold text-violet-700 hover:underline" onClick={explainIt} disabled={!!busy}>Explain how it works</button>
          {usage ? <span>{usage}</span> : null}
        </div>
        <div className="mt-1.5"><BestToggle best={best} onChange={setBest} />
        </div>
      </div>
    </div>
  )

  const errorBar = pageErrors.length > 0 && (
    <div className="flex flex-wrap items-center gap-2 border-b border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
      <Icon.bug /><span className="min-w-0 flex-1 truncate">Error: {pageErrors[0]}</span>
      <button className="btn bg-red-600 px-3 py-1.5 text-white hover:bg-red-700" disabled={!!busy} onClick={() => ask('Fix the error on the page', 'fix')}>Fix with AI</button>
    </div>
  )

  const preview = (
    <div className="flex h-full min-h-0 flex-col">
      {errorBar}
      <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-slate-200 p-2">
        <iframe ref={frame} title={`Preview of ${p.title}`} sandbox={SANDBOX} srcDoc={doc} className={`h-full rounded-lg bg-white shadow ${device === 'phone' ? 'w-[390px] max-w-full' : 'w-full'}`} />
      </div>
    </div>
  )
  const codeView = (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <div className="flex items-center gap-2">
        <button className="btn btn-primary py-2" disabled={!dirty || !!busy} onClick={saveEdits}><Icon.check /> Save and run</button>
        <button className="btn btn-ghost py-2" disabled={!dirty} onClick={() => setCode(p.html)}><Icon.undo /> Undo edits</button>
        <span className="ml-auto text-xs text-slate-500">{code.length.toLocaleString()} characters</span>
      </div>
      <div className="min-h-0 flex-1"><CodeEditor value={code} onChange={setCode} label="Project code" /></div>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col bg-slate-50">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <a href={href('build')} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Your projects"><Icon.left /></a>
        <span aria-hidden="true">{kindOf(p.kind).emoji}</span>
        <input key={p.title} defaultValue={p.title} onBlur={(e) => rename(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
          className="min-w-0 flex-1 rounded-lg px-2 py-1 font-display font-bold outline-none hover:bg-slate-100 focus:bg-slate-100 sm:max-w-xs" aria-label="Project name" maxLength={80} />
        <div className="ml-auto flex items-center gap-1">
          <div className="mr-1 hidden rounded-lg bg-slate-100 p-0.5 lg:flex">
            <button className={`rounded-md p-1.5 ${device === 'wide' ? 'bg-white shadow' : ''}`} onClick={() => setDevice('wide')} aria-label="Computer size"><Icon.monitor /></button>
            <button className={`rounded-md p-1.5 ${device === 'phone' ? 'bg-white shadow' : ''}`} onClick={() => setDevice('phone')} aria-label="Phone size"><Icon.phone /></button>
          </div>
          <button className="btn btn-ghost px-2.5 py-2" onClick={() => setHistory(true)} title="Versions"><Icon.undo /><span className="hidden sm:inline">Versions</span></button>
          <button className="btn btn-ghost px-2.5 py-2" onClick={() => download(p.title, p.html)} title="Download"><Icon.download /></button>
          <button className="btn btn-ghost px-2.5 py-2" onClick={() => setTools(true)} title="Team, API keys, hosting, app and selling" aria-label="More: team, API keys, hosting, app and selling"><Icon.menu /><span className="hidden sm:inline">More</span></button>
          {role === 'owner' && <button className="btn btn-primary px-3 py-2" onClick={() => setShare(true)}><Icon.share /> {p.published ? 'Shared' : 'Publish'}</button>}
        </div>
      </div>

      {/* phones: tabs */}
      <div className="flex border-b border-slate-200 bg-white lg:hidden" role="tablist">
        {([['chat', 'AI chat'], ['preview', 'Preview'], ['code', 'Code']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`flex-1 py-2.5 text-sm font-semibold ${tab === k ? 'border-b-2 border-violet-700 text-violet-800' : 'text-slate-500'}`}>{l}{k === 'preview' && pageErrors.length ? ' ⚠' : ''}</button>
        ))}
      </div>
      <div className="min-h-0 flex-1 lg:hidden">
        <div className={tab === 'chat' ? 'h-full bg-white' : 'hidden'}>{chat}</div>
        <div className={tab === 'preview' ? 'h-full' : 'hidden'}>{preview}</div>
        <div className={tab === 'code' ? 'h-full' : 'hidden'}>{codeView}</div>
      </div>
      {/* computers */}
      <div className="hidden min-h-0 flex-1 lg:grid lg:grid-cols-[380px_1fr]">
        <div className="min-h-0 border-r border-slate-200 bg-white">{chat}</div>
        <div className="flex min-h-0 flex-col">
          <div className="flex border-b border-slate-200 bg-white px-2">
            {([['preview', 'Preview', Icon.eye], ['code', 'Code', Icon.code]] as const).map(([k, l, I]) => (
              <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold ${tab === k || (tab === 'chat' && k === 'preview') ? 'border-b-2 border-violet-700 text-violet-800' : 'text-slate-500'}`}><I />{l}{k === 'code' && dirty ? ' •' : ''}</button>
            ))}
          </div>
          <div className="min-h-0 flex-1">{tab === 'code' ? codeView : preview}</div>
        </div>
      </div>

      {tools && <ProjectTools project={p} role={role} onClose={() => setTools(false)} />}
      <ShareModal open={share} onClose={() => setShare(false)} project={p} onChange={setP} onDelete={remove} />
      <Modal open={history} title="Versions" onClose={() => setHistory(false)}>
        <ol className="space-y-2">
          {[...versions].reverse().map((v, i) => (
            <li key={v.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{v.prompt || v.summary || (v.source === 'start' ? 'First version' : 'Version')}</p>
                <p className="text-xs text-slate-500">{ago(v.created_at)} · {v.source === 'ai' ? 'AI' : v.source === 'edit' ? 'Your edit' : v.source}</p>
              </div>
              {i === 0 ? <span className="text-xs font-semibold text-emerald-700">Current</span> : <button className="btn btn-ghost px-2.5 py-1.5 text-xs" onClick={() => restore(v)}>Go back to this</button>}
            </li>
          ))}
        </ol>
      </Modal>
    </div>
  )
}

function ShareModal({ open, onClose, project, onChange, onDelete }: { open: boolean; onClose: () => void; project: Project; onChange: (p: Project) => void; onDelete: () => void }) {
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  async function toggle(pub: boolean) {
    setBusy(true)
    const { data, error } = await supabase.from('projects').update({ published: pub }).eq('id', project.id).select('id, title, kind, html, published, slug, views, updated_at, remix_of').single()
    setBusy(false)
    if (error) return alert(error.message)
    onChange(data as Project)
  }
  const url = project.slug ? shareUrl(project.slug) : ''
  return (
    <Modal open={open} title="Publish and share" onClose={onClose}>
      <div className="space-y-4">
        {project.published && url ? (
          <>
            <Alert tone="ok">Published. Anyone with the link can open it, and it appears in Explore where others can remix it.</Alert>
            <div className="flex gap-2">
              <input className="input font-mono text-xs" readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Share link" />
              <button className="btn btn-ghost px-3" onClick={() => navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })}>{copied ? <Icon.check /> : <Icon.copy />}</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <a className="btn bg-green-600 text-white hover:bg-green-700" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`Look what I built with AI: ${project.title} ${url}`)}`}>Share on WhatsApp</a>
              <a className="btn btn-ghost" href={url} target="_blank" rel="noopener noreferrer"><Icon.external /> Open</a>
            </div>
            <p className="text-sm text-slate-500">{project.views} views so far. Changes you make are live straight away.</p>
            <button className="btn btn-ghost" disabled={busy} onClick={() => toggle(false)}>Stop sharing</button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600">Publishing gives your project a link you can send to anyone. It will also show in Explore, where others can make their own copy (remix).</p>
            <p className="text-sm text-slate-600">Do not publish private information: phone numbers or addresses of other people, passwords or anything you would not post publicly.</p>
            <button className="btn btn-primary w-full" disabled={busy} onClick={() => toggle(true)}><Icon.share /> Publish now</button>
          </>
        )}
        <div className="border-t border-slate-100 pt-4">
          <button className="flex items-center gap-1.5 text-sm font-semibold text-red-700 hover:underline" onClick={onDelete}><Icon.trash /> Delete project</button>
        </div>
      </div>
    </Modal>
  )
}
