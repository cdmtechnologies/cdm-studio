import { useEffect, useState } from 'react'
import { COURSES } from '../lessons'
import { useAuth } from '../lib/auth'
import { loadDone, type Done } from '../lib/progress'
import { href } from '../lib/router'
import { supabase } from '../lib/supabase'
import { Alert, Spinner } from '../components/ui'

type Q = { n: number; question: string; options: string[] }
type Result = { score: number; passed: boolean; code: string | null; need: number; missing: number }

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
        <p className="text-slate-600">{qs?.length ?? course.course?.examQuestions} questions. Pass mark {res?.need ?? 70}%. Up to 3 tries a day. Finish every lesson to receive the certificate.</p>
      </div>
      {left.length > 0 && <Alert tone="info">You still have {left.length} lesson{left.length > 1 ? 's' : ''} to finish: {left.slice(0, 3).map((l) => <a key={l.id} className="mr-2 font-semibold underline" href={href(`learn/${l.id}`)}>{l.title}</a>)}{left.length > 3 ? '…' : ''} You can practise the exam now, but the certificate needs every lesson done.</Alert>}
      {res && (
        <div className={`card p-5 ${res.passed ? 'border-emerald-300 bg-emerald-50' : ''}`}>
          <p className="font-display text-4xl font-bold">{res.score}%</p>
          {res.passed && res.code ? (
            <><p className="mt-1 font-semibold text-emerald-900">Congratulations, you passed! 🎉</p><a className="btn btn-primary mt-3" href={href(`cert/${res.code}`)}>See your certificate</a></>
          ) : res.score >= res.need ? <p className="mt-1">You passed the exam. Finish the remaining {res.missing} lesson{res.missing > 1 ? 's' : ''}, then take it again for your certificate.</p>
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
