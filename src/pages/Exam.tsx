import { useEffect, useState } from 'react'
import { COURSES } from '../lessons'
import { useAuth } from '../lib/auth'
import { loadDone, type Done } from '../lib/progress'
import { href } from '../lib/router'
import { supabase } from '../lib/supabase'
import { Alert, Md, Spinner } from '../components/ui'

type Q = { n: number; question: string; options: string[] }
type Result = { score: number; passed: boolean; code: string | null; need: number; missing: number; project_ok: boolean }

/** A course's final exam: marked on the server; a pass with every lesson done gives a certificate. */
export default function Exam({ track }: { track: string }) {
  const course = COURSES.find((c) => c.id === track)
  const { session, ready, profile, askSignIn } = useAuth()
  const [qs, setQs] = useState<Q[] | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [name, setName] = useState('')
  const [done, setDone] = useState<Done>({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [res, setRes] = useState<Result | null>(null)
  useEffect(() => { setName(profile?.name ?? '') }, [profile])
  useEffect(() => {
    if (!session || !course) return
    loadDone(session.user.id).then(setDone).catch(() => {})
    supabase.rpc('exam_paper', { p_track: track }).then(({ data, error }) => { if (error) setErr(error.message); else setQs((data as Q[]) ?? []) })
  }, [session, course, track])

  if (!course) return <Alert>That course was not found.</Alert>
  if (!ready) return <Spinner />
  if (!session) return <div className="mx-auto max-w-md"><Alert tone="info">Sign in to take the exam. <button className="font-semibold underline" onClick={() => askSignIn('Sign in to take the final exam.')}>Sign in</button></Alert></div>
  const left = course.lessons.filter((l) => !done[l.id])

  async function submit() {
    if (!qs) return
    if (Object.keys(answers).length < qs.length) return setErr('Answer every question first.')
    setBusy(true); setErr('')
    const arr: number[] = []
    for (const q of qs) arr[q.n - 1] = answers[q.n]
    const { data, error } = await supabase.rpc('submit_exam', { p_track: track, p_answers: arr, p_name: name.trim() })
    setBusy(false)
    if (error) return setErr(error.message)
    setRes((data as Result[])[0]); window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-violet-700">{course.emoji} {course.title}</p>
        <h1 className="font-display text-3xl font-bold">Final exam</h1>
        <p className="text-slate-600">{qs?.length ?? course.course?.examQuestions} questions. Pass mark {res?.need ?? 70}%. Up to 3 tries a day. Finish every lesson{course.course?.project ? ' and pass the final project' : ''} to receive the certificate.</p>
      </div>
      {course.course?.project && <FinalProject track={track} project={course.course.project} />}
      {left.length > 0 && <Alert tone="info">You still have {left.length} lesson{left.length > 1 ? 's' : ''} to finish: {left.slice(0, 3).map((l) => <a key={l.id} className="mr-2 font-semibold underline" href={href(`learn/${l.id}`)}>{l.title}</a>)}{left.length > 3 ? '…' : ''} You can practise the exam now, but the certificate needs every lesson done.</Alert>}
      {res && (
        <div className={`card p-5 ${res.passed ? 'border-emerald-300 bg-emerald-50' : ''}`}>
          <p className="font-display text-4xl font-bold">{res.score}%</p>
          {res.passed && res.code ? (
            <><p className="mt-1 font-semibold text-emerald-900">Congratulations, you passed! 🎉</p><a className="btn btn-primary mt-3" href={href(`cert/${res.code}`)}>See your certificate</a></>
          ) : res.score >= res.need ? <p className="mt-1">You passed the exam.{res.missing > 0 ? ` Finish the remaining ${res.missing} lesson${res.missing > 1 ? 's' : ''}.` : ''}{res.project_ok === false ? ' Pass the final project above.' : ''} Then take the exam again for your certificate.</p>
            : <p className="mt-1">Not yet: you need {res.need}%. Review the lessons and try again.</p>}
        </div>
      )}
      {err && <Alert>{err}</Alert>}
      {!qs ? <Spinner /> : (
        <div className="card space-y-6 p-5">
          {qs.map((q, i) => (
            <fieldset key={q.n} className="space-y-2">
              <legend className="font-medium">{i + 1}. {q.question}</legend>
              {q.options.map((o, j) => (
                <label key={j} className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-sm ${answers[q.n] === j ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name={`q${q.n}`} className="mt-1 accent-violet-700" checked={answers[q.n] === j} onChange={() => setAnswers({ ...answers, [q.n]: j })} />{o}
                </label>
              ))}
            </fieldset>
          ))}
          <label className="block"><span className="label">Your full name, as it should appear on the certificate</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></label>
          <button className="btn btn-primary" disabled={busy} onClick={submit}>{busy ? 'Marking…' : 'Submit answers'}</button>
        </div>
      )}
    </div>
  )
}

type Project = { title: string; brief: string; lang: string; rubric: string[]; pass_pct: number }
type Mark = { score: number; passed: boolean; need: number; items: { n: number; item: string; met: boolean; comment: string }[]; summary: string }

/** The graded final project: the learner sends one of their Studio projects (or pastes code) and AI marks it against the checklist. */
function FinalProject({ track, project }: { track: string; project: Project }) {
  const [mine, setMine] = useState<{ id: string; title: string }[]>([])
  const [pick, setPick] = useState('')
  const [code, setCode] = useState('')
  const [best, setBest] = useState<{ score: number; passed: boolean } | null>(null)
  const [mark, setMark] = useState<Mark | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const pasted = project.lang !== 'html'
  useEffect(() => {
    if (!pasted) supabase.from('projects').select('id, title').order('updated_at', { ascending: false }).limit(50).then(({ data }) => setMine((data as { id: string; title: string }[]) ?? []))
    supabase.from('project_submissions').select('score, passed').eq('track', track).order('score', { ascending: false }).limit(1).then(({ data }) => setBest(data?.[0] ?? null))
  }, [track, pasted])

  async function send() {
    setErr(''); setBusy(true)
    const { data, error } = await supabase.functions.invoke('studio-grade', { body: pasted ? { track, code } : { track, project_id: pick } })
    setBusy(false)
    if (error || data?.error) return setErr(data?.error ?? 'Marking failed. Please try again.')
    setMark(data as Mark)
    if (!best || data.score > best.score) setBest({ score: data.score, passed: data.passed })
  }
  const what = project.lang === 'python' ? 'Python code' : project.lang === 'sql' ? 'SQL queries' : project.lang === 'text' ? 'written plan' : 'Studio project'
  return (
    <section className="card space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Final project</p><h2 className="font-display text-xl font-bold">{project.title}</h2></div>
        {best && <span className={`rounded-full px-3 py-1 text-sm font-bold ${best.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{best.passed ? `Passed · ${best.score}%` : `Best so far ${best.score}%`}</span>}
      </div>
      <Md text={project.brief} />
      <div>
        <p className="font-semibold">The marker checks that your work:</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-slate-700">{project.rubric.map((r) => <li key={r}>{r}</li>)}</ol>
        <p className="mt-2 text-sm text-slate-500">Pass mark {project.pass_pct}%. Up to 3 submissions a day. The marking is free.</p>
      </div>
      {pasted ? (
        <label className="block"><span className="label">Paste your {what}</span>
          <textarea className="input min-h-48 font-mono text-sm" value={code} onChange={(e) => setCode(e.target.value)} maxLength={40000} spellCheck={false} /></label>
      ) : (
        <label className="block"><span className="label">Choose the Studio project you built for this</span>
          <select className="input" value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">Choose a project…</option>
            {mine.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          {mine.length === 0 && <span className="mt-1 block text-sm text-slate-500">Build it first: <a className="font-semibold underline" href={href('build')}>start a new project</a>.</span>}
        </label>
      )}
      <button className="btn btn-primary" disabled={busy || (pasted ? code.trim().length < 40 : !pick)} onClick={send}>{busy ? 'Marking… (about 30 seconds)' : 'Submit for marking'}</button>
      {err && <Alert>{err}</Alert>}
      {mark && (
        <div className={`space-y-3 rounded-2xl border p-4 ${mark.passed ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
          <p className="font-display text-3xl font-bold">{mark.score}% <span className="text-base font-semibold">{mark.passed ? 'Passed 🎉' : `Not yet: you need ${mark.need}%`}</span></p>
          <p className="text-sm">{mark.summary}</p>
          <ul className="space-y-2 text-sm">{mark.items.map((i) => <li key={i.n} className="flex gap-2"><span aria-hidden>{i.met ? '✅' : '⬜'}</span><span><b>{i.item}</b>{i.comment ? <> — {i.comment}</> : null}</span></li>)}</ul>
        </div>
      )}
    </section>
  )
}
