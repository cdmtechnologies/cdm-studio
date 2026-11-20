import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Marked } from 'marked'

const I = (d: ReactNode, size = 18) => ({ className = '' }: { className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{d}</svg>
)
export const Icon = {
  x: I(<path d="M18 6 6 18M6 6l12 12" />),
  check: I(<path d="M20 6 9 17l-5-5" />),
  play: I(<path d="M7 4v16l13-8z" />),
  sparkle: I(<path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" />),
  code: I(<><path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" /></>),
  eye: I(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>),
  share: I(<><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></>),
  undo: I(<><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-15-6.7L3 13" /></>),
  trash: I(<><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></>),
  left: I(<path d="m15 18-6-6 6-6" />),
  right: I(<path d="m9 18 6-6-6-6" />),
  user: I(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  book: I(<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" /><path d="M4 19.5V21h16" /></>),
  hammer: I(<><path d="m15 12-8.5 8.5a2.1 2.1 0 0 1-3-3L12 9" /><path d="M17.6 15 22 10.6l-6.6-6.6L11 8.4z" /></>),
  compass: I(<><circle cx="12" cy="12" r="10" /><path d="m16 8-2 6-6 2 2-6z" /></>),
  download: I(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>),
  copy: I(<><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>),
  external: I(<><path d="M15 3h6v6M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>),
  lock: I(<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>),
  send: I(<><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></>),
  refresh: I(<><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5M3 21v-5h5" /></>),
  bug: I(<><rect x="8" y="6" width="8" height="14" rx="4" /><path d="M19 7l-3 2M5 7l3 2M19 13h-3M5 13h3M19 19l-3-2M5 19l3-2M9 3l1.5 2M15 3l-1.5 2" /></>),
  flag: I(<><path d="M4 22V4" /><path d="M4 4h13l-2 4 2 4H4" /></>),
  star: I(<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />),
  menu: I(<path d="M3 6h18M3 12h18M3 18h18" />),
  phone: I(<><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></>),
  monitor: I(<><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>),
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-slate-500" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-700" />{label}
    </div>
  )
}

export function Modal({ open, title, onClose, children, wide = false }: { open: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); prev?.focus?.() }
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={`flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-md'}`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close"><Icon.x /></button>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export function Alert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'ok' | 'info' }) {
  const c = tone === 'ok' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : tone === 'info' ? 'bg-violet-50 text-violet-900 border-violet-200' : 'bg-red-50 text-red-800 border-red-200'
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${c}`}>{children}</div>
}

// Markdown: lessons are ours; AI replies are not, so raw HTML is never rendered and links must be http(s).
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
const md = new Marked({ gfm: true, breaks: true })
md.use({
  renderer: {
    html: ({ text }) => esc(text),
    link(token) {
      const inner = this.parser.parseInline(token.tokens)
      const h = token.href
      return /^https?:\/\//i.test(h) || h.startsWith('#/') ? `<a href="${h.replace(/"/g, '%22').replace(/</g, '%3C')}" ${h.startsWith('#') ? '' : 'target="_blank" rel="noopener noreferrer"'}>${inner}</a>` : inner
    },
    image(token) { return esc(token.text) },
  },
})
export function Md({ text, className = '' }: { text: string; className?: string }) {
  const html = useMemo(() => md.parse(text || '') as string, [text])
  return <div className={`prose-cdm ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}

/** A plain code editor: line numbers, Tab inserts spaces. */
export function CodeEditor({ value, onChange, label = 'Code', minRows = 14, readOnly = false }: { value: string; onChange?: (v: string) => void; label?: string; minRows?: number; readOnly?: boolean }) {
  const lines = Math.max(minRows, value.split('\n').length)
  const ta = useRef<HTMLTextAreaElement>(null)
  const gutter = useRef<HTMLDivElement>(null)
  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-xl bg-slate-950 font-mono text-[13px] leading-6 text-slate-100">
      <div ref={gutter} aria-hidden="true" className="select-none overflow-hidden bg-slate-900 px-2 py-3 text-right text-slate-500">
        {Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <textarea
        ref={ta} aria-label={label} value={value} readOnly={readOnly} spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off"
        onScroll={(e) => { if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop }}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Tab' || readOnly) return
          e.preventDefault()
          const t = e.currentTarget, s = t.selectionStart, en = t.selectionEnd
          const v = t.value.slice(0, s) + '  ' + t.value.slice(en)
          onChange?.(v)
          requestAnimationFrame(() => { if (ta.current) ta.current.selectionStart = ta.current.selectionEnd = s + 2 })
        }}
        className="min-h-0 flex-1 resize-none whitespace-pre bg-transparent px-3 py-3 outline-none"
        style={{ tabSize: 2 }}
      />
    </div>
  )
}

export const fmtDate = (s: string) => new Date(s).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
export const ago = (s: string) => {
  const m = Math.round((Date.now() - new Date(s).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  return fmtDate(s)
}
