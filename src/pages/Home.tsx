import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Arrow, Count, Frame, Img, Marquee, Panels, StatusDot, Words } from '../components/ui'
import { clamp01, easeInOut } from '../fx/steps'
import { useNear } from '../fx/useNear'
import { useScrollT } from '../fx/useScrollT'
import { AppJourney } from './AppJourney'
import { Journey } from './Journey'

const P = 'var(--p,0)'
const V = 'var(--v,0)'

export function Home() {
  return (
    <>
      <Journey />
      <Statement />
      <Location />
      <Services />
      <Neighbourhoods />
      <Progress />
      <Traffic />
      <Amenities />
      <Artlife />
      <div data-tone="paper" className="tone">
        <Marquee text="learn · heal · play · live · learn · heal · play · live" />
      </div>
      <AppJourney />
      <Footer title="come and see newgiza." />
    </>
  )
}

/* ------------------------------------------------------------- statement */

function Statement() {
  return (
    <section data-progress data-place="all" data-tone="paper" className="tone relative h-[170svh] md:h-[200svh]">
      <div className="sticky top-0 flex h-svh items-center px-[clamp(20px,6vw,120px)]">
        <div className="max-w-[1240px]">
          <div className="eyebrow mb-8">About NewGiza</div>
          <p
            className="bg-clip-text text-[clamp(30px,4.4vw,68px)] leading-[1.1] font-bold tracking-[-.03em] text-pretty text-transparent"
            style={{
              backgroundImage: `linear-gradient(180deg, var(--fg) 0%, var(--fg) calc(${P} * 120% - 10%), color-mix(in oklab, var(--fg) 12%, transparent) calc(${P} * 120% + 10%), color-mix(in oklab, var(--fg) 12%, transparent) 100%)`,
            }}
          >
            newgiza is a city of its own. homes, learning, healthcare, sport and work, set across 2,000,000 m² of
            landscape and greenery.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------- location (road lines) */

const NG = { x: 200, y: 318 }

/** Schematic positions (not to scale): roughly where each place sits relative to NewGiza. */
const DEST = [
  { name: 'The Grand Egyptian Museum', short: 'Grand Egyptian Museum', time: '7 mins', x: 318, y: 268, cx: 250, cy: 250 },
  { name: 'Sphinx International Airport', short: 'Sphinx Airport', time: '10 mins', x: 70, y: 196, cx: 120, cy: 300 },
  { name: 'The Pyramids', short: 'Pyramids', time: '10 mins', x: 300, y: 366, cx: 262, cy: 372 },
  { name: 'Mall of Egypt & Mall of Arabia', short: 'Malls', time: '10 mins', x: 108, y: 452, cx: 186, cy: 420 },
  { name: 'Downtown Cairo · Zamalek', short: 'Zamalek', time: '20 mins', x: 440, y: 214, cx: 350, cy: 196 },
  { name: 'New Cairo & New Administrative Capital', short: 'New Cairo · NAC', time: '40 mins', x: 556, y: 300, cx: 470, cy: 380 },
]

function Location() {
  const section = useRef<HTMLElement>(null)
  const routes = useRef<(SVGPathElement | null)[]>([])
  const ends = useRef<(SVGGElement | null)[]>([])
  const rows = useRef<(HTMLLIElement | null)[]>([])
  const n = DEST.length

  // each road draws in turn as you scroll; its row in the list lights up with it
  useScrollT(
    section,
    (t) => {
      const u = t * (n + 0.4)
      const current = Math.min(n - 1, Math.floor(u))
      DEST.forEach((_, k) => {
        const p = easeInOut(clamp01(u - k))
        routes.current[k]?.style.setProperty('stroke-dashoffset', (1 - p).toFixed(4))
        const g = ends.current[k]
        if (g) {
          const o = clamp01((p - 0.8) * 5)
          g.style.opacity = o.toFixed(3)
          g.style.transform = `scale(${(0.6 + o * 0.4).toFixed(3)})`
        }
        const row = rows.current[k]
        const state = k === current && u > 0 ? 'now' : p > 0 ? 'done' : 'next'
        if (row && row.dataset.state !== state) row.dataset.state = state
      })
    },
    0.55,
    1.1,
  )

  return (
    <section ref={section} data-place="all" data-tone="ink" className="tone px-gutter py-section">
      <div className="grid items-center gap-[clamp(40px,6vw,110px)] lg:grid-cols-2">
        <div>
          <h2 className="type-h2">
            <Words text="all roads lead to newgiza." />
          </h2>
          <p data-reveal="rise" data-delay="100" className="tone-soft mt-7 mb-10 max-w-[420px] text-[17px] leading-[1.7]">
            Easily accessible from 26th of July Rd., the Ring Rd. and El Wahat Rd.
          </p>
          <ul className="tone-line border-t">
            {DEST.map((d, i) => (
              <li
                key={d.name}
                ref={(node) => {
                  rows.current[i] = node
                }}
                data-state="next"
                className="tone-line group relative flex justify-between gap-4 border-b py-4 text-[16px] font-medium transition-[opacity,padding] duration-500 data-[state=next]:opacity-35 data-[state=now]:pl-4"
              >
                <span className="absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 scale-y-0 rounded-full bg-accent transition-transform duration-500 group-data-[state=now]:scale-y-100" />
                <span>{d.name}</span>
                <span className="font-extrabold whitespace-nowrap text-accent">{d.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative max-lg:order-first">
          <div className="relative aspect-square overflow-hidden rounded-[24px] bg-[#151515] ring-1 ring-paper/10">
            <Panels />
            <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full" role="img" aria-label="Schematic map: roads from NewGiza to nearby places">
              <defs>
                <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.2" fill="rgba(250,247,236,.08)" />
                </pattern>
              </defs>
              <rect width="600" height="600" fill="url(#dots)" />
              {/* Nile */}
              <path d="M470 -10 C 430 120, 470 220, 420 330 S 400 520, 440 620" fill="none" stroke="#2B3FA8" strokeWidth="14" strokeLinecap="round" opacity=".55" />
              <text x="452" y="560" fill="#6F82E6" fontSize="13" fontWeight="700" letterSpacing="3" opacity=".7">
                NILE
              </text>
              {/* ring road + desert road */}
              <ellipse cx="360" cy="300" rx="190" ry="160" fill="none" stroke="rgba(250,247,236,.12)" strokeWidth="2" strokeDasharray="6 8" />
              <path d="M200 318 L -10 560" stroke="rgba(250,247,236,.14)" strokeWidth="3" />
              <text x="30" y="545" fill="rgba(250,247,236,.35)" fontSize="11" fontWeight="700" letterSpacing="2" transform="rotate(-49 30 545)">
                CAIRO–ALEX DESERT RD
              </text>
              <text x="372" y="110" fill="rgba(250,247,236,.16)" fontSize="34" fontWeight="800" letterSpacing="6">
                CAIRO
              </text>
              <text x="250" y="560" fill="rgba(250,247,236,.12)" fontSize="26" fontWeight="800" letterSpacing="6">
                GIZA
              </text>

              {/* roads drawn by scroll */}
              {DEST.map((d, i) => (
                <path
                  key={d.name}
                  ref={(node) => {
                    routes.current[i] = node
                  }}
                  d={`M${NG.x} ${NG.y} Q ${d.cx} ${d.cy} ${d.x} ${d.y}`}
                  pathLength={1}
                  fill="none"
                  stroke="#E8553E"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="1"
                  style={{ strokeDashoffset: 1 }}
                />
              ))}
              {DEST.map((d, i) => {
                const left = d.x > 470
                return (
                  <g
                    key={d.name}
                    ref={(node) => {
                      ends.current[i] = node
                    }}
                    style={{ opacity: 0, transformOrigin: `${d.x}px ${d.y}px`, transformBox: 'view-box' }}
                  >
                    <circle cx={d.x} cy={d.y} r="7" fill="#FAF7EC" />
                    <circle cx={d.x} cy={d.y} r="3" fill="#E8553E" />
                    <text x={left ? d.x - 12 : d.x + 12} y={d.y - 4} textAnchor={left ? 'end' : 'start'} fill="#FAF7EC" fontSize="15" fontWeight="700">
                      {d.short}
                    </text>
                    <text x={left ? d.x - 12 : d.x + 12} y={d.y + 15} textAnchor={left ? 'end' : 'start'} fill="#E8553E" fontSize="13" fontWeight="800">
                      {d.time}
                    </text>
                  </g>
                )
              })}

              {/* NewGiza */}
              <circle cx={NG.x} cy={NG.y} r="26" fill="#E8553E" opacity=".18">
                <animate attributeName="r" values="18;34;18" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values=".35;0;.35" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle cx={NG.x} cy={NG.y} r="11" fill="#E8553E" stroke="#FAF7EC" strokeWidth="3" />
              <rect x={NG.x - 58} y={NG.y + 20} width="116" height="28" rx="6" fill="#FAF7EC" />
              <text x={NG.x} y={NG.y + 39} textAnchor="middle" fill="#0E0E0E" fontSize="14" fontWeight="800" letterSpacing="2">
                NEWGIZA
              </text>
            </svg>
          </div>
          <p className="tone-soft mt-3 text-[12px]">Schematic map, not to scale. Drive times from the NewGiza presentation.</p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------ services (track) */

const SERVICES = [
  { to: '/university', img: 'ngu-building.jpg', tag: '01 · UNIVERSITY', title: 'NGU', body: 'Eight schools from medicine to fine arts, growing to 13,000 students.', at: 0.2, place: 'ngu' as const },
  { to: '/health-park', img: 'hospital.jpg', tag: '02 · HEALTHCARE', title: 'Health Park', body: 'A 168-bed hospital and 478 clinics.', at: 0.55, place: 'health' as const },
  { to: '/club', img: 'ngsc-aerial.jpg', tag: '03 · SPORT', title: 'NewGiza Sports Club', body: 'NGSC, ACE Sports Club and the 18-hole golf course.', at: 0.9, place: 'ngsc' as const },
]

function Services() {
  const ref = useRef<HTMLElement>(null)
  const near = useNear(ref)
  return (
    <section ref={ref} data-progress data-tone="paper" className="tone relative h-[320svh] md:h-[420svh]">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <div data-htrack className="flex h-[74svh] gap-[3vw] px-[6vw] will-change-transform">
          <div data-place="all" className="flex flex-[0_0_82vw] flex-col justify-end pb-[4vh] md:flex-[0_0_34vw]">
            <div className="eyebrow mb-6">Facilities of NewGiza</div>
            <h2 className="text-[clamp(44px,5vw,84px)] leading-[.95] font-extrabold tracking-[-.04em]">learn. heal. play.</h2>
            <p className="tone-soft mt-7 max-w-[380px] text-[17px] leading-[1.7]">
              Each facility has its own page with its spaces, figures and community.
            </p>
            <div className="tone-soft mt-8 flex items-center gap-3 text-[12px] font-bold tracking-[.2em] uppercase md:hidden">
              Keep scrolling <span aria-hidden>→</span>
            </div>
          </div>
          {SERVICES.map((s) => (
            <Link key={s.to} to={s.to} data-place={s.place} className="group relative block flex-[0_0_86vw] overflow-hidden rounded-[24px] text-paper md:flex-[0_0_64vw]">
              <div className="absolute inset-y-0 -inset-x-[12%]" style={{ transform: `translateX(calc((${P} - ${s.at}) * 16%))` }}>
                {near && <Img src={s.img} alt="" eager sizes="(min-width: 768px) 80vw, 110vw" className="transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-105" />}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0)_35%,rgba(8,8,8,.85)_100%)]" />
              <div className="absolute inset-x-[clamp(20px,3vw,48px)] bottom-[clamp(20px,3vw,48px)] flex items-end justify-between gap-6">
                <div>
                  <div className="text-[12px] font-bold tracking-[.2em] text-accent md:text-[13px]">{s.tag}</div>
                  <div className="mt-3 text-[clamp(34px,4.6vw,76px)] leading-none font-extrabold tracking-[-.035em]">{s.title}</div>
                  <div className="mt-3 max-w-[440px] text-[15px] leading-[1.6] md:text-[16px]">{s.body}</div>
                </div>
                <Arrow className="max-md:hidden" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------- neighbourhoods (card stack) */

const HOODS = [
  { done: true, status: 'COMPLETE', names: ['IVORY HILL', 'JASPERWOODS', 'AMBERVILLE'], imgs: ['ivoryhill-1.jpg', 'ivoryhill-2.jpg', 'ivoryhill-3.jpg', 'ivoryhill-4.jpg'], bg: 'bg-[#1A1A1A]', place: 'ivoryhill' as const },
  { done: true, status: 'COMPLETE', names: ['DISTRICT ONE', 'CARNELL PARK', 'WESTRIDGE'], imgs: ['districtone-1.jpg', 'districtone-2.jpg'], bg: 'bg-[#1F1F1F]', place: 'districtone' as const },
  { done: true, status: 'COMPLETE', names: ['GOLDCLIFF', 'KINGSRANGE'], imgs: ['goldcliff.jpg'], bg: 'bg-[#242424]', place: 'goldcliff' as const },
  {
    done: true,
    status: 'COMPLETE · APARTMENTS, DUPLEXES',
    names: ['THE COLLECTION'],
    body: 'The Collection serviced apartments are gracefully nestled amidst lush landscapes, parks and tranquil water features, with a world-class spa, an outdoor pool and professional concierge services.',
    imgs: ['collection-2.jpg'],
    bg: 'bg-[#292929]',
    place: 'collection' as const,
  },
  {
    done: true,
    status: 'COMPLETE · MANSIONS',
    names: ['theforty4'],
    body: 'An intimate outlook on exclusivity and private luxury living. Elevated on the highest point of the golf course, the neighbourhood opens onto an expansive view of four fairways.',
    imgs: ['forty4.jpg'],
    bg: 'bg-[#2E2E2E]',
    place: 'forty4' as const,
  },
  {
    done: true,
    status: 'COMPLETE · APARTMENTS',
    names: ['KINGS COLLECTION'],
    body: 'Fully finished and luxuriously spacious apartments in the heart of NewGiza, majestically overlooking the golf.',
    imgs: ['kings.jpg'],
    bg: 'bg-[#333333]',
    place: 'kings' as const,
    bold: true,
  },
]

function Neighbourhoods() {
  const section = useRef<HTMLElement>(null)
  const cards = useRef<(HTMLElement | null)[]>([])
  const shades = useRef<(HTMLDivElement | null)[]>([])

  // depth: as the next card slides over, the one underneath shrinks and darkens
  useScrollT(section, () => {
    cards.current.forEach((card, i) => {
      if (!card) return
      const next = cards.current[i + 1]
      let c = 0
      if (next) {
        const a = card.getBoundingClientRect()
        const b = next.getBoundingClientRect()
        c = clamp01(1 - (b.top - a.top - 18) / Math.max(1, card.offsetHeight))
      }
      card.style.transform = `scale(${(1 - c * 0.07).toFixed(4)})`
      const s = shades.current[i]
      if (s) s.style.opacity = (c * 0.65).toFixed(3)
    })
  })

  return (
    <section ref={section} id="neighbourhoods" data-tone="ink" className="tone px-gutter py-section">
      <div className="mb-[clamp(48px,8vh,96px)] flex flex-wrap items-end justify-between gap-8">
        <h2 className="type-h2">
          <Words text="neighbourhoods | of newgiza." />
        </h2>
        <p data-reveal="rise" data-delay="120" className="tone-soft max-w-[420px] text-[17px] leading-[1.7]">
          Ten residential neighbourhoods, all complete and ready to live in.
        </p>
      </div>
      <div className="grid gap-6">
        {HOODS.map((h, i) => (
          <article
            key={h.names[0]}
            ref={(node) => {
              cards.current[i] = node
            }}
            data-place={h.place}
            className={`sticky grid h-[78svh] origin-top grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[24px] text-paper shadow-[0_-20px_60px_-20px_rgba(0,0,0,.6)] will-change-transform md:h-[76svh] md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:grid-rows-1 ${h.bg}`}
            style={{ top: `calc(11svh + ${i * 18}px)` }}
          >
            <div className="flex flex-col justify-between gap-4 p-[clamp(20px,3.5vw,56px)] md:gap-6">
              <div className="flex items-center gap-2.5 text-[11px] font-bold tracking-[.16em] md:text-[12px]">
                <StatusDot done={h.done} />
                {h.status}
              </div>
              <div>
                <h3
                  className={`text-[clamp(22px,3vw,48px)] leading-[1.3] ${h.bold ? 'font-bold tracking-[.04em]' : h.names[0] === 'theforty4' ? 'font-light tracking-[.12em]' : 'font-light tracking-[.18em]'}`}
                >
                  {h.names.map((n) => (
                    <span key={n} className="block">
                      {n}
                    </span>
                  ))}
                </h3>
                {h.body && (
                  <p className="mt-4 max-w-[420px] text-[14px] leading-[1.7] text-paper/75 max-md:line-clamp-3 md:mt-5 md:text-[15px]">
                    {h.body}
                  </p>
                )}
              </div>
              <div className="hidden text-[13px] font-semibold tracking-[.1em] text-paper/60 md:block">
                RESIDENTIAL · {String(i + 1).padStart(2, '0')}
              </div>
            </div>
            <div className={`grid gap-1.5 ${h.imgs.length > 1 ? 'grid-cols-2' : ''} ${h.imgs.length > 2 ? 'grid-rows-2' : ''}`}>
              {h.imgs.map((src) => (
                <div key={src} className="relative overflow-hidden">
                  <Img src={src} alt={`${h.names[0].toLowerCase()} neighbourhood`} sizes={h.imgs.length > 1 ? "(min-width: 768px) 32vw, 50vw" : "(min-width: 768px) 62vw, 100vw"} className="transition-transform duration-[1.4s] ease-[var(--ease-soft)] hover:scale-105" />
                </div>
              ))}
            </div>
            <div
              ref={(node) => {
                shades.current[i] = node
              }}
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-ink opacity-0"
            />
          </article>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------- progress (rings) */

const PROGRESS = [
  { value: 6278, ratio: 1, label: 'TOTAL UNITS' },
  { value: 5719, ratio: 5719 / 6278, label: 'UNITS SOLD*' },
  { value: 3375, ratio: 3375 / 6278, label: 'UNITS DELIVERED*' },
  { value: 2500, ratio: 2500 / 40000, label: 'RESIDENTS TODAY', sub: 'of 40,000 at completion' },
  { value: 100, ratio: 1, label: 'PROJECT COMPLETED', pct: true },
]

function Progress() {
  const section = useRef<HTMLElement>(null)
  const rings = useRef<(SVGCircleElement | null)[]>([])
  const nums = useRef<(HTMLSpanElement | null)[]>([])

  // rings fill and numbers climb with scroll (and go back when scrolling up)
  useScrollT(
    section,
    (t) => {
      PROGRESS.forEach((s, k) => {
        const f = 1 - Math.pow(1 - clamp01(t * 1.35 - k * 0.09), 3)
        rings.current[k]?.style.setProperty('stroke-dashoffset', (1 - f * s.ratio).toFixed(4))
        const n = nums.current[k]
        if (n) n.textContent = Math.round(s.value * f).toLocaleString('en-US')
      })
    },
    0.9,
    0.6,
  )

  return (
    <section
      ref={section}
      data-place="all"
      data-tone="ink"
      className="tone tone-line border-t px-gutter pt-[clamp(60px,10vh,120px)] pb-[clamp(80px,14vh,160px)]"
    >
      <div className="grid items-center gap-[clamp(40px,6vw,96px)] lg:grid-cols-2">
        <h2 className="text-[clamp(44px,5.6vw,90px)] leading-[.95] font-extrabold tracking-[-.04em]">
          <Words text="newgiza's progress through the years." />
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(170px,1fr))] sm:gap-4">
          {PROGRESS.map((s, k) => {
            const last = k === PROGRESS.length - 1
            return (
              <div
                key={s.label}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-full p-5 text-center ${
                  last ? 'bg-accent text-ink max-sm:col-span-2 max-sm:mx-auto max-sm:w-1/2' : 'bg-blue text-paper'
                }`}
              >
                <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="46.5" fill="none" stroke={last ? 'rgba(14,14,14,.18)' : 'rgba(250,247,236,.16)'} strokeWidth="3" />
                  <circle
                    ref={(node) => {
                      rings.current[k] = node
                    }}
                    cx="50"
                    cy="50"
                    r="46.5"
                    fill="none"
                    stroke={last ? '#0E0E0E' : '#E8553E'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="1"
                    style={{ strokeDashoffset: 1 }}
                  />
                </svg>
                <div className={`text-[clamp(26px,3.4vw,52px)] font-extrabold tracking-[-.03em] tabular-nums ${last ? '' : 'text-accent'}`}>
                  <span
                    ref={(node) => {
                      nums.current[k] = node
                    }}
                  >
                    {s.value.toLocaleString('en-US')}
                  </span>
                  {s.pct && '%'}
                </div>
                <div className="mt-1.5 text-[10px] font-bold tracking-[.14em] sm:text-[11px]">{s.label}</div>
                {s.sub && <div className="mt-1 text-[10px] opacity-60">{s.sub}</div>}
              </div>
            )
          })}
        </div>
      </div>
      <div className="tone-soft mt-8 text-[12px] font-medium">*Across NewGiza as of Dec 2022</div>
    </section>
  )
}

/* --------------------------------------------------------------- traffic */

const TRAFFIC = [
  { value: 188000, label: 'residents in neighbouring private compounds' },
  { value: 40000, label: 'residents expected at completion' },
  { value: 10000, label: 'family members in NGSC' },
  { value: 13000, label: 'students NGU will reach, from 4,000 today' },
  { value: 8000, label: 'students across 4 international schools' },
]

function Traffic() {
  return (
    <section data-place="all" data-tone="paper" className="tone px-gutter py-section">
      <h2 className="mb-[clamp(48px,8vh,96px)] text-[clamp(48px,7vw,120px)] leading-[.92] font-extrabold tracking-[-.045em]">
        <Words text="newgiza traffic." />
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-x-12 gap-y-10">
        {TRAFFIC.map((s, i) => (
          <div key={s.label} data-reveal="rise" data-delay={i * 80} className="border-t-2 border-accent pt-5">
            <div className="text-[clamp(40px,4.4vw,68px)] font-extrabold tracking-[-.035em] tabular-nums">
              <Count value={s.value} />
            </div>
            <p className="tone-soft mt-2 text-[15px] leading-[1.6]">{s.label}</p>
          </div>
        ))}
      </div>
      <div data-place="schools" className="mt-[clamp(56px,9vh,110px)] grid gap-[clamp(12px,1.6vw,24px)] md:grid-cols-12">
        <Frame src="schools-aerial.jpg" alt="Aerial view of a NewGiza school campus" k={0.1} radius="rounded-[20px]" className="h-[44svh] md:col-span-7 md:h-[60svh]" />
        <Frame src="schools-students.jpg" alt="Students at a NewGiza school" k={-0.08} base={150} radius="rounded-[20px]" className="h-[44svh] md:col-span-5 md:h-[60svh]" />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- amenities */

function Label({ children }: { children: string }) {
  return (
    <span className="absolute bottom-4 left-4 z-[2] rounded-full bg-paper/90 px-3.5 py-2 text-[11px] font-bold tracking-[.14em] text-ink uppercase backdrop-blur">
      {children}
    </span>
  )
}

function Amenities() {
  return (
    <section data-place="artlife" data-tone="paper2" className="tone px-gutter py-section">
      <div className="grid items-center gap-[clamp(40px,6vw,100px)] lg:grid-cols-2">
        <Frame src="bricklane.jpg" alt="Bricklane town centre" k={0.1} className="h-[56svh] lg:h-[72svh]" />
        <div>
          <div data-reveal="rise" className="eyebrow mb-6">
            Amenities
          </div>
          <h2 className="text-[clamp(30px,3.6vw,56px)] leading-[1.05] font-extrabold tracking-[-.035em]">
            <Words text="Because every community is entitled to a world class form of convenience, NEWGIZA has created Bricklane." base={100} step={45} />
          </h2>
          <p data-reveal="rise" data-delay="200" className="tone-soft mt-7 max-w-[480px] text-[17px] leading-[1.7]">
            The town's community center is the center point for everyday convenience, where homeowners can enjoy short
            trips to the bank, stellar restaurants, helpful service vendors, supermarkets, and boutique grocers.
          </p>
        </div>
      </div>
      <div className="mt-[clamp(48px,8vh,96px)] grid gap-[clamp(12px,1.6vw,24px)] md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="grid gap-[clamp(12px,1.6vw,24px)]">
          <Frame src="ghouse.jpg" alt="The G House" k={0.06} radius="rounded-[20px]" className="h-[38svh]">
            <Label>The G House</Label>
          </Frame>
          <Frame src="glakes.jpg" alt="G Lakes" k={-0.06} base={120} radius="rounded-[20px]" className="h-[38svh]">
            <Label>G Lakes</Label>
          </Frame>
        </div>
        <Frame src="thouse.jpg" alt="T House" k={0.08} base={240} radius="rounded-[20px]" className="min-h-[50svh] md:min-h-[60svh]">
          <Label>T House</Label>
        </Frame>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- artlife */

const ARTLIFE = [
  { img: 'artlife-hotel.jpg', title: 'DISTINCTIVE HOSPITALITY', body: 'An iconic boutique hotel and a 5-star hotel.' },
  { img: 'artlife-fitness.jpg', title: 'STATE OF THE ART FITNESS', body: 'Cutting-edge fitness outlets from accredited operators.' },
  { img: 'artlife-dining.jpg', title: 'IMPECCABLE FINE DINING', body: 'Niche specialties and rooftop bars with Pyramid views.' },
  { img: 'artlife-cinema.jpg', title: 'CULTURE & PERFORMANCE', body: 'Cultural shows and artistic performances.' },
  { img: 'artlife-retail.jpg', title: 'UPSCALE RETAIL', body: 'Fashion and retail along landscaped streets.' },
  { img: 'artlife-offices.jpg', title: 'OFFICES FOR NEW MINDED GENERATIONS', body: 'Indoor-outdoor layouts, 5G and IoT.' },
]

const OFFICES = [
  { img: 'pixellabs.jpg', name: 'PixelLabs', cls: 'font-bold tracking-[-.02em]', body: 'Two modern attached buildings with a connected atrium and an inspirational rooftop.', k: 0.06 },
  { img: 'sudoku.jpg', name: 'SŪDOKU', cls: 'font-light tracking-[.2em]', body: 'Office buildings with a flexible, gridded layout you can tailor to your needs.', k: -0.06 },
]

function Artlife() {
  const ref = useRef<HTMLElement>(null)
  const near = useNear(ref)
  return (
    <section ref={ref} id="artlife" data-place="artlife" data-tone="ink" className="tone overflow-hidden py-section">
      <div className="flex flex-wrap items-end justify-between gap-8 px-gutter">
        <h2 data-reveal="rise" className="text-[clamp(88px,14vw,240px)] leading-[.82] font-extrabold tracking-[-.03em]">
          ART
          <br />
          LIFE
        </h2>
        <p data-reveal="rise" data-delay="150" className="tone-soft max-w-[440px] text-[17px] leading-[1.7]">
          A mixed-use district inside NewGiza with a boutique hotel and a 5-star hotel, fitness, fine dining, rooftop
          bars, culture, upscale retail and offices.
        </p>
      </div>

      <div className="relative mt-[clamp(48px,8vh,96px)] h-[56svh] overflow-hidden rounded-[24px] md:h-[72svh] [margin-inline:clamp(20px,6vw,120px)]">
        <Panels />
        <div data-view className="absolute inset-0" style={{ transform: `scale(calc(1.3 - ${V} * .3))` }}>
          <Img src="artlife-rooftop.jpg" alt="Artlife rooftop at dusk" />
        </div>
      </div>

      <div className="mt-[clamp(24px,4vh,48px)]">
        <ul data-vtrack className="flex w-max gap-5 pl-[clamp(20px,6vw,120px)] will-change-transform">
          {ARTLIFE.map((a) => (
            <li key={a.title} className="group w-[min(520px,74vw)]">
              <div className="relative h-[clamp(220px,32svh,300px)] overflow-hidden rounded-[18px]">
                {near && <Img src={a.img} alt="" eager sizes="(min-width: 768px) 520px, 74vw" className="transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-105" />}
              </div>
              <h3 className="mt-4 text-[13px] font-extrabold tracking-[.06em] text-accent">{a.title}</h3>
              <p className="tone-soft mt-1.5 text-[15px]">{a.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-[clamp(32px,2vw,28px)] px-gutter pt-[clamp(56px,9vh,110px)] md:grid-cols-2">
        {OFFICES.map((o, i) => (
          <div key={o.name} data-reveal="rise" data-delay={i * 140}>
            <div className="relative h-[40svh] overflow-hidden rounded-[20px] md:h-[46svh]">
              <div data-parallax={o.k} className="absolute inset-x-0 -top-[12%] -bottom-[12%]">
                <Img src={o.img} alt={`${o.name} office buildings`} sizes="(min-width: 768px) 46vw, 100vw" />
              </div>
            </div>
            <div className="mt-5 flex items-baseline justify-between gap-4">
              <h3 className={`text-[28px] ${o.cls}`}>{o.name}</h3>
              <span className="text-[12px] font-bold tracking-[.14em] text-accent">COMPLETE</span>
            </div>
            <p className="tone-soft mt-2.5 max-w-[520px] text-[15px] leading-[1.7]">{o.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
