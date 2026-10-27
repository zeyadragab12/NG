import { useEffect, useRef, useState } from 'react'
import { PLACES, type PlaceId } from '../data/places'
import { onScroll } from '../fx/engine'
import { SmartLink, imgUrl } from './ui'

/**
 * "You are here" mini-map. Any element with data-place="<PlaceId>" that covers the
 * centre of the screen lights up its spot on a small masterplan in the corner, so
 * every section stays connected to the masterplan journey.
 */
export function MiniMap() {
  const [place, setPlace] = useState<PlaceId | null>(null)
  const current = useRef<PlaceId | null>(null)
  const shown = useRef<PlaceId>('all') // keeps the last place on screen while fading out

  useEffect(
    () =>
      onScroll(({ vh, vw }) => {
        let found: PlaceId | null = null
        // later elements win, so a sticky card stacked on top beats the one under it
        document.querySelectorAll<HTMLElement>('[data-place]').forEach((el) => {
          const r = el.getBoundingClientRect()
          if (r.top <= vh * 0.5 && r.bottom >= vh * 0.5 && r.left <= vw * 0.5 && r.right >= vw * 0.5)
            found = el.dataset.place as PlaceId
        })
        if (found !== current.current) {
          current.current = found
          setPlace(found)
        }
      }),
    [],
  )

  // on phones it only peeks for a moment when the place changes, so it never sits on top of text
  const [peek, setPeek] = useState(false)
  useEffect(() => {
    if (!place || !window.matchMedia('(max-width: 767px)').matches) return
    setPeek(true)
    const id = window.setTimeout(() => setPeek(false), 2600)
    return () => clearTimeout(id)
  }, [place])
  const visible = !!place && (peek || !window.matchMedia('(max-width: 767px)').matches)

  if (place) shown.current = place
  const p = PLACES[shown.current]
  const pin = shown.current !== 'all'

  return (
    <SmartLink
      to="/#masterplan"
      aria-label={`You are here: ${p.label}. Open the masterplan`}
      className={`group fixed bottom-3 left-2 z-30 w-[60px] rounded-xl bg-ink/88 p-1.5 text-paper shadow-[0_20px_50px_-20px_rgba(0,0,0,.6)] ring-1 ring-paper/10 backdrop-blur-md transition-[opacity,translate] duration-700 ease-[var(--ease-soft)] md:bottom-6 md:left-[max(8px,calc((clamp(20px,6vw,120px)-72px)/2))] md:w-[72px] md:p-2 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <div className="relative aspect-[957/1422] w-full">
        <img
          src={imgUrl('newgiza-masterplan.png', 1920)}
          alt=""
          decoding="async"
          className={`h-full w-full object-contain transition-[filter,opacity] duration-700 ${pin ? 'opacity-70 brightness-75' : 'opacity-100'}`}
        />
        <span
          aria-hidden
          className={`absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_3px_rgba(232,85,62,.3)] transition-[left,top,opacity] duration-700 ease-[var(--ease-rise)] md:size-2.5 ${pin ? 'opacity-100' : 'opacity-0'}`}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <span className="absolute inset-0 rounded-full bg-accent [animation:pulse-ring_1.8s_ease-out_infinite]" />
        </span>
      </div>
      <div key={shown.current} className="mt-1 text-center text-[8px] leading-[1.25] font-bold tracking-[.06em] break-words [animation:fade-in_.5s_ease] md:text-[9px]">
        {p.label}
      </div>
    </SmartLink>
  )
}
