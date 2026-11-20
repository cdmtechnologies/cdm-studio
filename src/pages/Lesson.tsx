import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { findLesson, nextLesson, type Lesson } from '../lessons'
import { useAuth } from '../lib/auth'
import { dropCode, keepCode, markDone, savedCode } from '../lib/progress'
import { href } from '../lib/router'
import { buildDoc, cleanError, listen, newNonce, runChecks, SANDBOX, type CheckResult } from '../lib/sandbox'
import Tutor from '../components/Tutor'
import { Alert, CodeEditor, Icon, Md } from '../components/ui'

export default function LessonPage({ id }: { id: string }) {
  const found = findLesson(id)
  if (!found) return <div className="mx-auto max-w-lg p-6"><Alert>That lesson was not found. <a className="underline" href={href('learn')}>All lessons</a></Alert></div>
  return <LessonView key={id} lesson={found.lesson} trackTitle={found.track.title} index={found.index} total={found.track.lessons.length} />
}

function LessonView({ lesson, trackTitle, index, total }: { lesson: Lesson; trackTitle: string; index: number; total: number }) {
  const { session } = useAuth()
  const uid = session?.user.id ?? null
  const [finished, setFinished] = useState(false)
  const next = nextLesson(lesson.id)

  const complete = useCallback(async (code?: string) => {
    if (finished) return
    setFinished(true)
    await markDone(uid, lesson.id, code).catch(() => {})
  }, [finished, uid, lesson.id])

  const header = (
    <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
      <a href={href('learn')} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="All lessons"><Icon.left /></a>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{trackTitle} · lesson {index + 1} of {total}</p>
        <h1 className="truncate font-display text-lg font-bold">{lesson.title}</h1>
      </div>
    </div>
  )
  const done = finished && (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="font-semibold text-emerald-900">🎉 Lesson done!</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {next ? <a href={href(`learn/${next.id}`)} className="btn btn-primary">Next: {next.title} →</a> : <a href={href('learn')} className="btn btn-primary">Back to all lessons</a>}
        <a href={href('build')} className="btn btn-ghost"><Icon.sparkle /> Build something with AI</a>
      </div>
    </div>
  )

  if (lesson.kind !== 'code') {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-slate-50">
        {header}
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_380px]">
          <article className="card space-y-6 p-6">
            <Md text={lesson.body} />
            {lesson.quiz && <Quiz lesson={lesson} onPass={() => { if (lesson.kind === 'read') complete() }} />}
            {lesson.kind === 'prompt' && !finished && <p className="text-sm text-slate-500">Try it with the tutor, then press <strong>I've practised this</strong>.</p>}
            {lesson.kind === 'prompt' && !finished && <button className="btn btn-ghost" onClick={() => complete()}>I've practised this</button>}
            {done}
          </article>
          {lesson.kind === 'prompt' && (
            <aside className="card flex h-[70vh] flex-col p-4 lg:sticky lg:top-20">
              {lesson.practice && <p className="mb-3 rounded-xl bg-violet-50 p-3 text-sm text-violet-900">{lesson.practice}</p>}
              <Tutor lessonId={lesson.id} mode="practice" title="Practise with AI" />
            </aside>
          )}
          {lesson.kind === 'read' && (
            <aside className="card flex h-[60vh] flex-col p-4 lg:sticky lg:top-20">
              <Tutor lessonId={lesson.id} mode="help" starters={['Explain this more simply', 'Give me a real example from Nigeria']} />
            </aside>
          )}
        </div>
      </div>
    )
  }
  return <CodeLesson lesson={lesson} header={header} done={done} finished={finished} complete={complete} />
}

