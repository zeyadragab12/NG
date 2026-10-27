import { useEffect, useRef, type ReactNode } from 'react'
import { Img, Words } from '../components/ui'
import { onProgress } from '../fx/engine'
import { clamp01, lerp, stepState } from '../fx/steps'
import { useNear } from '../fx/useNear'
import { Contours } from './Journey'

/**
 * Resident app journey: the same pattern as the masterplan journey.
 * The phone stays pinned and swaps sides each step, while its screen slides to
 * the feature being described on the other side.
 */

const SIDES = [1, -1, 1, -1, 1] // 1 = phone on the right
const N = SIDES.length
const TAIL = 0.5

const NOTES = [
  null,
  { dot: 'bg-ok', title: 'Guest arrived at Gate 2', sub: 'Omar Hassan · Just now' },
  { dot: 'bg-blue', title: 'Court 3 is booked', sub: 'Tonight · 7:00 PM' },
  { dot: 'bg-accent', title: 'Technician on the way', sub: 'Request #2041 · 10 min' },
  { dot: 'bg-ok', title: 'Payment received', sub: 'EGP 4,850 · Service charge' },
]

export function AppJourney() {
  const section = useRef<HTMLElement>(null)
  const near = useNear(section)
  const phone = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const circle = useRef<HTMLDivElement>(null)
  const cA = useRef<HTMLDivElement>(null)
  const cB = useRef<HTMLDivElement>(null)
  const steps = useRef<(HTMLDivElement | null)[]>([])
  const notes = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const el = section.current
    if (!el) return
    return onProgress(el, ({ p, vh, vw }) => {
      const mobile = vw < 768
      const { i, e, a } = stepState(p, N, TAIL)
      const side = lerp(SIDES[i], SIDES[i + 1], e)
      const swing = Math.sin(Math.PI * e) * (SIDES[i + 1] - SIDES[i]) // -2…2 while travelling

      const scale = mobile ? Math.min(0.6, (vh * 0.42) / 640) : Math.min(1, (vh * 0.8) / 640)
      const x = mobile ? 0 : side * vw * 0.22
      const y = mobile ? -vh * 0.13 : 0
      if (phone.current)
        phone.current.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${(y - Math.abs(swing) * 18).toFixed(1)}px,0) rotate(${(-swing * 3).toFixed(2)}deg) scale(${scale.toFixed(3)})`
      if (circle.current)
        circle.current.style.transform = `translate(-50%,-50%) translate3d(${(x * 0.85).toFixed(1)}px,${y.toFixed(1)}px,0) scale(${(0.9 + Math.abs(swing) * 0.06 + clamp01(p * 6) * 0.1).toFixed(3)})`
      if (strip.current) strip.current.style.transform = `translate3d(${(-a * 100) / N}%,0,0)`
      if (cA.current) cA.current.style.transform = `translate3d(0,${(-p * 26).toFixed(2)}vh,0) rotate(${(p * 16).toFixed(2)}deg)`
      if (cB.current) cB.current.style.transform = `translate3d(0,${(p * 18).toFixed(2)}vh,0) rotate(${(-p * 12).toFixed(2)}deg)`

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
      notes.current.forEach((node, k) => {
        if (!node) return
        const o = clamp01(1 - Math.abs(a - k) * 3)
        node.style.opacity = o.toFixed(3)
        node.style.transform = `translate3d(0,${((1 - o) * 24).toFixed(1)}px,0) scale(${(0.9 + o * 0.1).toFixed(3)})`
      })
    })
  }, [])

  return (
    <section id="app" ref={section} data-progress data-tone="paper2" className="relative h-[600svh] bg-paper-2">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div ref={cA} aria-hidden className="pointer-events-none absolute -inset-[30%] will-change-transform">
          <Contours stroke="rgba(14,14,14,.07)" />
        </div>
        <div ref={cB} aria-hidden className="pointer-events-none absolute -inset-[30%] opacity-70 will-change-transform">
          <Contours shift stroke="rgba(43,63,168,.08)" />
        </div>

        <div
          ref={circle}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[min(560px,80vw,62svh)] rounded-full bg-blue will-change-transform"
        />

        {/* phone */}
        <div
          ref={phone}
          aria-hidden
          className="absolute top-1/2 left-1/2 z-[3] h-[640px] w-[310px] will-change-transform"
          style={{ transform: 'translate(-50%,-50%)' }}
        >
          <div className="h-full w-full rounded-[50px] bg-[#050505] p-3 shadow-[0_60px_100px_-30px_rgba(14,14,14,.55)]">
            <div className="relative h-full w-full overflow-hidden rounded-[40px] bg-paper">
              <div className="absolute inset-x-0 top-0 z-10 flex h-11 items-center justify-between bg-paper px-6 text-[12px] font-bold">
                <span>9:41</span>
                <span className="h-[26px] w-[90px] rounded-[20px] bg-[#050505]" />
                <span>100%</span>
              </div>
              <div ref={strip} className="flex h-full will-change-transform" style={{ width: `${N * 100}%` }}>
                {SCREENS.map((s, k) => (
                  <div key={k} className="relative flex h-full flex-col pt-11" style={{ width: `${100 / N}%` }}>
                    {near ? s : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* notifications pop beside the phone */}
          {NOTES.map((n, k) =>
            n ? (
              <div
                key={k}
                ref={(node) => {
                  notes.current[k] = node
                }}
                className="absolute -right-24 top-[18%] flex w-[250px] items-center gap-3 rounded-2xl bg-white px-[18px] py-3.5 opacity-0 shadow-[0_24px_50px_-20px_rgba(14,14,14,.45)] max-md:-right-10"
              >
                <span className={`size-2.5 flex-none rounded-full ${n.dot}`} />
                <div>
                  <div className="text-[13px] font-bold">{n.title}</div>
                  <div className="text-[11px] text-muted">{n.sub}</div>
                </div>
              </div>
            ) : null,
          )}
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[50%] bg-[linear-gradient(0deg,#F3EEDD_0%,#F3EEDD_55%,transparent_100%)] md:hidden" />

        {/* story */}
        {STORY.map((st, k) => (
          <div
            key={k}
            ref={(n) => {
              steps.current[k] = n
            }}
            className={`absolute z-[5] max-md:inset-x-[clamp(20px,6vw,120px)] max-md:bottom-[5svh] md:top-1/2 md:w-[min(500px,38vw)] md:-translate-y-1/2 ${
              SIDES[k] > 0 ? 'md:left-[clamp(20px,6vw,120px)]' : 'md:right-[clamp(20px,6vw,120px)]'
            } ${k ? 'opacity-0' : ''}`}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -top-[.6em] -left-[.06em] -z-10 text-[clamp(140px,20vw,320px)] leading-none font-extrabold tracking-[-.06em] text-ink/[.04] select-none max-md:hidden"
              style={{ transform: 'translate3d(0, calc(var(--d,0) * -90px), 0)' }}
            >
              {String(k).padStart(2, '0')}
            </span>
            {k > 0 && (
              <div className="mb-4 flex gap-1.5" aria-hidden>
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={`h-[3px] w-7 rounded-full ${n <= k ? 'bg-accent' : 'bg-ink/15'}`} />
                ))}
              </div>
            )}
            {st}
          </div>
        ))}
      </div>
    </section>
  )
}

function Feature({ n, title, body, children }: { n: string; title: string; body: string; children?: ReactNode }) {
  return (
    <>
      <div className="eyebrow">{n}</div>
      <h3 className="mt-3 text-[clamp(30px,3.8vw,58px)] leading-[1.02] font-extrabold tracking-[-.035em] md:mt-4">{title}</h3>
      <p className="mt-4 max-w-[440px] text-[15px] leading-[1.65] text-muted md:mt-5 md:text-[17px]">{body}</p>
      {children}
    </>
  )
}

/**
 * Official store badges (Apple: developer.apple.com, Google: play.google.com/badges), used unmodified.
 * Paste the app's store URLs here; until then the badges show without a link.
 */
const STORE_LINKS = { appStore: '', googlePlay: '' }

const BADGES = [
  // Google's PNG has transparent padding built in, so it is drawn taller to match Apple's badge height
  { name: 'Download on the App Store', src: '/badges/app-store.svg', href: STORE_LINKS.appStore, cls: 'h-11 w-auto' },
  { name: 'Get it on Google Play', src: '/badges/google-play.png', href: STORE_LINKS.googlePlay, cls: '-my-[11px] -mx-[4px] h-[66px] w-auto' },
]

const STORES = (
  <div className="mt-7 flex flex-wrap items-center gap-3">
    {BADGES.map((b) => {
      const img = <img src={b.src} alt={b.name} className={b.cls} draggable={false} />
      return b.href ? (
        <a key={b.name} href={b.href} target="_blank" rel="noopener noreferrer" className="rounded-[9px] transition-transform duration-300 hover:-translate-y-0.5">
          {img}
        </a>
      ) : (
        <span key={b.name} title="Coming soon" className="inline-flex">
          {img}
        </span>
      )
    })}
  </div>
)

const STORY: ReactNode[] = [
  <>
    <div className="eyebrow mb-5">The NewGiza app</div>
    <h2 className="text-[clamp(38px,5vw,80px)] leading-[.95] font-extrabold tracking-[-.04em]">
      <Words text="the whole community in your pocket." base={100} />
    </h2>
    <p className="mt-6 max-w-[460px] text-[15px] leading-[1.65] text-muted md:text-[18px]">
      One app built for NewGiza residents. Scroll to see what it does.
    </p>
  </>,
  <Feature n="01 — Guest access" title="Visitor passes in seconds." body="Send a guest a QR pass. The gate scans it and you get a message the moment they arrive." />,
  <Feature n="02 — Bookings" title="Book NGSC courts." body="Padel, tennis and football at NGSC. Pick a court and a time, and it is yours." />,
  <Feature n="03 — Requests" title="Maintenance, tracked." body="Report a problem with a photo and follow it live, from request to technician to done." />,
  <Feature n="04 — Payments & news" title="Pay and stay in the loop." body="Settle service charges in the app and follow events and news across the community.">
    {STORES}
  </Feature>,
]

/* ---------------------------------------------------------------- screens */

function ScreenTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="px-5 pt-3">
      <div className="text-[11px] font-bold tracking-[.14em] text-muted uppercase">{kicker}</div>
      <div className="mt-0.5 text-[22px] font-extrabold tracking-[-.02em]">{title}</div>
    </div>
  )
}

function TabBar({ active }: { active: number }) {
  return (
    <div className="mt-auto flex h-16 flex-none items-center justify-around border-t border-ink/10">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={`h-1 w-[22px] rounded-sm ${i === active ? 'bg-ink' : 'bg-ink/25'}`} />
      ))}
    </div>
  )
}

/** Deterministic QR-like pattern (decorative). */
function Qr() {
  const n = 21
  const cells: [number, number][] = []
  let seed = 7
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && rnd() > 0.52) cells.push([x, y])
  const F = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x} y={y} width="7" height="7" fill="#0E0E0E" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#0E0E0E" />
    </g>
  )
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="h-full w-full" shapeRendering="crispEdges">
      <rect width={n} height={n} fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0E0E0E" />
      ))}
      <F x={0} y={0} />
      <F x={n - 7} y={0} />
      <F x={0} y={n - 7} />
    </svg>
  )
}

const SCREENS: ReactNode[] = [
  // 0 home
  <>
    <div className="flex items-center justify-between px-5 pt-2.5">
      <div>
        <div className="text-[12px] text-muted">Good evening,</div>
        <div className="text-[22px] font-extrabold tracking-[-.02em]">Nour</div>
      </div>
      <span className="text-[13px] font-extrabold">NEWGIZA</span>
    </div>
    <div className="relative mx-5 mt-4 h-[140px] flex-none overflow-hidden rounded-[18px]">
      <Img src="ngsc-aerial.jpg" eager sizes="300px" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0),rgba(8,8,8,.8))]" />
      <div className="absolute bottom-3 left-3.5 text-paper">
        <div className="text-[10px] font-bold tracking-[.14em] text-accent">TONIGHT · 7:00 PM</div>
        <div className="text-[15px] font-bold">NGSC padel court 3</div>
      </div>
    </div>
    <div className="mx-5 mt-3.5 grid grid-cols-2 gap-2.5">
      <div className="flex h-[86px] flex-col justify-between rounded-2xl bg-ink p-3.5 text-paper">
        <span className="size-[22px] rounded-[5px] border-2 border-accent" />
        <span className="text-[13px] font-bold">Invite guest</span>
      </div>
      {[
        ['Book club', 'rounded-full'],
        ['Requests', 'rotate-45'],
        ['Payments', 'rounded-[5px]'],
      ].map(([t, shape]) => (
        <div key={t} className="flex h-[86px] flex-col justify-between rounded-2xl bg-paper-3 p-3.5">
          <span className={`size-[22px] border-2 border-blue ${shape}`} />
          <span className="text-[13px] font-bold">{t}</span>
        </div>
      ))}
    </div>
    <div className="mx-5 mt-3.5 text-[11px] font-bold tracking-[.14em] text-muted">COMMUNITY NEWS</div>
    <div className="mx-5 mt-2 flex items-center gap-2.5 rounded-[14px] bg-white p-2.5">
      <div className="relative size-11 flex-none overflow-hidden rounded-[10px]">
        <Img src="ghouse.jpg" eager sizes="60px" />
      </div>
      <div>
        <div className="text-[12px] font-bold">Live music at The G House</div>
        <div className="text-[11px] text-muted">Friday · 8:00 PM</div>
      </div>
    </div>
    <TabBar active={0} />
  </>,
  // 1 guest pass
  <>
    <ScreenTitle kicker="Invite guest" title="Guest pass" />
    <div className="mx-5 mt-4 rounded-[22px] bg-ink p-5 text-paper">
      <div className="flex items-center justify-between text-[11px] font-bold tracking-[.14em] text-accent">
        <span>VISITOR</span>
        <span className="text-ok">● ACTIVE</span>
      </div>
      <div className="mt-2 text-[20px] font-extrabold">Omar Hassan</div>
      <div className="text-[12px] text-paper/60">Today · from 6:00 PM</div>
      <div className="mx-auto mt-4 size-[150px] rounded-xl bg-white p-2.5">
        <Qr />
      </div>
      <div className="mt-3 text-center text-[11px] font-semibold text-paper/60">Gate 2 · valid until 11:59 PM</div>
    </div>
    <div className="mx-5 mt-4 flex h-11 flex-none items-center justify-center rounded-full bg-accent text-[13px] font-extrabold tracking-[.08em] text-ink">
      SHARE PASS
    </div>
    <TabBar active={0} />
  </>,
  // 2 booking
  <>
    <ScreenTitle kicker="NGSC" title="Book a court" />
    <div className="mx-5 mt-4 flex gap-2">
      {['Padel', 'Tennis', 'Football'].map((t, i) => (
        <span key={t} className={`rounded-full px-3.5 py-2 text-[12px] font-bold ${i ? 'bg-paper-3' : 'bg-ink text-paper'}`}>
          {t}
        </span>
      ))}
    </div>
    <div className="mx-5 mt-4 grid grid-cols-5 gap-1.5 text-center">
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
        <div key={d} className={`rounded-xl py-2 ${i === 2 ? 'bg-blue text-paper' : 'bg-white'}`}>
          <div className="text-[10px] font-semibold opacity-70">{d}</div>
          <div className="text-[15px] font-extrabold">{12 + i}</div>
        </div>
      ))}
    </div>
    <div className="mx-5 mt-4 text-[11px] font-bold tracking-[.14em] text-muted">AVAILABLE TIMES</div>
    <div className="mx-5 mt-2 grid grid-cols-3 gap-2">
      {['5:00', '6:00', '7:00', '8:00', '9:00', '10:00'].map((t) => (
        <span
          key={t}
          className={`rounded-xl py-2.5 text-center text-[13px] font-bold ${t === '7:00' ? 'bg-accent text-ink' : t === '5:00' ? 'bg-white text-ink/30 line-through' : 'bg-white'}`}
        >
          {t} PM
        </span>
      ))}
    </div>
    <div className="mx-5 mt-4 flex items-center justify-between rounded-2xl bg-white p-3.5">
      <div>
        <div className="text-[13px] font-bold">Court 3 · Padel</div>
        <div className="text-[11px] text-muted">Wed 14 · 7:00–8:00 PM</div>
      </div>
      <span className="rounded-full bg-ink px-3.5 py-2 text-[11px] font-extrabold text-paper">CONFIRM</span>
    </div>
    <TabBar active={1} />
  </>,
  // 3 request tracking
  <>
    <ScreenTitle kicker="Request #2041" title="AC maintenance" />
    <div className="relative mx-5 mt-4 h-[110px] flex-none overflow-hidden rounded-[18px]">
      <Img src="ivoryhill-2.jpg" eager sizes="300px" />
      <span className="absolute top-2.5 left-2.5 rounded-full bg-paper px-2.5 py-1 text-[10px] font-bold">Villa 14 · Ivory Hill</span>
    </div>
    <ol className="mx-5 mt-4 grid gap-0">
      {[
        ['Request sent', 'Mon · 9:12 AM', 'done'],
        ['Technician assigned', 'Ahmed · AC team', 'done'],
        ['On the way', 'Arrives in about 10 min', 'now'],
        ['Done', 'You can rate the visit', 'next'],
      ].map(([t, s, st], i) => (
        <li key={t} className="relative flex gap-3 pb-4 pl-0.5">
          {i < 3 && <span className={`absolute top-4 left-[7.5px] h-full w-0.5 ${st === 'done' ? 'bg-ok' : 'bg-ink/15'}`} />}
          <span
            className={`relative mt-0.5 size-4 flex-none rounded-full border-2 ${
              st === 'done' ? 'border-ok bg-ok' : st === 'now' ? 'border-accent bg-paper' : 'border-ink/20 bg-paper'
            }`}
          />
          <div>
            <div className={`text-[13px] font-bold ${st === 'next' ? 'text-ink/40' : ''}`}>{t}</div>
            <div className="text-[11px] text-muted">{s}</div>
          </div>
        </li>
      ))}
    </ol>
    <TabBar active={2} />
  </>,
  // 4 payments + news
  <>
    <ScreenTitle kicker="Payments" title="Your account" />
    <div className="mx-5 mt-4 rounded-[22px] bg-blue p-5 text-paper">
      <div className="text-[11px] font-bold tracking-[.14em] text-paper/70">SERVICE CHARGE · Q4</div>
      <div className="mt-1 text-[28px] font-extrabold tracking-[-.02em]">EGP 4,850</div>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-paper/15 px-3 py-1 text-[11px] font-bold">
        <span className="size-1.5 rounded-full bg-ok" /> Paid · 27 Oct
      </div>
    </div>
    <div className="mx-5 mt-4 text-[11px] font-bold tracking-[.14em] text-muted">THIS WEEK</div>
    {[
      ['artlife-dining.jpg', 'Rooftop dinner at Artlife', 'Thursday · 8:30 PM'],
      ['golf.jpg', 'Junior golf clinic', 'Saturday · 10:00 AM'],
    ].map(([img, t, s]) => (
      <div key={t} className="mx-5 mt-2 flex items-center gap-2.5 rounded-[14px] bg-white p-2.5">
        <div className="relative size-11 flex-none overflow-hidden rounded-[10px]">
          <Img src={img} eager sizes="60px" />
        </div>
        <div>
          <div className="text-[12px] font-bold">{t}</div>
          <div className="text-[11px] text-muted">{s}</div>
        </div>
      </div>
    ))}
    <TabBar active={3} />
  </>,
]
