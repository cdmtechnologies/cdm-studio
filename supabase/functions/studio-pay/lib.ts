// Pure helpers for studio-pay (unit tested).
/** Paystack sends the person back only to the site they paid from (any address the app is served on). */
export function returnUrl(raw: unknown, origin: string | null): string | undefined {
  if (typeof raw !== 'string' || !origin || raw.length > 500) return undefined
  if (!/^https:\/\/[a-z0-9.-]+(:\d+)?$|^http:\/\/localhost(:\d+)?$/i.test(origin)) return undefined
  return raw.startsWith(origin + '/') && !/[\s<>"]/.test(raw) ? raw : undefined
}


export type CreditSettings = { credit_price_ngn: number; usd_ngn: number; min_topup_ngn: number; min_topup_usd: number }
/** A top-up of any amount (from the minimum up to a sensible cap). Credits are worked out here, never taken from the browser. */
export function topUp(rawAmount: unknown, currency: 'NGN' | 'USD', s: CreditSettings): { amount: number; credits: number } | { error: string } {
  const a = Number(rawAmount)
  if (!Number.isFinite(a) || a <= 0) return { error: 'Enter an amount.' }
  const amount = currency === 'USD' ? Math.round(a * 100) / 100 : Math.round(a)
  const min = currency === 'USD' ? Number(s.min_topup_usd) : Number(s.min_topup_ngn)
  const max = currency === 'USD' ? 5000 : 5_000_000
  if (amount < min) return { error: `The smallest top-up is ${currency === 'USD' ? '$' : '₦'}${min.toLocaleString('en-NG')}.` }
  if (amount > max) return { error: `The largest single top-up is ${currency === 'USD' ? '$' : '₦'}${max.toLocaleString('en-NG')}.` }
  const naira = currency === 'USD' ? amount * Number(s.usd_ngn) : amount
  const credits = Math.floor(naira / Number(s.credit_price_ngn))
  if (credits < 1) return { error: 'That amount is too small.' }
  return { amount, credits }
}
