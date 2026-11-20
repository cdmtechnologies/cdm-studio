import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../lib/auth'
import { go, href } from '../lib/router'
import { answerApi, buildDoc, listen, newNonce, SANDBOX, type ApiRequest } from '../lib/sandbox'
import { proxyCall } from '../lib/api'
import { supabase } from '../lib/supabase'
import { Alert, Icon, Modal, Spinner } from '../components/ui'

type Pub = { id: string; title: string; kind: string; html: string; views: number; updated_at: string; author: string; remix_of_slug: string | null }

/** A published project, full screen, with a slim bar: who made it, remix, report. */
export default function View({ slug }: { slug: string }) {
  const { session, askSignIn } = useAuth()
  const [p, setP] = useState<Pub | null | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [report, setReport] = useState(false)
  const [reason, setReason] = useState('')
  const [reported, setReported] = useState(false)
  const nonce = useRef(newNonce())
  const frame = useRef<HTMLIFrameElement>(null)
  // studio.api calls from the published page use the keys its owner allowed on published pages
  useEffect(() => listen(() => frame.current, () => nonce.current, (m) => {
    if (m.type === 'api') proxyCall(m as unknown as ApiRequest, { slug }).then((r) => answerApi(frame.current, nonce.current, Number(m.id), r))
  }), [slug])

  useEffect(() => {
    if (!/^[a-z0-9]{10}$/.test(slug)) { setP(null); return }
    supabase.rpc('open_published', { p_slug: slug }).then(({ data }) => {
      const row = (data as Pub[] | null)?.[0] ?? null
      setP(row)
      if (row) document.title = `${row.title} · made with CDM Studio`
    })
  }, [slug])

  async function remix() {
    if (!session) return askSignIn('Create a free account to remix this project and make it yours.')
    setBusy(true)
    const { data, error } = await supabase.rpc('remix_project', { p_slug: slug })
    setBusy(false)
    if (error) return alert(error.message)
    go(`build/${data}`)
  }

  async function sendReport() {
    if (!session) return askSignIn('Sign in to report a project.')
    if (!p || reason.trim().length < 3) return
    const { error } = await supabase.from('reports').insert({ project_id: p.id, reason: reason.trim().slice(0, 500) })
    if (error && !/duplicate/i.test(error.message)) return alert(error.message)
    setReported(true)
  }

  if (p === undefined) return <Spinner />
  if (p === null) return <div className="mx-auto max-w-md p-6"><Alert>This project is not available. It may have been unpublished. <a className="underline" href={href('explore')}>Explore others</a></Alert></div>

  return (
    <div className="flex h-screen flex-col bg-slate-900">
      <div className="flex flex-wrap items-center gap-2 bg-slate-950 px-3 py-2 text-sm text-slate-200">
        <a href="#/" className="flex items-center gap-1.5 font-semibold text-white"><img src="./icon.svg" alt="" width={22} height={22} /> CDM Studio</a>
        <span className="min-w-0 flex-1 truncate text-slate-400"><strong className="text-slate-100">{p.title}</strong> by {p.author}{p.remix_of_slug ? <> · remix of <a className="underline" href={href(`p/${p.remix_of_slug}`)}>another project</a></> : null}</span>
        <button className="btn bg-violet-600 px-3 py-1.5 text-white hover:bg-violet-500" disabled={busy} onClick={remix}><Icon.copy /> Remix</button>
        <a className="btn bg-white/10 px-3 py-1.5 text-white hover:bg-white/20" href={href('build')}><Icon.sparkle /> Make your own</a>
        <button className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10" onClick={() => setReport(true)} aria-label="Report this project" title="Report"><Icon.flag /></button>
      </div>
      <iframe ref={frame} title={p.title} sandbox={SANDBOX} srcDoc={buildDoc(p.html, nonce.current)} className="min-h-0 w-full flex-1 bg-white" />
      <Modal open={report} title="Report this project" onClose={() => setReport(false)}>
        {reported ? <Alert tone="ok">Thank you. We will look at it.</Alert> : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Tell us what is wrong: harmful, rude, a scam, someone's private information, or copied work.</p>
            <textarea className="input" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Reason" />
            <button className="btn btn-primary w-full" disabled={reason.trim().length < 3} onClick={sendReport}>Send report</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
