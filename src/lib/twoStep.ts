// Two-step sign-in with an authenticator app (Google Authenticator, Microsoft Authenticator, Authy...).
import { supabase } from './supabase'

/** True when this person has two-step sign-in on but has not entered the code in this session. */
export async function needsSecondStep(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (error || !data) return false
    return data.nextLevel === 'aal2' && data.currentLevel !== 'aal2'
  } catch {
    return false
  }
}

export async function verifiedFactor(): Promise<{ id: string; friendly_name?: string } | null> {
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) throw new Error(error.message)
  return (data?.totp || []).find((f: any) => f.status === 'verified') || null
}

export async function verifyCode(factorId: string, code: string): Promise<void> {
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.replace(/\s/g, '') })
  if (error) throw new Error(/invalid|expired/i.test(error.message) ? 'That code is wrong or has expired. Check the time on your phone and try the newest code.' : error.message)
}

/** Starts setting up: returns the QR code to scan and the secret to type in manually. */
export async function startEnrol(): Promise<{ factorId: string; qr: string; secret: string }> {
  // remove any half-finished set-up first
  const { data: list } = await supabase.auth.mfa.listFactors()
  for (const f of (list?.all || []) as any[]) {
    if (f.status !== 'verified') await supabase.auth.mfa.unenroll({ factorId: f.id })
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `CDM Studio ${new Date().toISOString().slice(0, 10)}` })
  if (error || !data) {
    throw new Error(/disabled|not enabled/i.test(error?.message || '') ? 'Two-step sign-in is switched off for this app. Turn on TOTP under Authentication > Multi-factor in Supabase.' : error?.message || 'Could not start set-up')
  }
  return { factorId: data.id, qr: (data as any).totp.qr_code, secret: (data as any).totp.secret }
}

export async function turnOff(factorId: string): Promise<void> {
  const { error } = await supabase.auth.mfa.unenroll({ factorId })
  if (error) throw new Error(error.message)
}
