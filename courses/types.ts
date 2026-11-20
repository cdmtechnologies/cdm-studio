// Certified courses. These files are NOT part of the app bundle: scripts/courses.mjs turns them into
//  - src/lessons/courses.generated.ts: each course with its free lessons in full and only titles for the paid ones
//  - supabase/seed/courses.sql: the paid lessons' content (readable only after unlocking), the exam questions with
//    their answers (never sent to browsers) and the tutor's lesson notes.
import type { Lesson, Quiz } from '../src/lessons/types'

export type CourseLesson = Lesson & {
  /** what the locked screen says this lesson teaches */
  outline: string
  /** model answer for code lessons: the starter changed so every check passes (used by scripts/check-lessons.mjs) */
  solution?: string
}

export type Course = {
  id: string
  title: string
  blurb: string
  emoji: string
  colour: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  hours: number
  /** the first lessons are free; the rest are unlocked one by one with credits */
  free: number
  skills: string[]
  careers: string[]
  lessons: CourseLesson[]
  /** the final exam (at least 15 questions); answers stay on the server */
  exam: Quiz[]
}
