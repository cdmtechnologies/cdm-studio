import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Video = { lesson_id: string; youtube_id: string; title: string | null }
let cache: Promise<Record<string, Video>> | null = null
/** Every lesson's video, loaded once per visit. */
export function loadVideos(fresh = false): Promise<Record<string, Video>> {
  if (!cache || fresh) {
    cache = Promise.resolve(supabase.from('lesson_videos').select('lesson_id, youtube_id, title'))
      .then(({ data }) => Object.fromEntries(((data as Video[]) ?? []).map((v) => [v.lesson_id, v])))
      .catch(() => ({}))
  }
  return cache
}

/** The lesson's video (if the owner added one): watch first, then read and practise below. */
export default function LessonVideo({ lessonId, title }: { lessonId: string; title: string }) {
  const [v, setV] = useState<Video | null>(null)
  const [play, setPlay] = useState(false)
  useEffect(() => { setPlay(false); loadVideos().then((all) => setV(all[lessonId] ?? null)) }, [lessonId])
  if (!v) return null
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
      <div className="relative aspect-video">
        {play ? (
          <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${v.youtube_id}?autoplay=1&rel=0&modestbranding=1`}
            title={v.title ?? title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        ) : (
          // the player loads only when pressed: faster lessons, and YouTube is not contacted until then
          <button className="group absolute inset-0 h-full w-full" onClick={() => setPlay(true)} aria-label={`Play the video: ${v.title ?? title}`}>
            <img src={`https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover opacity-90 group-hover:opacity-100" loading="lazy" />
            <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg group-hover:scale-105"><svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg></span></span>
            <span className="absolute bottom-2 left-3 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">▶ Watch the lesson</span>
          </button>
        )}
      </div>
    </div>
  )
}
