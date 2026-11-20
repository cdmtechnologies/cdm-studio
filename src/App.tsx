import { lazy, Suspense, useEffect, useState, type FormEvent, type ReactElement } from 'react'
import { AuthProvider, useAuth } from './lib/auth'
import { useRoute, href } from './lib/router'
import { notConfigured, supabase } from './lib/supabase'
import { needsSecondStep, verifiedFactor, verifyCode } from './lib/twoStep'
import AuthModal from './components/AuthModal'
import { Alert, Icon, Spinner } from './components/ui'
import Landing from './pages/Landing'
import Learn from './pages/Learn'

const LessonPage = lazy(() => import('./pages/Lesson'))
const Build = lazy(() => import('./pages/Build'))
const ProjectPage = lazy(() => import('./pages/Project'))
const Explore = lazy(() => import('./pages/Explore'))
const View = lazy(() => import('./pages/View'))
const Account = lazy(() => import('./pages/Account'))
const Owner = lazy(() => import('./pages/Owner'))
const Data = lazy(() => import('./pages/Data'))
const Prompts = lazy(() => import('./pages/Prompts'))
const Market = lazy(() => import('./pages/Market'))
const Exam = lazy(() => import('./pages/Exam'))
const Certificate = lazy(() => import('./pages/Certificate'))

export default function App() {
  return (
    <AuthProvider>
      <Shell />
      <AuthModal />
    </AuthProvider>
  )
}

function Shell() {
  const route = useRoute()
  const [top] = route
  const { session, ready } = useAuth()
  const [gate, setGate] = useState(false)
  useEffect(() => { if (session) needsSecondStep().then(setGate); else setGate(false) }, [session])

  // a published project fills the whole screen
  if (top === 'p' && route[1]) return <Suspense fallback={<Spinner />}><View slug={route[1]} /></Suspense>
  if (notConfigured) return <div className="mx-auto max-w-lg p-6"><Alert>CDM Studio is being set up. Please check back soon.</Alert></div>
  if (ready && gate) return <TwoStep onDone={() => setGate(false)} />

  const full = (top === 'build' && !!route[1]) || (top === 'learn' && !!route[1])
  return (
    <div className="flex min-h-screen flex-col">
      <Header active={top || ''} />
      <main className={full ? 'flex-1' : 'mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6'}>
        <Suspense fallback={<Spinner />}>
          {top === 'learn' && route[1] ? <LessonPage id={route[1]} />
            : top === 'learn' ? <Learn />
            : top === 'build' && route[1] ? <ProjectPage id={route[1]} />
            : top === 'build' ? <Build />
            : top === 'explore' ? <Explore />
            : top === 'data' ? <Data />
            : top === 'prompts' ? <Prompts />
            : top === 'market' ? <Market />
            : top === 'exam' && route[1] ? <Exam track={route[1]} />
            : top === 'cert' && route[1] ? <Certificate code={route[1]} />
            : top === 'account' ? <Account />
            : top === 'owner' ? <Owner />
            : <Landing />}
        </Suspense>
      </main>
      {!full && <Footer />}
    </div>
  )
}

function Header({ active }: { active: string }) {
  const { session, credits, askSignIn } = useAuth()
  const link = (to: string, label: string, Ico: (p: { className?: string }) => ReactElement) => (
    <a href={href(to)} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold sm:px-3 ${active === to ? 'bg-violet-100 text-violet-800' : 'text-slate-600 hover:bg-slate-100'}`} aria-current={active === to ? 'page' : undefined}>
      <Ico className="hidden sm:block" />{label}
    </a>
  )
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:px-6">
        <a href="#/" className="mr-1 flex shrink-0 items-center gap-2 font-display sm:mr-2 text-lg font-bold text-slate-900">
          <img src="./icon.svg" alt="" width={28} height={28} />
          <span className="hidden sm:inline">CDM <span className="text-violet-700">Studio</span></span>
        </a>
        <nav className="no-scrollbar flex min-w-0 items-center gap-0.5 overflow-x-auto" aria-label="Main">
          {link('learn', 'Learn', Icon.book)}
          {link('build', 'Build', Icon.hammer)}
          {link('data', 'Data', Icon.chart)}
          {link('prompts', 'Prompts', Icon.sparkle)}
          {link('market', 'Market', Icon.star)}
          {link('explore', 'Explore', Icon.compass)}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {session && <a href={href('account')} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800" title="Your credits">{credits.toLocaleString()}<span className="hidden sm:inline"> credits</span></a>}
          {session
            ? <a href={href('account')} className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-800" aria-label="Your account"><Icon.user /></a>
            : <button className="btn btn-primary px-3 py-2" onClick={() => askSignIn('Create a free account to save your progress and your projects.')}>Sign in</button>}
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} CDM Technologies, Abuja. Learn and build with AI.</p>
        <p className="flex flex-wrap gap-4">
          <a className="hover:text-violet-700" href="https://cdmtechnologies.github.io">CDM Technologies</a>
          <a className="hover:text-violet-700" href="https://wa.me/2348064068800">WhatsApp 0806 406 8800</a>
          <a className="hover:text-violet-700" href="mailto:cdmtech26@gmail.com">cdmtech26@gmail.com</a>
        </p>
      </div>
    </footer>
  )
}

function TwoStep({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function go(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      const f = await verifiedFactor()
      if (!f) return onDone()
      await verifyCode(f.id, code)
      onDone()
    } catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  return (
    <div className="mx-auto mt-16 max-w-sm px-4">
      <form onSubmit={go} className="card space-y-4 p-6">
        <h1 className="text-xl font-bold">Two-step sign-in</h1>
        <p className="text-sm text-slate-600">Enter the 6-digit code from your authenticator app.</p>
        <input className="input text-center text-2xl tracking-[0.4em]" inputMode="numeric" autoComplete="one-time-code" maxLength={7} value={code} onChange={(e) => setCode(e.target.value)} autoFocus />
        {err && <Alert>{err}</Alert>}
        <button className="btn btn-primary w-full" disabled={busy || code.replace(/\s/g, '').length < 6}>Continue</button>
        <button type="button" className="w-full text-sm text-slate-500 hover:underline" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </form>
    </div>
  )
}
