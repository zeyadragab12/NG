import { useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Img, Panels, SmartLink, imgUrl } from '../components/ui'
import { PLACES as PLACES_BY_ID } from '../data/places'
import { onProgress, scrollToTarget } from '../fx/engine'
import { clamp01, lerp, stepState, stepTarget } from '../fx/steps'
import { ScrollCue } from './Facility'

/**
 * Hero + masterplan journey: one pinned stage.
 * The hero raises the masterplan into the centre; from there every scroll step
 * moves it left/right, zooms into one part of the city and swaps the story on
 * the other side. All motion is computed from scroll position (no timers).
 */

const MASTERPLAN = imgUrl('newgiza-masterplan.png', 1920)
const HERO_VH = 1.8 // scroll distance (in viewport heights) used by the hero part
const H = 'var(--h,0)' // hero progress 0→1, written by the listener below

const PLACES = [PLACES_BY_ID.ngu, PLACES_BY_ID.health, PLACES_BY_ID.ngsc, PLACES_BY_ID.golf, PLACES_BY_ID.artlife, PLACES_BY_ID.schools]

type Key = { side: number; s: number; fx: number; fy: number; dim: number; place?: string }

/** One keyframe per step. side: 1 = map on the right, -1 = left, 0 = centre. */
const KEYS: Key[] = [
  { side: 0, s: 1, fx: 50, fy: 50, dim: 0 },
  { side: 1, s: 0.92, fx: 50, fy: 50, dim: 0 },
  { side: -1, s: 1.55, fx: 50, fy: 45, dim: 1, place: 'GOLF' },
  { side: 1, s: 2.1, fx: 72, fy: 19, dim: 1, place: 'NGU' },
  { side: -1, s: 2.1, fx: 54, fy: 75, dim: 1, place: 'HEALTH PARK' },
  { side: 1, s: 2.1, fx: 76, fy: 46, dim: 1, place: 'NGSC' },
  { side: -1, s: 2.1, fx: 36, fy: 18, dim: 1, place: 'BRICKLANE · ARTLIFE' },
  { side: 0, s: 0.95, fx: 50, fy: 50, dim: 0, place: '*' },
]
const N = KEYS.length
const TAIL = 0.5 // extra hold on the last step, in steps

const STATS = [
  { value: 1544, label: 'acres total land area' },
  { value: 7000, label: 'units' },
  { value: 2000000, label: 'm² landscape & greenery' },
  { value: 2772446, label: 'm² total built-up area' },
]


