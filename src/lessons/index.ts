import { ai } from './ai'
import { apps } from './apps'
import { data } from './data'
import { games } from './games'
import { web } from './web'
import { COURSES } from './courses.generated'
import type { Lesson, Track } from './types'

/** the free beginner tracks */
export const TRACKS: Track[] = [ai, web, apps, games, data]
/** certified courses: the first lessons free, the rest unlocked with credits, a final exam and a certificate */
export { COURSES }
const ALL: Track[] = [...TRACKS, ...COURSES]

export function findLesson(id: string): { track: Track; lesson: Lesson; index: number } | null {
  for (const track of ALL) {
    const index = track.lessons.findIndex((l) => l.id === id)
    if (index >= 0) return { track, lesson: track.lessons[index], index }
  }
  return null
}

export function nextLesson(id: string): Lesson | null {
  const f = findLesson(id)
  if (!f) return null
  return f.track.lessons[f.index + 1] ?? null
}

export const LESSON_COUNT = TRACKS.reduce((n, t) => n + t.lessons.length, 0)
export type { Lesson, Track }
