import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { lockScroll } from '../fx/engine'

const NAMES: Record<string, string> = {
  '/': 'newgiza.',
  '/university': 'ngu.',
  '/health-park': 'health park.',
  '/club': 'ngsc.',
}

const COVER_MS = 850
const REVEAL_MS = 1100

/**
 * Page-to-page transition. Any internal link to another page is caught (capture
 * phase, before the router sees it): five dark panels rise to cover the screen
 * with the destination name, the route changes underneath, then the panels lift
 * away — the same panel language as the image reveals.
 */
export function PageTransition() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [phase, setPhase] = useState<'idle' | 'cover' | 'reveal'>('idle')
  const [name, setName] = useState('')
  const current = useRef(pathname)
  const busy = useRef(false)
  const go = useRef(navigate)
  current.current = pathname
  go.current = navigate

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timers: number[] = []
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === current.current) return
      e.preventDefault()
      if (busy.current) return
      busy.current = true
      setName(NAMES[url.pathname] ?? 'newgiza.')
      setPhase('cover')
      lockScroll(true)
      timers.push(
        window.setTimeout(() => {
          lockScroll(false)
          go.current(url.pathname + url.hash)
          timers.push(window.setTimeout(() => setPhase('reveal'), 150))
          timers.push(
            window.setTimeout(() => {
              setPhase('idle')
              busy.current = false
            }, 150 + REVEAL_MS),
          )
        }, COVER_MS),
      )
    }
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div aria-hidden className={`fixed inset-0 z-[80] ${phase === 'cover' ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className="absolute inset-0 grid grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="-mr-px bg-ink"
            style={{
              transform: phase === 'cover' ? 'translate3d(0,0,0)' : phase === 'reveal' ? 'translate3d(0,-101%,0)' : 'translate3d(0,101%,0)',
              transition: phase === 'idle' ? 'none' : `transform ${phase === 'cover' ? 0.75 : 1}s var(--ease-panel) ${i * 70}ms`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <span
          className="block text-[clamp(48px,10vw,160px)] leading-none font-extrabold tracking-[-.045em] text-paper"
          style={{
            transform: phase === 'cover' ? 'translate3d(0,0,0)' : phase === 'reveal' ? 'translate3d(0,-60px,0)' : 'translate3d(0,110%,0)',
            opacity: phase === 'cover' ? 1 : 0,
            transition:
              phase === 'idle'
                ? 'none'
                : phase === 'cover'
                  ? 'transform .9s var(--ease-rise) .3s, opacity .4s ease .3s'
                  : 'transform .6s var(--ease-rise), opacity .35s ease',
          }}
        >
          {name}
        </span>
        <span
          className="absolute bottom-[8vh] h-0.5 w-[120px] origin-left bg-accent"
          style={{
            transform: `scaleX(${phase === 'cover' ? 1 : 0})`,
            transition: phase === 'cover' ? `transform ${COVER_MS}ms var(--ease-soft) .2s` : 'none',
            opacity: phase === 'cover' ? 1 : 0,
          }}
        />
      </div>
    </div>
  )
}