export function Journey() {
  const section = useRef<HTMLElement>(null)
  const map = useRef<HTMLDivElement>(null)
  const bg = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const contourA = useRef<HTMLDivElement>(null)
  const contourB = useRef<HTMLDivElement>(null)
  const scrims = useRef<(HTMLDivElement | null)[]>([])
  const steps = useRef<(HTMLDivElement | null)[]>([])
  const markers = useRef<(HTMLDivElement | null)[]>([])
  const dots = useRef<(HTMLButtonElement | null)[]>([])
  const nav = useRef<HTMLDivElement>(null)
  const nums = useRef<(HTMLSpanElement | null)[]>([])
  const geo = useRef({ heroSpan: 1, range: 1, top: 0 })

  useEffect(() => {
    const el = section.current
    if (!el) return
    let size = { w: 0, h: 0, vw: 0, vh: 0 }
    let lastActive = -1

    return onProgress(el, ({ scrolled, range, vh, vw }) => {
      const m = map.current
      if (!m) return
      if (size.vw !== vw || size.vh !== vh) size = { w: m.offsetWidth, h: m.offsetHeight, vw, vh }
      const mobile = vw < 768

      // ---- hero part ----
      const heroSpan = Math.min(HERO_VH * vh, range * 0.4)
      geo.current = { heroSpan, range, top: el.getBoundingClientRect().top + window.scrollY }
      const hp = clamp01(scrolled / heroSpan)
      el.style.setProperty('--h', hp.toFixed(4))
      const q = clamp01((hp - 0.12) * 1.9)

      // ---- journey part ----
      const j = clamp01((scrolled - heroSpan) / Math.max(1, range - heroSpan))
      const { i, e, a } = stepState(j, N, TAIL) // a: 0 … N-1, where the map currently is
      const A = KEYS[i]
      const B = KEYS[i + 1]
      const side = lerp(A.side, B.side, e)
      const s = lerp(A.s, B.s, e)
      const fx = lerp(A.fx, B.fx, e)
      const fy = lerp(A.fy, B.fy, e)
      const dim = lerp(A.dim, B.dim, e)

      const lift = mobile ? clamp01(a) : 0
      const S = (0.86 + 0.14 * q) * s * (1 - 0.22 * lift)
      const x = (mobile ? 0 : side * vw * 0.24) - (fx / 100 - 0.5) * size.w * S
      const y = (1 - q) * vh - lift * vh * 0.17 - (fy / 100 - 0.5) * size.h * S
      m.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotateX(${((1 - q) * 38).toFixed(2)}deg) scale(${S.toFixed(4)})`
      m.style.opacity = clamp01((hp - 0.12) * 4).toFixed(3)
      m.style.setProperty('--fx', `${fx.toFixed(2)}%`)
      m.style.setProperty('--fy', `${fy.toFixed(2)}%`)
      m.style.setProperty('--dim', dim.toFixed(3))
      m.style.setProperty('--inv', (1 / S).toFixed(4))

      // markers: the place of the current step glows, all come back on the last step
      const finalW = clamp01(a - (N - 2))
      PLACES.forEach((p, k) => {
        const node = markers.current[k]
        if (!node) return
        const at = KEYS.findIndex((key) => key.place === p.label)
        const w = at < 0 ? 0 : clamp01(1 - Math.abs(a - at) * 1.6)
        node.style.opacity = (j > 0 ? Math.max(w, finalW) : 0).toFixed(3)
        node.dataset.active = String(w > 0.5)
        node.dataset.label = String(w > 0.5 || (finalW > 0.5 && !mobile))
      })

      // background: ink fades in over the hero photo, contours + grid drift with scroll
      const bgIn = clamp01(j * 8)
      if (bg.current) bg.current.style.opacity = bgIn.toFixed(3)
      if (grid.current) grid.current.style.backgroundPosition = `0 ${(-scrolled * 0.12).toFixed(1)}px`
      if (contourA.current)
        contourA.current.style.transform = `translate3d(0,${(-j * 30).toFixed(2)}vh,0) rotate(${(j * 14).toFixed(2)}deg) scale(${(1 + j * 0.25).toFixed(3)})`
      if (contourB.current)
        contourB.current.style.transform = `translate3d(0,${(j * 22).toFixed(2)}vh,0) rotate(${(-j * 10).toFixed(2)}deg)`

      // scrims keep text readable on the side opposite the map
      const [left, right, bottom] = scrims.current
      if (left) left.style.opacity = (mobile ? 0 : clamp01(side) * bgIn).toFixed(3)
      if (right) right.style.opacity = (mobile ? 0 : clamp01(-side) * bgIn).toFixed(3)
      if (bottom) bottom.style.opacity = (mobile ? clamp01(a) : 0).toFixed(3)

      // story blocks follow the map: each is fully visible while the map rests on its step
      const caption = clamp01((hp - 0.62) * 5)
      steps.current.forEach((node, k) => {
        if (!node) return
        const d = a - k
        let o = clamp01(1 - Math.abs(d) * 2.2)
        if (k === 0) o = Math.min(o, caption)
        node.style.opacity = o.toFixed(3)
        node.style.transform = `translate3d(0,${(d * -60 + (k === 0 ? (1 - caption) * 30 : 0)).toFixed(1)}px,0)`
        node.style.setProperty('--d', d.toFixed(3))
        const on = o > 0.5
        if (node.inert === on) node.inert = !on
      })

      // numbers count up as the map arrives on the numbers step
      const c = 1 - Math.pow(1 - clamp01((a - 0.35) / 0.65), 3)
      STATS.forEach((st, k) => {
        const n = nums.current[k]
        if (n) n.textContent = Math.round(st.value * c).toLocaleString('en-US')
      })

      // step indicator
      if (nav.current) nav.current.style.opacity = clamp01(j * 12).toFixed(3)
      const active = j > 0 ? Math.round(a) : -1
      if (active !== lastActive) {
        lastActive = active
        dots.current.forEach((d, k) => d && (d.dataset.active = String(k + 1 === active)))
      }
    })
  }, [])

  const goTo = (k: number) => {
    const { heroSpan, range, top } = geo.current
    const j = stepTarget(k, N, TAIL)
    scrollToTarget(top + heroSpan + j * (range - heroSpan))
  }

  return (
    <section ref={section} data-progress data-tone="ink" className="relative h-[1040svh] bg-ink">
      <h1 className="sr-only">NewGiza, West Cairo</h1>
      {/* nav "Masterplan" lands on the numbers step */}
      <div id="masterplan" aria-hidden className="absolute top-[296svh] h-px w-px" />

      <div className="sticky top-0 h-svh overflow-hidden [perspective:1400px]">
        {/* hero photo */}
        <div className="absolute inset-0 overflow-hidden">
          <div data-reveal="zoom" className="absolute inset-0">
            <Img src="collection-1.jpg" alt="" eager />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,.5)_0%,rgba(8,8,8,.1)_40%,rgba(8,8,8,.75)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: `clamp(0, calc(${H} * 1.6), .86)` }} />

        {/* journey background */}
        <div ref={bg} aria-hidden className="pointer-events-none absolute inset-0 bg-ink opacity-0">
          <div
            ref={grid}
            className="absolute inset-0 bg-[radial-gradient(rgba(250,247,236,.09)_1px,transparent_1.2px)] bg-[length:30px_30px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
          />
          <div ref={contourA} className="absolute -inset-[30%] will-change-transform">
            <Contours />
          </div>
          <div ref={contourB} className="absolute -inset-[30%] opacity-60 will-change-transform">
            <Contours shift />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(43,63,168,.16),transparent_60%)]" />
        </div>

        <Panels />

        {/* the masterplan */}
        <div
          ref={map}
          className="pointer-events-none absolute top-1/2 left-1/2 z-[2] aspect-[957/1422] h-[min(84svh,120vw)] opacity-0 will-change-transform"
          style={{ transform: 'translate(-50%,-50%) translate3d(0,100vh,0)' }}
        >
          <img
            src={MASTERPLAN}
            alt="NewGiza masterplan"
            decoding="async"
            className="h-full w-full object-contain [filter:drop-shadow(0_40px_60px_rgba(0,0,0,.5))]"
          />
          {/* dim everything except the focused area (masked to the map shape) */}
          <div
            className="absolute inset-0 [mask-size:100%_100%]"
            style={{
              maskImage: `url(${MASTERPLAN})`,
              WebkitMaskImage: `url(${MASTERPLAN})`,
              opacity: 'var(--dim,0)',
              background:
                'radial-gradient(circle at var(--fx,50%) var(--fy,50%), transparent 0, transparent 9%, rgba(14,14,14,.72) 21%)',
            }}
          />
          <div
            className="absolute aspect-square w-[15%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent/80 shadow-[0_0_40px_rgba(232,85,62,.45)]"
            style={{ left: 'var(--fx,50%)', top: 'var(--fy,50%)', opacity: 'var(--dim,0)' }}
          />
          {PLACES.map((p, k) => {
            const flip = p.x > 65
            return (
              <div
                key={p.label}
                ref={(n) => {
                  markers.current[k] = n
                }}
                data-active="false"
                data-label="true"
                className={`group absolute flex -translate-y-1/2 items-center gap-2 opacity-0 ${flip ? '-translate-x-[calc(100%-8px)] flex-row-reverse' : '-translate-x-2'}`}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  scale: 'var(--inv,1)',
                  transformOrigin: flip ? 'calc(100% - 8px) 50%' : '8px 50%',
                }}
              >
                <span className="relative size-4 flex-none rounded-full bg-accent shadow-[0_0_0_6px_rgba(232,85,62,.25)]">
                  <span className="absolute inset-0 rounded-full bg-accent [animation:pulse-ring_1.8s_ease-out_infinite]" />
                </span>
                <span className="rounded bg-paper px-2.5 py-[7px] text-[10px] font-bold tracking-[.1em] whitespace-nowrap text-ink transition-[background-color,opacity] duration-300 group-data-[active=true]:bg-accent group-data-[label=false]:opacity-0 md:text-[11px]">
                  {p.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* hero words + copy (fade out as the journey begins) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[clamp(20px,5vw,80px)] top-1/2 z-[4] flex -translate-y-1/2 justify-between text-[clamp(52px,14.5vw,250px)] leading-[.85] font-extrabold tracking-[-.02em] text-paper"
          style={{ opacity: `clamp(0, calc(1 - (${H} - .25) * 4), 1)` }}
        >
          <span className="block" style={{ transform: `translateX(calc(${H} * -70vw))` }}>
            <span className="block overflow-hidden pb-[.06em]">
              <span data-reveal="mask" data-delay="620" className="block">
                NEW
              </span>
            </span>
          </span>
          <span className="block" style={{ transform: `translateX(calc(${H} * 70vw))` }}>
            <span className="block overflow-hidden pb-[.06em]">
              <span data-reveal="mask" data-delay="720" className="block">
                GIZA
              </span>
            </span>
          </span>
        </div>
        <div
          className="pointer-events-none absolute inset-x-[clamp(20px,5vw,80px)] top-[clamp(96px,14vh,140px)] z-[4] text-[12px] font-semibold tracking-[.24em] text-paper uppercase md:text-[13px]"
          style={{ opacity: `calc(1 - ${H} * 4)` }}
        >
          <div data-reveal="rise" data-delay="1000">
            West Cairo · Cairo–Alex Desert Road · 1,544 acres
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-x-[clamp(20px,5vw,80px)] bottom-[8vh] z-[4] text-paper"
          style={{ opacity: `calc(1 - ${H} * 4)` }}
        >
          <div data-reveal="rise" data-delay="1100" className="flex flex-wrap items-end justify-between gap-8">
            <p className="max-w-[460px] text-[16px] leading-[1.6] md:text-[17px]">
              Ten residential neighbourhoods, a university, a health park, sports clubs, schools and an 18-hole golf
              course, minutes from the Pyramids.
            </p>
            <ScrollCue />
          </div>
        </div>

        {/* readability scrims */}
        <div ref={(n) => { scrims.current[0] = n }} aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[3] w-[60%] bg-[linear-gradient(90deg,rgba(14,14,14,.92)_0%,rgba(14,14,14,.7)_45%,transparent_100%)] opacity-0" />
        <div ref={(n) => { scrims.current[1] = n }} aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-[3] w-[60%] bg-[linear-gradient(270deg,rgba(14,14,14,.92)_0%,rgba(14,14,14,.7)_45%,transparent_100%)] opacity-0" />
        <div ref={(n) => { scrims.current[2] = n }} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[58%] bg-[linear-gradient(0deg,rgba(14,14,14,.96)_0%,rgba(14,14,14,.85)_55%,transparent_100%)] opacity-0" />

        {/* story steps */}
        {STORY.map((st, k) => (
          <div
            key={k}
            ref={(n) => {
              steps.current[k] = n
            }}
            className={`absolute z-[5] text-paper opacity-0 max-md:inset-x-[clamp(20px,6vw,120px)] max-md:bottom-[6svh] ${placeClass(k)}`}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -top-[.62em] -left-[.06em] -z-10 text-[clamp(140px,20vw,320px)] leading-none font-extrabold tracking-[-.06em] text-paper/[.05] select-none max-md:hidden"
              style={{ transform: 'translate3d(0, calc(var(--d,0) * -90px), 0)' }}
            >
              {String(k).padStart(2, '0')}
            </span>
            {k === 1 ? (
              <>
                <div className="eyebrow mb-4 md:mb-6">01 — Masterplan in numbers</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:gap-x-8 md:gap-y-8">
                  {STATS.map((s, n) => (
                    <div key={s.label} className="border-t-2 border-paper/80 pt-3 md:pt-4">
                      <div className="text-[clamp(24px,3.4vw,52px)] font-extrabold tracking-[-.03em] tabular-nums">
                        <span
                          ref={(node) => {
                            nums.current[n] = node
                          }}
                        >
                          0
                        </span>
                      </div>
                      <div className="mt-1 text-[12px] font-semibold text-paper/60 md:text-[13px]">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-[12px] font-medium text-paper/50 md:mt-6 md:text-[13px]">Total footprint 675,198 m²</div>
              </>
            ) : (
              st
            )}
          </div>
        ))}

        {/* step indicator */}
        <div
          ref={nav}
          className="absolute top-1/2 right-[clamp(12px,1.6vw,28px)] z-[6] hidden -translate-y-1/2 flex-col gap-1 opacity-0 md:flex"
          aria-label="Masterplan steps"
          role="navigation"
        >
          {LABELS.map((label, k) => (
            <button
              key={label}
              ref={(n) => {
                dots.current[k] = n
              }}
              type="button"
              onClick={() => goTo(k + 1)}
              aria-label={`Go to ${label}`}
              data-active="false"
              className="group flex h-7 cursor-pointer items-center justify-end gap-3 text-paper"
            >
              <span className="text-[10px] font-bold tracking-[.16em] uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-70 group-data-[active=true]:text-accent group-data-[active=true]:opacity-100">
                {label}
              </span>
              <span className="h-0.5 w-4 bg-paper/30 transition-all duration-500 group-hover:bg-paper/70 group-data-[active=true]:w-8 group-data-[active=true]:bg-accent" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Desktop placement of each story block: opposite side of the map, or bottom-left on centre steps. */
function placeClass(k: number) {
  const side = KEYS[k].side
  if (side === 0) return 'md:bottom-[9vh] md:left-[clamp(20px,5vw,80px)] md:w-[min(380px,30vw)]'
  if (side > 0) return 'md:top-1/2 md:left-[clamp(20px,6vw,120px)] md:-translate-y-1/2 md:w-[min(480px,38vw)]'
  return 'md:top-1/2 md:right-[clamp(56px,7vw,140px)] md:-translate-y-1/2 md:w-[min(480px,38vw)]'
}

const LABELS = ['Numbers', 'Golf', 'NGU', 'Health Park', 'Clubs', 'Artlife', 'Overview']

function Step({ n, title, body, link }: { n: string; title: string; body: string; link?: ReactNode }) {
  return (
    <>
      <div className="eyebrow">{n}</div>
      <h2 className="mt-3 text-[clamp(32px,4.2vw,64px)] leading-none font-extrabold tracking-[-.035em] md:mt-4">{title}</h2>
      <p className="mt-4 max-w-[420px] text-[15px] leading-[1.65] text-paper/75 md:mt-5 md:text-[17px]">{body}</p>
      {link}
    </>
  )
}

const linkCls =
  'mt-6 inline-flex min-h-11 items-center border-b-2 border-accent text-[13px] font-bold tracking-[.14em] uppercase transition-colors hover:text-accent md:mt-7'

const STORY: ReactNode[] = [
  <>
    <div className="eyebrow mb-3 text-[12px]">The masterplan</div>
    <div className="text-[clamp(22px,2.4vw,36px)] leading-[1.15] font-bold tracking-[-.02em]">
      1,544 acres, built around an 18-hole golf course.
    </div>
  </>,
  null, // numbers step is rendered inline (live counters)
  <Step n="02 — Golf" title="18-hole golf course" body="870,159 m² of fairways and lakes at the heart of the masterplan, with homes on every side." />,
  <Step
    n="03 — University"
    title="NewGiza University"
    body="51.7 acres, eight schools, 3,970 students today and a target of 13,000."
    link={<Link to="/university" className={linkCls}>Explore NGU →</Link>}
  />,
  <Step
    n="04 — Healthcare"
    title="NewGiza Health Park"
    body="A 168-bed hospital and 478 clinics across 27 acres, minutes from every home."
    link={<Link to="/health-park" className={linkCls}>Explore Health Park →</Link>}
  />,
  <Step
    n="05 — Sports clubs"
    title="NGSC & ACE"
    body="NewGiza Sports Club serves 10,000 members, and ACE Sports Club is complete."
    link={<Link to="/club" className={linkCls}>Explore the clubs →</Link>}
  />,
  <Step
    n="06 — Town centre"
    title="Bricklane & Artlife"
    body="A town centre for everyday convenience, and a mixed-use district for hotels, dining, culture and offices."
    link={<SmartLink to="/#artlife" className={linkCls}>See Artlife →</SmartLink>}
  />,
  <>
    <div className="eyebrow mb-3">07 — All of it, together</div>
    <div className="text-[clamp(26px,2.8vw,42px)] leading-[1.05] font-extrabold tracking-[-.03em]">
      everything a day needs, inside newgiza.
    </div>
    <p className="mt-4 text-[14px] leading-[1.65] text-paper/70 md:text-[15px]">
      10 neighbourhoods · 4 schools · 2 sports clubs · 2 hotels · university · healthcare · golf.
    </p>
  </>,
]

/** Topographic contour lines for the moving background. */
export function Contours({ shift = false, stroke = 'rgba(250,247,236,.07)' }: { shift?: boolean; stroke?: string }) {
  const rings = Array.from({ length: 14 }, (_, i) => i)
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <g fill="none" stroke={stroke} strokeWidth="1.2">
        {rings.map((i) => {
          const r = 60 + i * 34
          const cx = shift ? 640 : 380
          const cy = shift ? 620 : 420
          return (
            <ellipse
              key={i}
              cx={cx + Math.sin(i * 0.9) * 18}
              cy={cy + Math.cos(i * 0.7) * 14}
              rx={r * (shift ? 1.25 : 1.1)}
              ry={r * (shift ? 0.8 : 0.92)}
              transform={`rotate(${(shift ? -18 : 12) + i * 2.5} ${cx} ${cy})`}
            />
          )
        })}
      </g>
    </svg>
  )
}
