// Pure helpers for studio-pay (unit tested).
/** Paystack sends the person back only to the site they paid from (any address the app is served on). */
export function returnUrl(raw: unknown, origin: string | null): string | undefined {
  if (typeof raw !== 'string' || !origin || raw.length > 500) return undefined
  if (!/^https:\/\/[a-z0-9.-]+(:\d+)?$|^http:\/\/localhost(:\d+)?$/i.test(origin)) return undefined
  return raw.startsWith(origin + '/') && !/[\s<>"]/.test(raw) ? raw : undefined
}

