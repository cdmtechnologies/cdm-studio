import { useEffect, useState } from 'react'

/** Hash routes (#/learn/web-css) so the app works on GitHub Pages with no server rules. */
export function useRoute(): string[] {
  const read = () => (location.hash.replace(/^#\/?/, '').split('?')[0] || '').split('/').filter(Boolean).map(decodeURIComponent)
  const [parts, setParts] = useState(read)
  useEffect(() => {
    const on = () => { setParts(read()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return parts
}

export const go = (path: string) => { location.hash = path.startsWith('#') ? path : `#/${path.replace(/^\//, '')}` }
export const href = (path: string) => `#/${path.replace(/^\//, '')}`

/** ?ref=CODE from a CDM partner's link is remembered for sign-up. */
export function rememberReferral() {
  try {
    const q = new URLSearchParams(location.search)
    const ref = (q.get('ref') || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 40)
    if (ref) localStorage.setItem('cdm-studio-ref', ref)
  } catch { /* ignore */ }
}
export const referralCode = () => { try { return localStorage.getItem('cdm-studio-ref') || '' } catch { return '' } }
