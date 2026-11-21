import { describe, expect, it } from 'vitest'
import { gradePrompt, scoreOf } from '../../supabase/functions/studio-grade/lib'
import { lessonPage, pythonDoc, sqlDoc } from './runtimes'

describe('final project marking', () => {
  it('works the score out from the items, ignoring bad or repeated ones', () => {
    expect(scoreOf([{ n: 1, met: true }, { n: 2, met: false }, { n: 3, met: true }, { n: 4, met: true }], 4)).toBe(75)
    expect(scoreOf([{ n: 1, met: true }, { n: 1, met: true }, { n: 9, met: true }, { n: 0, met: true }], 4)).toBe(25)
    expect(scoreOf([], 0)).toBe(0)
  })
  it('keeps the submission between markers', () => {
    const p = gradePrompt({ title: 'T', brief: 'B', rubric: ['a', 'b'], lang: 'python', content: 'print(1)' })
    expect(p).toContain('1. a\n2. b')
    expect(p).toMatch(/<<<SUBMISSION\nprint\(1\)\nSUBMISSION>>>$/)
  })
})

describe('Python and SQL lesson pages', () => {
  it('leaves HTML lessons as they are', () => {
    expect(lessonPage('<h1>x</h1>', {})).toBe('<h1>x</h1>')
  })
  it('cannot break out of the script with the learner code', () => {
    const d = pythonDoc('print("</script><script>alert(1)</script>")')
    expect(d.match(/<\/script>/g)?.length).toBe(2) // only the page's own two
    expect(sqlDoc("select '</script>'", '').match(/<\/script>/g)?.length).toBe(2)
  })
  it('wraps by language', () => {
    expect(lessonPage('x = 1', { lang: 'python' })).toContain('pyodide.js')
    expect(lessonPage('select 1', { lang: 'sql', setup: 'create table t(a)' })).toContain('create table t(a)')
  })
})
