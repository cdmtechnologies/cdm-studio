// Pure helpers for studio-control (unit tested).
export function safeEqual(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
/** The claims of a token that Supabase has already verified (getUser). */
export function claims(token: string): Record<string, unknown> {
  try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) } catch { return {} }
}
const INTS: Record<string, [number, number]> = {
  free_builds_daily: [0, 1000], premium_builds_daily: [0, 5000], free_tutor_daily: [0, 1000], premium_tutor_daily: [0, 5000],
  price_monthly_ngn: [1, 10_000_000], price_yearly_ngn: [1, 100_000_000],
  free_data_daily: [0, 1000], min_topup_ngn: [100, 1_000_000], signup_credits: [0, 10000],
  lesson_price_credits: [0, 100000], min_payout_credits: [1, 10_000_000], proxy_daily_default: [1, 100000], exam_pass_pct: [1, 100],
}
const NUMS: Record<string, [number, number]> = { price_monthly_usd: [0.5, 10000], price_yearly_usd: [0.5, 100000], ai_cost_in_per_m: [0, 1000], ai_cost_out_per_m: [0, 1000],
  credit_price_ngn: [0.5, 100000], usd_ngn: [1, 100000], markup: [1, 20], min_topup_usd: [0.5, 1000],
  fast_in_per_m: [0, 1000], fast_out_per_m: [0, 1000], best_in_per_m: [0, 1000], best_out_per_m: [0, 1000], market_commission_pct: [0, 90] }
/** Only known settings, within sensible limits. */
export function cleanSettings(raw: unknown): Record<string, number | boolean> {
  const s = (raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}) as Record<string, unknown>
  const out: Record<string, number | boolean> = {}
  for (const k of ['ai_enabled', 'owner_two_step']) if (typeof s[k] === 'boolean') out[k] = s[k] as boolean
  for (const [k, [lo, hi]] of Object.entries(INTS)) { const n = Number(s[k]); if (k in s && Number.isFinite(n)) out[k] = Math.min(hi, Math.max(lo, Math.round(n))) }
  for (const [k, [lo, hi]] of Object.entries(NUMS)) { const n = Number(s[k]); if (k in s && Number.isFinite(n)) out[k] = Math.min(hi, Math.max(lo, Math.round(n * 1000) / 1000)) }
  return out
}
