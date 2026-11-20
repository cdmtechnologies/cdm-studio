import { describe, expect, it } from 'vitest'
import { authorizeUrl, hasLink, pkceChallenge, problem, safeReturn, scheduleTime, xCredits, xLength } from '../../supabase/functions/_shared/social'

describe('CDM Social', () => {
  it('counts X length with links as 23', () => {
    expect(xLength('hi https://example.com/a/very/long/link/that/is/long')).toBe(3 + 23)
    expect(hasLink('see https://cdm.ng')).toBe(true)
    expect(xCredits('no link', { x_post_credits: 8, x_link_post_credits: 96 })).toBe(8)
    expect(xCredits('a https://x.co', { x_post_credits: 8, x_link_post_credits: 96 })).toBe(96)
  })
  it('knows what each platform refuses', () => {
    expect(problem('x', 'a'.repeat(281), [])).toBeTruthy()
    expect(problem('x', 'a'.repeat(280), [])).toBe(null)
    expect(problem('instagram', 'caption', [])).toBe('Instagram needs a picture.')
    expect(problem('facebook', '', [])).toBe('The post is empty.')
    expect(problem('linkedin', 'Hello', [])).toBe(null)
  })
  it('only sends people back to CDM sites', () => {
    expect(safeReturn('https://cdmtechnologies.github.io/cdm-social/#/w/1')).toBe('https://cdmtechnologies.github.io/cdm-social/#/w/1')
    expect(safeReturn('https://evil.com/')).toBe('https://cdmtechnologies.github.io/cdm-social/')
    expect(safeReturn('javascript:alert(1)')).toBe('https://cdmtechnologies.github.io/cdm-social/')
  })
  it('builds sign-in addresses', async () => {
    const c = { graph: 'v23.0', metaAppId: 'M', linkedinClientId: 'L', xClientId: 'X', redirect: 'https://p.supabase.co/functions/v1/social-connect/callback' }
    expect(authorizeUrl('facebook', c, 's1')).toContain('pages_manage_posts')
    expect(authorizeUrl('linkedin', c, 's1')).toContain('w_member_social')
    const ch = await pkceChallenge('verifier-123')
    expect(authorizeUrl('x', c, 's1', ch)).toContain('code_challenge_method=S256')
    expect(ch).toMatch(/^[A-Za-z0-9_-]{43}$/)
  })
  it('turns a local day and time into UTC', () => {
    const base = new Date('2026-11-20T20:00:00Z')
    expect(scheduleTime(base, 1, '09:30', 60)).toBe('2026-11-21T08:30:00.000Z')
    expect(scheduleTime(base, 0, 'later', 60)).toBe('2026-11-20T09:00:00.000Z')
  })
})
