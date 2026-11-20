import { useEffect, useRef, useState } from 'react'
import { callFunction, type FnError } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Alert, Icon, Md } from './ui'
import { BuyCreditsLink } from './Credits'

export type Msg = { role: 'user' | 'assistant'; content: string }

/**
 * The AI tutor. In lessons it guides with hints (it does not hand over the full answer unless asked twice);
 * in "practice" lessons it answers the learner's prompt and then coaches them on how they asked.
 */
export default function Tutor({ lessonId, mode, code, starters, onReply, title = 'AI tutor' }: {
  lessonId?: string; mode: 'help' | 'practice'; code?: string; starters?: string[]; onReply?: (n: number) => void; title?: string
}) {
  const { session, askSignIn, refresh } = useAuth()
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<FnError | null>(null)
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { setMsgs([]); setErr(null) }, [lessonId])
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [msgs, busy])

  async function send(q: string) {
    const question = q.trim().slice(0, 2000)
    if (!question || busy) return
    if (!session) return askSignIn('Create a free account to ask the AI tutor.')
    const next: Msg[] = [...msgs, { role: 'user', content: question }]
    setMsgs(next); setText(''); setBusy(true); setErr(null)
    try {
      const r = await callFunction<{ reply: string }>('studio-tutor', { mode, lesson_id: lessonId, message: question, code: code?.slice(0, 20000), history: next.slice(-8, -1) })
      setMsgs([...next, { role: 'assistant', content: r.reply }])
      refresh()
      onReply?.(next.length)
    } catch (e) {
      setErr(e as FnError)
      setMsgs(msgs)
      setText(question)
    } finally { setBusy(false) }
  }

  return (
    <div className="flex min-h-0 flex-col">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-800"><Icon.sparkle /> {title}</p>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        {msgs.length === 0 && starters && (
          <div className="flex flex-wrap gap-2">
            {starters.map((s) => <button key={s} className="chip chip-off text-left" onClick={() => send(s)}>{s}</button>)}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'ml-8 rounded-2xl rounded-br-sm bg-violet-700 px-3 py-2 text-sm text-white' : 'mr-4 rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2 text-sm'}>
            {m.role === 'user' ? <p className="whitespace-pre-wrap">{m.content}</p> : <Md text={m.content} />}
          </div>
        ))}
        {busy && <p className="text-sm text-slate-500"><span className="animate-pulse">Thinking…</span></p>}
        {err && (
          <Alert>
            {err.message}{' '}
            <BuyCreditsLink err={err} />
          </Alert>
        )}
        <div ref={end} />
      </div>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); send(text) }}>
        <textarea className="input min-h-[44px] flex-1 resize-none" rows={2} value={text} onChange={(e) => setText(e.target.value)} maxLength={2000}
          placeholder={mode === 'practice' ? 'Write your prompt here…' : 'Ask about this lesson…'} aria-label="Message to the tutor"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(text) } }} />
        <button className="btn btn-primary self-end px-3" disabled={busy || !text.trim()} aria-label="Send"><Icon.send /></button>
      </form>
    </div>
  )
}
