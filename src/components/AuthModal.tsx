import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { referralCode } from '../lib/router'
import { useAuth } from '../lib/auth'
import { Alert, Modal } from './ui'

/** Sign in, create an account, or get a password-reset email. */
export default function AuthModal() {
  const { signInAsk, closeSignIn } = useAuth()
  const [mode, setMode] = useState<'in' | 'up' | 'reset'>('up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ tone: 'error' | 'ok'; text: string } | null>(null)
  const back = `${location.origin}${location.pathname}`

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    const em = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(em)) return setMsg({ tone: 'error', text: 'Enter a valid email address.' })
    if (mode !== 'reset' && pw.length < 8) return setMsg({ tone: 'error', text: 'Use at least 8 characters for your password.' })
    setBusy(true)
    try {
      if (mode === 'in') {
        const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw })
        if (error) throw new Error(/invalid/i.test(error.message) ? 'Wrong email or password.' : /confirm/i.test(error.message) ? 'Open the link in the email we sent you first.' : error.message)
      } else if (mode === 'up') {
        const { data, error } = await supabase.auth.signUp({ email: em, password: pw, options: { emailRedirectTo: back, data: { name: name.trim().slice(0, 80), ref: referralCode() } } })
        if (error) throw new Error(/registered|exists/i.test(error.message) ? 'That email already has an account. Sign in instead.' : /weak|pwned|leaked/i.test(error.message) ? 'That password is too common. Choose a harder one.' : error.message)
        if (!data.session) setMsg({ tone: 'ok', text: `Almost done: we sent a link to ${em}. Open it to start.` })
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(em, { redirectTo: `${back}#/account?reset=1` })
        if (error) throw new Error(error.message)
        setMsg({ tone: 'ok', text: 'If that email has an account, a reset link is on its way.' })
      }
    } catch (err) {
      setMsg({ tone: 'error', text: (err as Error).message })
    } finally {
      setBusy(false)
    }
  }

  const title = mode === 'in' ? 'Sign in' : mode === 'up' ? 'Create your free account' : 'Reset your password'
  return (
    <Modal open={!!signInAsk} title={title} onClose={closeSignIn}>
      {signInAsk && <p className="mb-4 text-sm text-slate-600">{signInAsk}</p>}
      <form onSubmit={submit} className="space-y-3">
        {mode === 'up' && (
          <label className="block"><span className="label">Your name</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} /></label>
        )}
        <label className="block"><span className="label">Email</span><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
        {mode !== 'reset' && (
          <label className="block"><span className="label">Password</span><input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} minLength={8} required /></label>
        )}
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : mode === 'up' ? 'Create account' : 'Send reset link'}</button>
      </form>
      <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
        {mode !== 'in' && <button className="font-semibold text-violet-700 hover:underline" onClick={() => { setMode('in'); setMsg(null) }}>I have an account</button>}
        {mode !== 'up' && <button className="font-semibold text-violet-700 hover:underline" onClick={() => { setMode('up'); setMsg(null) }}>Create an account</button>}
        {mode === 'in' && <button className="text-slate-500 hover:underline" onClick={() => { setMode('reset'); setMsg(null) }}>Forgot password?</button>}
      </div>
      {mode === 'up' && <p className="mt-4 text-xs text-slate-500">Free forever for learning. By creating an account you agree to use CDM Studio kindly: no harmful, hateful or copied content.</p>}
    </Modal>
  )
}
