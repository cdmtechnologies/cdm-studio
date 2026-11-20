import { describe, expect, it } from 'vitest'
import { TRACKS, findLesson, nextLesson } from '../lessons'
import { mergeDone } from './progress'
import { buildDoc } from './sandbox'
import { cleanInput, cleanPage, userMessage } from '../../supabase/functions/studio-build/lib'
import { cleanHistory, tutorSystem } from '../../supabase/functions/studio-tutor/lib'
import { cleanSettings, safeEqual } from '../../supabase/functions/studio-control/lib'
import { returnUrl } from '../../supabase/functions/studio-pay/lib'

describe('lessons', () => {
  it('have unique, valid ids and what each kind needs', () => {
    const ids = TRACKS.flatMap((t) => t.lessons.map((l) => l.id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const t of TRACKS) for (const l of t.lessons) {
      expect(/^[a-z0-9-]{1,60}$/.test(l.id)).toBe(true)
      if (l.kind === 'code') { expect(!!l.starter && !!l.task && (l.checks?.length ?? 0) > 0).toBe(true) }
      if (l.kind === 'read') expect((l.quiz?.length ?? 0) > 0).toBe(true)
      for (const q of l.quiz ?? []) expect(q.answer >= 0 && q.answer < q.options.length).toBe(true)
    }
  })
  it('finds a lesson and the next one', () => {
    expect(findLesson('web-css')?.track.id).toBe('web')
    expect(nextLesson('web-first-page')?.id).toBe('web-css')
    expect(findLesson('nope')).toBe(null)
  })
})

describe('progress', () => {
  it('keeps the earliest date for each lesson', () => {
    expect(mergeDone({ a: '2026-02-01' }, { a: '2026-01-01', b: '2026-03-01' })).toEqual({ a: '2026-01-01', b: '2026-03-01' })
  })
})

describe('sandbox', () => {
  it('wraps a fragment and puts the helper first in a full page', () => {
    expect(buildDoc('<h1>Hi</h1>', 'n1')).toContain('<body><h1>Hi</h1></body>')
    const full = buildDoc('<!doctype html><html><head><title>x</title></head><body></body></html>', 'n2')
    expect(full.indexOf('"n2"') < full.indexOf('<title>')).toBe(true)
  })
})

describe('builder', () => {
  it('checks what the browser sends', () => {
    expect(cleanInput({ prompt: 'hi' }).error).toBeTruthy()
    expect(cleanInput({ prompt: 'make a page', mode: 'change' }).error).toBeTruthy()
    expect(cleanInput({ prompt: 'make a page', kind: 'nonsense' }).input?.kind).toBe('website')
    expect(cleanInput({ prompt: 'x'.repeat(5000) }).input?.prompt.length).toBe(3000)
  })
  it('turns the AI answer into a full document', () => {
    const p = cleanPage({ title: 'T', html: '```html\n<h1>Hi</h1>\n```', summary: 'ok' })
    expect(p?.html.startsWith('<!doctype html>')).toBe(true)
    expect(p?.html).toContain('<h1>Hi</h1>')
    expect(cleanPage({ html: '' })).toBe(null)
    expect(cleanPage({ html: 'x'.repeat(300_001) })).toBe(null)
  })
  it('sends the current page and the error when fixing', () => {
    const m = userMessage({ mode: 'fix', kind: 'game', prompt: 'Fix it', projectId: 'p', error: 'x is not defined', best: false }, '<p>page</p>', ['first'])
    expect(m).toContain('x is not defined')
    expect(m).toContain('<p>page</p>')
    expect(m).toContain('- first')
  })
})

describe('tutor', () => {
  it('keeps only well-formed turns ending with the tutor', () => {
    expect(cleanHistory([{ role: 'assistant', content: 'a' }, { role: 'user', content: 'q' }, { role: 'assistant', content: 'r' }, { role: 'user', content: 'q2' }]))
      .toEqual([{ role: 'user', content: 'q' }, { role: 'assistant', content: 'r' }])
    expect(cleanHistory('x')).toEqual([])
  })
  it('includes the lesson task in help mode', () => {
    expect(tutorSystem('help', { track: 'Web', title: 'CSS', kind: 'code', task: 'Colour the h1', practice: null, hint: null, body: '' })).toContain('Colour the h1')
  })
})

describe('owner and payments', () => {
  it('keeps only known settings, within limits', () => {
    expect(cleanSettings({ free_builds_daily: 99999, ai_enabled: false, evil: 1, price_monthly_usd: 4.999 })).toEqual({ ai_enabled: false, free_builds_daily: 1000, price_monthly_usd: 4.999 })
    expect(safeEqual('abc', 'abc')).toBe(true)
    expect(safeEqual('abc', 'abd')).toBe(false)
  })
  it('sends payers back only to the site they came from', () => {
    expect(returnUrl('https://cdmtechnologies.github.io/cdm-studio/#/account', 'https://cdmtechnologies.github.io')).toBe('https://cdmtechnologies.github.io/cdm-studio/#/account')
    expect(returnUrl('https://evil.example/x', 'https://cdmtechnologies.github.io')).toBe(undefined)
    expect(returnUrl('https://cdmtechnologies.github.io.evil.example/', 'https://cdmtechnologies.github.io')).toBe(undefined)
  })
})