function CodeLesson({ lesson, header, done, finished, complete }: { lesson: Lesson; header: ReactNode; done: ReactNode; finished: boolean; complete: (code?: string) => void }) {
  const [code, setCode] = useState(() => savedCode(lesson.id) ?? lesson.starter ?? '')
  const [doc, setDoc] = useState({ html: '', nonce: '' })
  const [results, setResults] = useState<CheckResult[] | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [tab, setTab] = useState<'lesson' | 'code' | 'preview' | 'tutor'>('lesson')
  const [showHint, setShowHint] = useState(false)
  const frame = useRef<HTMLIFrameElement>(null)
  const nonceRef = useRef('')

  const run = useCallback((src: string) => {
    const nonce = newNonce()
    nonceRef.current = nonce
    setErrors([]); setResults(null)
    setDoc({ html: buildDoc(src, nonce), nonce })
  }, [])

  useEffect(() => { run(code) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(() => keepCode(lesson.id, code), 400); return () => clearTimeout(t) }, [code, lesson.id])
  useEffect(() => listen(() => frame.current, () => nonceRef.current, (m) => {
    if (m.type === 'ready') runChecks(frame.current, nonceRef.current, lesson.checks ?? [])
    if (m.type === 'error') setErrors((e) => [...e, cleanError(m.message) + (m.line ? ` (line ${m.line})` : '')].slice(-5))
    if (m.type === 'checks') {
      const r = m.results as CheckResult[]
      setResults(r)
      if (r.length && r.every((x) => x.ok)) complete(code)
    }
  }), [lesson.checks, complete, code])

  const passed = results?.filter((r) => r.ok).length ?? 0
  const tabs = [['lesson', 'Lesson'], ['code', 'Code'], ['preview', 'Result'], ['tutor', 'Tutor']] as const

  const left = (
    <div className="space-y-5">
      <Md text={lesson.body} />
      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-violet-700">Your task</p>
        <p className="mt-1 font-medium text-violet-950">{lesson.task}</p>
      </div>
      <Checks lesson={lesson} results={results} />
      {lesson.hint && (showHint
        ? <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><p className="font-semibold">Hint</p><code className="mt-1 block whitespace-pre-wrap break-words font-mono text-xs">{lesson.hint}</code></div>
        : <button className="text-sm font-semibold text-amber-700 hover:underline" onClick={() => setShowHint(true)}>Show a hint</button>)}
      {done}
    </div>
  )
  const editor = (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex items-center gap-2">
        <button className="btn btn-primary" onClick={() => { run(code); setTab('preview') }}><Icon.play /> Run and check</button>
        <button className="btn btn-ghost" onClick={() => { if (confirm('Start this lesson\'s code again?')) { dropCode(lesson.id); setCode(lesson.starter ?? ''); run(lesson.starter ?? '') } }}><Icon.undo /> Reset</button>
        {results && <span className={`ml-auto text-sm font-semibold ${passed === results.length ? 'text-emerald-700' : 'text-slate-600'}`}>{passed}/{results.length} steps</span>}
      </div>
      <div className="min-h-[280px] flex-1"><CodeEditor value={code} onChange={setCode} label="Lesson code" /></div>
    </div>
  )
  const preview = (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <iframe ref={frame} title="Your result" sandbox={SANDBOX} srcDoc={doc.html} className="min-h-[220px] w-full flex-1 rounded-xl border border-slate-200 bg-white" />
      {errors.length > 0 && <Alert><p className="font-semibold">Your code has an error</p>{errors.map((e, i) => <p key={i} className="font-mono text-xs">{e}</p>)}<p className="mt-1">Ask the tutor what it means.</p></Alert>}
    </div>
  )
  const tutor = <Tutor lessonId={lesson.id} mode="help" code={code} starters={['I am stuck, give me a hint', 'What does my error mean?', 'Explain my code line by line']} />

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col bg-slate-50">
      {header}
      {/* phones: tabs */}
      <div className="flex border-b border-slate-200 bg-white lg:hidden" role="tablist">
        {tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`flex-1 py-2.5 text-sm font-semibold ${tab === k ? 'border-b-2 border-violet-700 text-violet-800' : 'text-slate-500'}`}>{l}{k === 'lesson' && results ? ` ${passed}/${results.length}` : ''}</button>)}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3 lg:hidden">
        <div className={tab === 'lesson' ? '' : 'hidden'}><div className="card p-4">{left}</div></div>
        <div className={tab === 'code' ? 'h-full' : 'hidden'}>{editor}</div>
        <div className={tab === 'preview' ? 'h-full' : 'hidden'}>{preview}</div>
        <div className={tab === 'tutor' ? 'card flex h-full flex-col p-3' : 'hidden'}>{tutor}</div>
      </div>
      {/* computers: three panes */}
      <div className="hidden min-h-0 flex-1 gap-3 p-3 lg:grid lg:grid-cols-[minmax(320px,1fr)_minmax(0,1.3fr)]">
        <div className="card min-h-0 overflow-y-auto p-5">{left}<div className="mt-6 flex h-[420px] flex-col border-t border-slate-100 pt-4">{tutor}</div></div>
        <div className="grid min-h-0 grid-rows-[1.1fr_1fr] gap-3">{editor}{preview}</div>
      </div>
      {finished && <span className="sr-only" role="status">Lesson complete</span>}
    </div>
  )
}

function Checks({ lesson, results }: { lesson: Lesson; results: CheckResult[] | null }) {
  return (
    <ul className="space-y-1.5" aria-label="Steps">
      {(lesson.checks ?? []).map((c, i) => {
        const r = results?.[i]
        return (
          <li key={c.label} className="flex items-start gap-2 text-sm">
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${r?.ok ? 'bg-emerald-500 text-white' : r ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-500'}`}>{r?.ok ? '✓' : r ? '✗' : i + 1}</span>
            <span className={r?.ok ? 'text-emerald-800' : 'text-slate-700'}>{c.label}{r && !r.ok && r.error ? <span className="block text-xs text-red-700">{r.error}</span> : null}</span>
          </li>
        )
      })}
    </ul>
  )
}

function Quiz({ lesson, onPass }: { lesson: Lesson; onPass: () => void }) {
  const qs = lesson.quiz ?? []
  const [picked, setPicked] = useState<(number | null)[]>(() => qs.map(() => null))
  const allRight = qs.length > 0 && picked.every((p, i) => p === qs[i].answer)
  useEffect(() => { if (allRight) onPass() }, [allRight]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="space-y-4 border-t border-slate-100 pt-5">
      <h2 className="font-display text-lg font-bold">Quick check</h2>
      {qs.map((q, i) => (
        <fieldset key={q.q} className="space-y-2">
          <legend className="font-medium">{q.q}</legend>
          {q.options.map((o, j) => {
            const chosen = picked[i] === j
            const tone = chosen ? (j === q.answer ? 'border-emerald-400 bg-emerald-50' : 'border-red-300 bg-red-50') : 'border-slate-200 hover:bg-slate-50'
            return (
              <label key={o} className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-sm ${tone}`}>
                <input type="radio" name={`q${i}`} className="mt-1 accent-violet-700" checked={chosen} onChange={() => setPicked((p) => p.map((x, k) => (k === i ? j : x)))} />{o}
              </label>
            )
          })}
          {picked[i] !== null && <p className={`text-sm ${picked[i] === q.answer ? 'text-emerald-800' : 'text-red-700'}`}>{picked[i] === q.answer ? 'Correct. ' : 'Not quite. '}{picked[i] === q.answer ? q.why : 'Try another answer.'}</p>}
        </fieldset>
      ))}
    </div>
  )
}
