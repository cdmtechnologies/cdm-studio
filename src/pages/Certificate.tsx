import { useEffect, useState } from 'react'
import { href } from '../lib/router'
import { supabase } from '../lib/supabase'
import { Alert, Spinner } from '../components/ui'

type Cert = { code: string; name: string; title: string; score: number; issued_at: string }

/** A certificate anyone can open and check, and print or save as PDF. */
export default function Certificate({ code }: { code: string }) {
  const [c, setC] = useState<Cert | null | undefined>(undefined)
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!/^CDM-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(code)) { setC(null); return }
    supabase.rpc('verify_certificate', { p_code: code }).then(({ data }) => setC((data as Cert[] | null)?.[0] ?? null))
  }, [code])
  if (c === undefined) return <Spinner />
  if (c === null) return <div className="mx-auto max-w-md"><Alert>No certificate has the code {code}. Check it was typed exactly.</Alert></div>
  const url = `${location.origin}${location.pathname}#/cert/${c.code}`
  const date = new Date(c.issued_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="cert relative overflow-hidden rounded-3xl border-8 border-double border-violet-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-100" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-100" />
        <div className="relative space-y-4">
          <p className="flex items-center justify-center gap-2 font-display font-bold text-violet-800"><img src="./icon.svg" alt="" width={28} height={28} /> CDM Studio</p>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Certificate of completion</p>
          <p className="text-slate-600">This certifies that</p>
          <p className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">{c.name}</p>
          <p className="text-slate-600">has completed every lesson and passed the final exam of</p>
          <p className="font-display text-2xl font-bold text-violet-800">{c.title}</p>
          <p className="text-slate-600">with a score of <b>{c.score}%</b> on {date}</p>
          <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-slate-500 sm:flex-row">
            <span>Certificate ID <b className="font-mono text-slate-700">{c.code}</b></span>
            <span>Verify at {location.host}{location.pathname}#/cert/{c.code}</span>
            <span>CDM Technologies, Abuja</span>
          </div>
        </div>
      </div>
      <div className="no-print flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={() => print()}>Print or save as PDF</button>
        <button className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(url).then(() => setCopied(true))}>{copied ? 'Link copied' : 'Copy verification link'}</button>
        <a className="btn btn-ghost" href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(c.title)}&organizationName=${encodeURIComponent('CDM Technologies')}&issueYear=${new Date(c.issued_at).getFullYear()}&issueMonth=${new Date(c.issued_at).getMonth() + 1}&certId=${c.code}&certUrl=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">Add to LinkedIn</a>
        <a className="btn btn-ghost" href={href('learn')}>More courses</a>
      </div>
    </div>
  )
}
