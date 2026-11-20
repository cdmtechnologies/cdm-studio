import { useEffect, useState } from 'react'
import { COURSES, TRACKS, LESSON_COUNT, type Track } from '../lessons'
import { useAuth } from '../lib/auth'
import { loadDone, type Done } from '../lib/progress'
import { href } from '../lib/router'
import { COLOURS } from './Landing'

const KIND = { code: 'Code', prompt: 'Practise with AI', read: 'Read + quiz' }

export default function Learn() {
  const { session } = useAuth()
  const [done, setDone] = useState<Done>({})
  useEffect(() => { loadDone(session?.user.id ?? null).then(setDone).catch(() => {}) }, [session])
  const count = Object.keys(done).length
  const nextUp = TRACKS.flatMap((t) => t.lessons).find((l) => !done[l.id])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Learn</h1>
          <p className="mt-1 text-slate-600">Short, hands-on lessons. Your code is checked as you go.</p>
        </div>
        <div className="card flex items-center gap-4 p-4">
          <div className="relative h-14 w-14">
            <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90"><circle cx="18" cy="18" r="15.5" fill="none" stroke="#ede9fe" strokeWidth="4" /><circle cx="18" cy="18" r="15.5" fill="none" stroke="#6d28d9" strokeWidth="4" strokeDasharray={`${(count / LESSON_COUNT) * 97.4} 97.4`} strokeLinecap="round" /></svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{count}</span>
          </div>
          <div>
            <p className="text-sm font-semibold">{count} of {LESSON_COUNT} lessons done</p>
            {nextUp && <a href={href(`learn/${nextUp.id}`)} className="text-sm font-semibold text-violet-700 hover:underline">Next: {nextUp.title} →</a>}
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold">🎓 Certified courses</h2>
          <p className="text-slate-600">In-demand skills, step by step. The first lessons are free; unlock the rest one at a time with credits ({'≈'}₦200 a lesson), pass the final exam and get a certificate anyone can verify.</p>
        </div>
        {COURSES.map((t) => <TrackCard key={t.id} t={t} done={done} />)}
      </section>
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Free beginner tracks</h2>
          <p className="text-slate-600">Every lesson free. Start here if you are new to AI or coding.</p>
        </div>
        {TRACKS.map((t) => <TrackCard key={t.id} t={t} done={done} />)}
      </section>
    </div>
  )
}

function TrackCard({ t, done }: { t: Track; done: Done }) {
        const n = t.lessons.filter((l) => done[l.id]).length
        return (
          <section key={t.id} className="card overflow-hidden">
            <div className={`flex items-center gap-4 bg-gradient-to-r p-5 text-white ${COLOURS[t.colour]}`}>
              <span className="text-4xl" aria-hidden="true">{t.emoji}</span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-bold">{t.title}</h2>
                <p className="text-sm text-white/90">{t.blurb}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">{n}/{t.lessons.length}</span>
            </div>
            <ol className="divide-y divide-slate-100">
              {t.lessons.map((l, i) => (
                <li key={l.id}>
                  <a href={href(`learn/${l.id}`)} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done[l.id] ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{done[l.id] ? '✓' : i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{l.title}</span>
                      <span className="text-xs text-slate-500">{KIND[l.kind]} · {l.minutes} min{t.course ? (l.paid ? ' · 🔒 unlock with credits' : ' · free') : ''}</span>
                    </span>
                    <span className="text-slate-400">›</span>
                  </a>
                </li>
              ))}
            </ol>
            {t.course && (
              <div className="grid gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p><b>{t.course.level}</b> · about {t.course.hours} hours · {t.course.free} free lessons · final exam of {t.course.examQuestions} questions</p>
                  <p className="text-slate-600">Skills: {t.course.skills.join(', ')}</p>
                  <p className="text-slate-600">Leads to: {t.course.careers.join(', ')}</p>
                </div>
                <a href={href(`exam/${t.id}`)} className={`btn ${n === t.lessons.length ? 'btn-primary' : 'btn-ghost'}`}>🎓 Final exam</a>
              </div>
            )}
            {t.soon && <p className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-sm text-slate-600">Coming next: {t.soon}</p>}
          </section>
        )
}
