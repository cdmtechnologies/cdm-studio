// Pure helpers for CDM Social (unit tested): limits per platform, OAuth addresses, request bodies and AI prompts.

export const PLATFORMS = ['facebook', 'instagram', 'linkedin', 'x'] as const
export type Platform = (typeof PLATFORMS)[number]
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const LIMITS: Record<Platform, number> = { facebook: 63000, instagram: 2200, linkedin: 3000, x: 280 }
export const NAMES: Record<Platform, string> = { facebook: 'Facebook Page', instagram: 'Instagram', linkedin: 'LinkedIn', x: 'X' }

/** X counts every link as 23 characters. */
export function xLength(text: string): number {
  return [...text.replace(/https?:\/\/\S+/g, 'x'.repeat(23))].length
}
export const hasLink = (text: string) => /https?:\/\/\S+/.test(text)

/** Why a post cannot go to a platform (or null when it can). */
export function problem(platform: Platform, text: string, media: { url: string }[]): string | null {
  const len = platform === 'x' ? xLength(text) : [...text].length
  if (len > LIMITS[platform]) return `Too long for ${NAMES[platform]} (${len} of ${LIMITS[platform]} characters).`
  if (platform === 'instagram' && !media.length) return 'Instagram needs a picture.'
  if (!text.trim() && !media.length) return 'The post is empty.'
  return null
}

/** Only CDM sites may receive people back after connecting an account. */
export function safeReturn(raw: unknown): string {
  const fallback = 'https://cdmtechnologies.github.io/cdm-social/'
  if (typeof raw !== 'string' || raw.length > 300) return fallback
  try {
    const u = new URL(raw)
    const ok = (u.protocol === 'https:' && u.hostname === 'cdmtechnologies.github.io') || (u.protocol === 'http:' && u.hostname === 'localhost')
    return ok ? u.toString() : fallback
  } catch { return fallback }
}

export function randomString(bytes = 32): string {
  const a = new Uint8Array(bytes)
  crypto.getRandomValues(a)
  return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
export async function pkceChallenge(verifier: string): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
  return btoa(String.fromCharCode(...d)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export type AuthConfig = { graph: string; metaAppId: string; linkedinClientId: string; xClientId: string; redirect: string }
/** Where to send the person to approve CDM Social on each network. */
export function authorizeUrl(platform: Platform, c: AuthConfig, state: string, challenge?: string): string {
  const q = (o: Record<string, string>) => new URLSearchParams(o).toString()
  if (platform === 'facebook' || platform === 'instagram') {
    return `https://www.facebook.com/${c.graph}/dialog/oauth?${q({ client_id: c.metaAppId, redirect_uri: c.redirect, state, response_type: 'code',
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish,business_management' })}`
  }
  if (platform === 'linkedin') {
    return `https://www.linkedin.com/oauth/v2/authorization?${q({ response_type: 'code', client_id: c.linkedinClientId, redirect_uri: c.redirect, state, scope: 'openid profile w_member_social' })}`
  }
  return `https://x.com/i/oauth2/authorize?${q({ response_type: 'code', client_id: c.xClientId, redirect_uri: c.redirect, state, scope: 'tweet.read tweet.write users.read offline.access', code_challenge: challenge ?? '', code_challenge_method: 'S256' })}`
}

export function linkedinBody(author: string, text: string) {
  return {
    author, lifecycleState: 'PUBLISHED',
    specificContent: { 'com.linkedin.ugc.ShareContent': { shareCommentary: { text }, shareMediaCategory: 'NONE' } },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  }
}

/** Credits for posting on X (X charges per post; posts with a link cost more). */
export const xCredits = (text: string, s: { x_post_credits: number; x_link_post_credits: number }) => (hasLink(text) ? s.x_link_post_credits : s.x_post_credits)

export const SOCIAL_SYSTEM = `You are the social media manager inside CDM Social. You write posts for small and growing businesses (many in Nigeria and Africa) and their customers.
Write like a skilled local marketer: specific, warm, useful, never spammy. Each post has one clear message and, where it fits, one call to action (WhatsApp, visit, call, link).
Respect each platform: X under 260 characters; Instagram a strong first line and up to 5 relevant hashtags at the end; LinkedIn professional and value-led, 2 to 4 short paragraphs; Facebook friendly and conversational.
Use the brand facts given. Never invent prices, discounts, awards, health claims, results or testimonials; if a fact is missing, write around it or leave a clear [placeholder].
No misleading, hateful, sexual or political content. No engagement bait ("like if you agree"). Reply in the workspace's language.`

export const PLAN_TOOL = {
  name: 'posts',
  description: 'The posts to save as drafts for approval',
  input_schema: {
    type: 'object', required: ['posts'],
    properties: {
      posts: {
        type: 'array', minItems: 1, maxItems: 30,
        items: {
          type: 'object', required: ['text', 'day', 'time', 'idea'],
          properties: {
            text: { type: 'string', description: 'The post, ready to publish' },
            day: { type: 'integer', minimum: 0, maximum: 60, description: 'Days from today' },
            time: { type: 'string', description: 'Local time HH:MM, a good time for this audience' },
            idea: { type: 'string', description: 'A short note on the idea and what picture would suit it' },
          },
        },
      },
    },
  },
}

export function planPrompt(o: { name: string; brand: string; language: string; platforms: string[]; days: number; count: number; topics: string }): string {
  return `Workspace: ${o.name}
Brand facts, voice and audience:
${o.brand || '(none given: keep it general and ask for details in [placeholders])'}
Language: ${o.language}
Platforms these posts go to: ${o.platforms.join(', ')} (write so one text works on all of them; keep it under 260 characters if X is included)
Plan ${o.count} posts spread over the next ${o.days} days.${o.topics ? `\nThemes or events to cover: ${o.topics}` : ''}
Mix: useful tips, products or services, customer stories (no invented quotes), behind the scenes, and offers only if the brand facts mention them.`
}

/** A local date + "HH:MM" in a time zone offset (minutes) -> UTC ISO time. */
export function scheduleTime(base: Date, day: number, time: string, offsetMinutes: number): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  const h = m ? Math.min(23, +m[1]) : 10, mi = m ? Math.min(59, +m[2]) : 0
  const local = new Date(base.getTime() + offsetMinutes * 60000)
  const d = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + Math.max(0, Math.min(60, day)), h, mi)
  return new Date(d - offsetMinutes * 60000).toISOString()
}
