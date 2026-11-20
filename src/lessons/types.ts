// Lessons are plain data. A code lesson runs the learner's page in a sandbox and checks it with small tests that run
// inside the sandbox (each `test` is the body of a function that returns true when the step is done).

export type Check = { label: string; test: string }
export type Quiz = { q: string; options: string[]; answer: number; why: string }

export type Lesson = {
  id: string
  title: string
  minutes: number
  /** what the learner reads first (Markdown) */
  body: string
  /** 'code': edit the starter and pass the checks; 'prompt': practise with the AI tutor; 'read': read and answer the quiz */
  kind: 'code' | 'prompt' | 'read'
  task?: string
  starter?: string
  checks?: Check[]
  /** shown on request; never needed to pass */
  hint?: string
  quiz?: Quiz[]
  /** for 'prompt' lessons: what the learner is asked to try with the AI */
  practice?: string
}

export type Track = {
  id: 'ai' | 'web' | 'apps' | 'games' | 'data'
  title: string
  blurb: string
  colour: string
  emoji: string
  lessons: Lesson[]
  soon?: string
}
