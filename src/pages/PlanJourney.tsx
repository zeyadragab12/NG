import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { PlanJourney as Plan } from '../data/planJourneys'
import type { PlaceId } from '../data/places'
import { onProgress, scrollToTarget } from '../fx/engine'
import { clamp01, lerp, stepState, stepTarget } from '../fx/steps'
import { imgUrl } from '../components/ui'
import { Contours } from './Journey'

const TAIL = 0.5

/**
 * Facility plan journey: the same pattern as the home masterplan journey, on the
 * facility's own plan. The plan is pinned, moves left/right, zooms into one area
 * per step and the story swaps to the other side.
 */
export function PlanJourney({ plan, place }: { plan: Plan; place: PlaceId }) {
  const { keys } = plan
  const N = keys.length
  const section = useRef<HTMLElement>(null)
  const map = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const cA = useRef<HTMLDivElement>(null)
  const scrims = useRef<(HTMLDivElement | null)[]>([])
  const steps = useRef<(HTMLDivElement | null)[]>([])
  const pins = useRef<(HTMLDivElement | null)[]>([])
  const dots = useRef<(HTMLButtonElement | null)[]>([])
  const nav = useRef<HTMLDivElement>(null)
  const geo = useRef({ top: 0, range: 1 })

  useEffect(() => {
    const el = section.current
    if (!el) return
    let size = { w: 0, h: 0, vw: 0, vh: 0 }
    let lastActive = -1
    return onProgress(el, ({ p, scrolled, range, vh, vw }) => {
      const m = map.current
      if (!m) return
      if (size.vw !== vw || size.vh !== vh) size = { w: m.offsetWidth, h: m.offsetHeight, vw, vh }
      geo.current = { top: el.getBoundingClientRect().top + window.scrollY, range }
      const mobile = vw < 768

      const { i, e, a } = stepState(p, N, TAIL)
      const A = keys[i]
      const B = keys[i + 1]
      const side = lerp(A.side, B.side, e)
      const s = lerp(A.s, B.s, e)
      const fx = lerp(A.fx, B.fx, e)
      const fy = lerp(A.fy, B.fy, e)
      const dim = lerp(A.dim, B.dim, e)

      const S = s * (mobile ? 0.92 : 1)
      const x = (mobile ? 0 : side * vw * 0.24) - (fx / 100 - 0.5) * size.w * S
      const y = (mobile ? -vh * 0.16 : 0) - (fy / 100 - 0.5) * size.h * S
      const intro = clamp01(p * 30) // small settle as the section pins
      m.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${(y + (1 - intro) * 40).toFixed(1)}px,0) scale(${(S * (0.94 + intro * 0.06)).toFixed(4)})`
      m.style.setProperty('--fx', `${fx.toFixed(2)}%`)
      m.style.setProperty('--fy', `${fy.toFixed(2)}%`)
      m.style.setProperty('--dim', dim.toFixed(3))
      m.style.setProperty('--inv', (1 / S).toFixed(4))

      const finalW = clamp01(a - (N - 2))
      keys.forEach((k, idx) => {
        const node = pins.current[idx]
        if (!node || !k.pin) return
        const w = clamp01(1 - Math.abs(a - idx) * 1.6)
        node.style.opacity = Math.max(w, finalW).toFixed(3)
        node.dataset.active = String(w > 0.5)
        node.dataset.label = String(w > 0.5 || (finalW > 0.5 && !mobile))
      })

      if (grid.current) grid.current.style.backgroundPosition = `0 ${(-scrolled * 0.12).toFixed(1)}px`
      if (cA.current) cA.current.style.transform = `translate3d(0,${(-p * 28).toFixed(2)}vh,0) rotate(${(p * 14).toFixed(2)}deg)`

      const [left, right, bottom] = scrims.current
      if (left) left.style.opacity = (mobile ? 0 : clamp01(side)).toFixed(3)
      if (right) right.style.opacity = (mobile ? 0 : clamp01(-side)).toFixed(3)
      if (bottom) bottom.style.opacity = (mobile ? 1 : clamp01(1 - Math.abs(side)) * 0.8).toFixed(3)

      steps.current.forEach((node, k) => {
        if (!node) return
        const d = a - k
        const o = clamp01(1 - Math.abs(d) * 2.2)
        node.style.opacity = o.toFixed(3)
        node.style.transform = `translate3d(0,${(d * -60).toFixed(1)}px,0)`
        node.style.setProperty('--d', d.toFixed(3))
        const on = o > 0.5
        if (node.inert === on) node.inert = !on
      })

      if (nav.current) nav.current.style.opacity = clamp01(p * 20).toFixed(3)
      const active = Math.round(a)
      if (active !== lastActive) {
        lastActive = active
        dots.current.forEach((d, k) => d && (d.dataset.active = String(k === active)))
      }
    })
  }, [keys, N])

  const goTo = (k: number) => {
    const { top, range } = geo.current
    scrollToTarget(top + stepTarget(k, N, TAIL) * range)
  }

  return (
    <section
      ref={section}
      data-progress
      data-tone="ink"
      data-place={place}
      className="relative bg-ink text-paper"
      style={{ height: `${Math.round((N - 1 + TAIL) * 100 + 100)}svh` }}
      aria-label={plan.label}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            ref={grid}
            className="absolute inset-0 bg-[radial-gradient(rgba(250,247,236,.09)_1px,transparent_1.2px)] bg-[length:30px_30px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
          />
          <div ref={cA} className="absolute -inset-[30%] will-change-transform">
            <Contours />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(43,63,168,.18),transparent_60%)]" />
        </div>

        {/* the plan */}
        <div
          ref={map}
          className="pointer-events-none absolute top-1/2 left-1/2 z-[2] h-[min(44svh,calc(88vw/var(--ar)))] will-change-transform md:h-[min(78svh,calc(46vw/var(--ar)))]"
          style={{ aspectRatio: String(plan.ar), ['--ar' as string]: plan.ar, transform: 'translate(-50%,-50%)' }}
        >
          <div
            className={`absolute inset-0 overflow-hidden ${plan.cutout ? '' : 'rounded-[18px] shadow-[0_50px_100px_-30px_rgba(0,0,0,.8)] ring-1 ring-paper/10'}`}
          >
            <img
              src={imgUrl(plan.img, 1920)}
              alt={plan.label}
              decoding="async"
              className={`h-full w-full ${plan.cutout ? 'object-contain [filter:drop-shadow(0_40px_60px_rgba(0,0,0,.5))]' : 'object-cover'}`}
            />
            <div
              className={`absolute inset-0 ${plan.cutout ? '[mask-size:100%_100%]' : ''}`}
              style={{
                opacity: 'var(--dim,0)',
                background:
                  'radial-gradient(circle at var(--fx,50%) var(--fy,50%), transparent 0, transparent 8%, rgba(14,14,14,.74) 20%)',
                ...(plan.cutout ? { maskImage: `url(${imgUrl(plan.img, 1920)})`, WebkitMaskImage: `url(${imgUrl(plan.img, 1920)})` } : {}),
              }}
            />
          </div>
          <div
            className="absolute aspect-square w-[14%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent/80 shadow-[0_0_40px_rgba(232,85,62,.45)]"
            style={{ left: 'var(--fx,50%)', top: 'var(--fy,50%)', opacity: 'var(--dim,0)' }}
          />
          {keys.map((k, idx) =>
            k.pin ? (
              <div
                key={idx}
                ref={(n) => {
                  pins.current[idx] = n
                }}
                data-active="false"
                data-label="true"
                className={`group absolute flex -translate-y-1/2 items-center gap-2 opacity-0 ${k.fx > 65 ? '-translate-x-[calc(100%-8px)] flex-row-reverse' : '-translate-x-2'}`}
                style={{ left: `${k.fx}%`, top: `${k.fy}%`, scale: 'var(--inv,1)', transformOrigin: k.fx > 65 ? 'calc(100% - 8px) 50%' : '8px 50%' }}
              >
                <span className="relative size-4 flex-none rounded-full bg-accent shadow-[0_0_0_6px_rgba(232,85,62,.25)]">
                  <span className="absolute inset-0 rounded-full bg-accent [animation:pulse-ring_1.8s_ease-out_infinite]" />
                </span>
                <span className="rounded bg-paper px-2.5 py-[7px] text-[10px] font-bold tracking-[.1em] whitespace-nowrap text-ink uppercase transition-[background-color,opacity] duration-300 group-data-[active=true]:bg-accent group-data-[label=false]:opacity-0 md:text-[11px]">
                  {k.pin}
                </span>
              </div>
            ) : null,
          )}
        </div>

        {/* readability scrims */}
        <div ref={(n) => { scrims.current[0] = n }} aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[3] w-[60%] bg-[linear-gradient(90deg,rgba(14,14,14,.94)_0%,rgba(14,14,14,.72)_45%,transparent_100%)] opacity-0" />
        <div ref={(n) => { scrims.current[1] = n }} aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-[3] w-[60%] bg-[linear-gradient(270deg,rgba(14,14,14,.94)_0%,rgba(14,14,14,.72)_45%,transparent_100%)] opacity-0" />
        <div ref={(n) => { scrims.current[2] = n }} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[58%] bg-[linear-gradient(0deg,rgba(14,14,14,.96)_0%,rgba(14,14,14,.85)_50%,transparent_100%)] opacity-0" />

        {/* story */}
        {keys.map((k, idx) => (
          <div
            key={idx}
            ref={(n) => {
              steps.current[idx] = n
            }}
            className={`absolute z-[5] max-md:inset-x-[clamp(20px,6vw,120px)] max-md:bottom-[6svh] ${placeClass(k.side)} ${idx ? 'opacity-0' : ''}`}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -top-[.62em] -left-[.06em] -z-10 text-[clamp(140px,20vw,320px)] leading-none font-extrabold tracking-[-.06em] text-paper/[.05] select-none max-md:hidden"
              style={{ transform: 'translate3d(0, calc(var(--d,0) * -90px), 0)' }}
            >
              {String(idx).padStart(2, '0')}
            </span>
            <div className="eyebrow">{k.n}</div>
            {idx === 0 ? (
              <h2 className="mt-3 text-[clamp(32px,4.2vw,64px)] leading-none font-extrabold tracking-[-.035em] md:mt-4">{k.title}</h2>
            ) : (
              <h3 className="mt-3 text-[clamp(30px,3.8vw,58px)] leading-[1.02] font-extrabold tracking-[-.035em] md:mt-4">{k.title}</h3>
            )}
            <p className="mt-4 max-w-[440px] text-[15px] leading-[1.65] text-paper/75 md:mt-5 md:text-[17px]">{k.body}</p>
            {k.link && (
              <Link
                to={k.link.to}
                className="mt-6 inline-flex min-h-11 items-center border-b-2 border-accent text-[13px] font-bold tracking-[.14em] uppercase transition-colors hover:text-accent"
              >
                {k.link.label} →
              </Link>
            )}
          </div>
        ))}

        {/* step indicator */}
        <div
          ref={nav}
          className="absolute top-1/2 right-[clamp(12px,1.6vw,28px)] z-[6] hidden -translate-y-1/2 flex-col gap-1 opacity-0 md:flex"
          role="navigation"
          aria-label={`${plan.label} steps`}
        >
          {keys.map((k, idx) => (
            <button
              key={idx}
              ref={(n) => {
                dots.current[idx] = n
              }}
              type="button"
              onClick={() => goTo(idx)}
              aria-label={`Go to ${k.short}`}
              data-active="false"
              className="group flex h-7 cursor-pointer items-center justify-end gap-3 text-paper"
            >
              <span className="text-[10px] font-bold tracking-[.16em] uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-70 group-data-[active=true]:text-accent group-data-[active=true]:opacity-100">
                {k.short}
              </span>
              <span className="h-0.5 w-4 bg-paper/30 transition-all duration-500 group-hover:bg-paper/70 group-data-[active=true]:w-8 group-data-[active=true]:bg-accent" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function placeClass(side: number) {
  if (side === 0) return 'md:bottom-[9vh] md:left-[clamp(20px,5vw,80px)] md:w-[min(420px,32vw)]'
  if (side > 0) return 'md:top-1/2 md:left-[clamp(20px,6vw,120px)] md:-translate-y-1/2 md:w-[min(480px,38vw)]'
  return 'md:top-1/2 md:right-[clamp(56px,7vw,140px)] md:-translate-y-1/2 md:w-[min(480px,38vw)]'
}
