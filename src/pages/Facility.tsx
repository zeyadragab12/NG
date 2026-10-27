import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Arrow, Count, Frame, Img, Marquee, Panels, Words, css } from '../components/ui'
import { FACILITIES, type Facility } from '../data/facilities'
import type { PlaceId } from '../data/places'
import { PLAN_JOURNEYS } from '../data/planJourneys'
import { PlanJourney } from './PlanJourney'

const P = 'var(--p,0)'

const placeOf = (f: Facility): PlaceId => (f.slug === 'university' ? 'ngu' : f.slug === 'health-park' ? 'health' : 'ngsc')

export function FacilityPage({ facility: f }: { facility: Facility }) {
  return (
    <>
      <Hero f={f} />
      <Overview f={f} />
      <PlanJourney key={f.slug} plan={PLAN_JOURNEYS[f.slug]} place={placeOf(f)} />
      <Details f={f} />
      <Space f={f} />
      <Marquee text={f.marquee} shift="-40%" />
      <Community f={f} />
      <More current={f.slug} />
      <Footer title={f.footerTitle} cta="Get in touch" home={false} />
    </>
  )
}

function Hero({ f }: { f: Facility }) {
  const chars = [...f.title]
  const n = chars.length
  const mid = (n - 1) / 2
  const size = `clamp(${n <= 5 ? 64 : 40}px, ${Math.min(13, 150 / n).toFixed(2)}vw, 220px)`

  return (
    <section data-progress data-tone="ink" className="relative h-[220svh] bg-ink md:h-[260svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div data-reveal="zoom" className="absolute inset-0">
            <Img src={f.hero} alt={f.name} eager />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,.5)_0%,rgba(8,8,8,.1)_40%,rgba(8,8,8,.78)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: `clamp(0, calc(${P} * 1.5), .82)` }} />
        <Panels />

        <div
          className="pointer-events-none absolute inset-x-[clamp(20px,5vw,80px)] top-[clamp(96px,14vh,140px)] z-[4]"
          style={{ opacity: `calc(1 - ${P} * 5)` }}
        >
          <div data-reveal="rise" data-delay="1000" className="eyebrow">
            {f.tag} · {f.name}
          </div>
        </div>

        <h1
          aria-label={f.name}
          className="pointer-events-none absolute inset-x-[clamp(20px,5vw,80px)] top-1/2 z-[4] m-0 flex -translate-y-1/2 justify-center whitespace-nowrap font-extrabold leading-[.85] tracking-[-.045em] text-paper"
          style={{ fontSize: size, opacity: `clamp(0, calc(1 - (${P} - .2) * 4), 1)` }}
        >
          {chars.map((c, i) => (
            <span
              key={i}
              aria-hidden
              className="block"
              style={{ transform: `translateX(calc(${P} * ${(mid ? ((i - mid) / mid) * 48 : 0).toFixed(1)}vw))` }}
            >
              <span className="block overflow-hidden pb-[.06em]">
                <span data-reveal="mask" data-delay={620 + i * 45} className="block">
                  {c === ' ' ? ' ' : c}
                </span>
              </span>
            </span>
          ))}
        </h1>

        <div
          className="pointer-events-none absolute inset-x-[clamp(20px,5vw,80px)] bottom-[8vh] z-[4] text-paper"
          style={{ opacity: `calc(1 - ${P} * 5)` }}
        >
          <div data-reveal="rise" data-delay="1100" className="flex flex-wrap items-end justify-between gap-8">
            <p className="max-w-[460px] text-[17px] leading-[1.6]">{f.intro}</p>
            <ScrollCue />
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-x-[clamp(20px,5vw,80px)] top-1/2 z-[4] flex justify-center text-center text-paper"
          style={css({
            '--r': `clamp(0, calc((${P} - .4) * 3), 1)`,
            opacity: `clamp(0, calc((${P} - .4) * 4), 1)`,
            transform: 'translateY(calc(-50% + (1 - var(--r)) * 120px))',
          })}
        >
          <p className="type-lead max-w-[900px]">{f.intro}</p>
        </div>
      </div>
    </section>
  )
}

export function ScrollCue() {
  return (
    <div className="flex items-center gap-3.5 text-[12px] font-semibold uppercase tracking-[.2em]">
      <span className="relative h-12 w-px overflow-hidden bg-paper/25">
        <span className="absolute inset-0 bg-paper [animation:scroll-cue_2.2s_var(--ease-rise)_infinite]" />
      </span>
      Scroll to explore
    </div>
  )
}

function Overview({ f }: { f: Facility }) {
  return (
    <section data-place={placeOf(f)} className="px-gutter py-section">
      <div data-reveal="rise" className="eyebrow mb-8">
        Overview
      </div>
      <p data-reveal="rise" data-delay="100" className="max-w-[24ch] text-[clamp(28px,3.8vw,58px)] font-bold leading-[1.12] tracking-[-.03em] text-pretty">
        {f.overview}
      </p>
      <div className="mt-[clamp(56px,9vh,110px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-8 gap-y-10">
        {f.stats.map((s, i) => (
          <div key={s.label} data-reveal="rise" data-delay={i * 100} className="border-t-2 border-ink pt-[18px]">
            <div className="text-[clamp(40px,4.6vw,72px)] font-extrabold tracking-[-.035em] tabular-nums">
              <Count value={s.value} dec={s.dec} />
            </div>
            <div className="mt-1.5 text-[14px] font-semibold text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Space({ f }: { f: Facility }) {
  const n = f.space.length
  return (
    <section data-place={placeOf(f)} data-progress data-tone="ink" className="relative h-[340svh] bg-ink text-paper md:h-[400svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {f.space.map((s, i) => {
          const start = i === 0 ? 0 : (2 * i - 1) / (2 * n) // .167, .5
          return (
            <div
              key={s.img}
              className="absolute inset-0 bg-ink"
              style={i ? { clipPath: `inset(calc((1 - clamp(0, calc((${P} - ${start.toFixed(3)}) * 6), 1)) * 100%) 0 0 0)` } : undefined}
            >
              <div
                className="absolute inset-0"
                style={{ transform: `scale(calc(1.15 - clamp(0, calc((${P} - ${(i / n).toFixed(3)}) * 3), 1) * .15))` }}
              >
                <Img src={s.img} alt={s.title} fit={s.fit} className={s.fit === 'contain' ? 'p-[10vh_4vw_22vh]' : ''} />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,.8)_0%,rgba(8,8,8,.15)_65%)] max-md:bg-[linear-gradient(180deg,rgba(8,8,8,.2)_30%,rgba(8,8,8,.85)_100%)]" />
            </div>
          )
        })}

        <div className="eyebrow absolute top-[clamp(96px,14vh,140px)] left-[clamp(20px,6vw,120px)]">The space</div>

        <div className="pointer-events-none absolute inset-x-[clamp(20px,6vw,120px)] bottom-[12vh] h-[320px]">
          {f.space.map((s, i) => {
            const s0 = i === 0 ? 0 : (2 * i - 1) / (2 * n)
            const e0 = i === n - 1 ? 1 : (2 * i + 1) / (2 * n)
            const fadeIn = `clamp(0, calc((${P} - ${s0.toFixed(3)}) * 12), 1)`
            const fadeOut = `clamp(0, calc((${e0.toFixed(3)} - ${P}) * 12), 1)`
            const o = i === 0 ? fadeOut : i === n - 1 ? fadeIn : `min(${fadeIn}, ${fadeOut})`
            return (
              <div
                key={s.title}
                className="absolute inset-x-0 bottom-0 pr-10"
                style={css({ '--o': o, opacity: 'var(--o)', transform: 'translateY(calc((1 - var(--o)) * 40px))' })}
              >
                <div className="text-[13px] font-bold tracking-[.2em] text-accent">
                  0{i + 1} / 0{n}
                </div>
                <h3 className="mt-4 text-[clamp(36px,5vw,80px)] font-extrabold leading-none tracking-[-.035em]">{s.title}</h3>
                <p className="mt-5 max-w-[440px] text-[17px] leading-[1.7] text-paper/85">{s.body}</p>
              </div>
            )
          })}
        </div>

        <div className="absolute right-[clamp(20px,6vw,120px)] bottom-[12vh] h-40 w-0.5 bg-paper/20">
          <div className="w-full bg-accent" style={{ height: `calc(${P} * 100%)` }} />
        </div>
      </div>
    </section>
  )
}

function Details({ f }: { f: Facility }) {
  return (
    <section data-place={placeOf(f)} className="px-gutter py-section">
      <div className="grid items-start gap-[clamp(32px,6vw,100px)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <h2 className="type-h2 md:sticky md:top-[120px]">
          <Words text={f.detailsTitle} />
        </h2>
        <ol className="border-t border-ink/15">
          {f.details.map((d, i) => (
            <li
              key={d}
              data-reveal="rise"
              data-delay={(i % 6) * 70}
              className="group flex items-baseline gap-6 border-b border-ink/15 py-[22px]"
            >
              <span className="min-w-7 text-[13px] font-extrabold text-accent">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[clamp(22px,2.4vw,36px)] font-bold tracking-[-.02em] transition-transform duration-500 ease-[var(--ease-soft)] group-hover:translate-x-2">
                {d}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {f.cards && (
        <div className="mt-[clamp(56px,9vh,100px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-[clamp(16px,2vw,28px)]">
          {f.cards.map((c, i) => (
            <div key={c.title} data-reveal="rise" data-delay={i * 120}>
              <Frame src={c.img} alt={c.title} k={i % 2 ? 0.06 : -0.06} radius="rounded-[20px]" panels={false} className="h-[44svh] min-h-[280px]" />
              <div className="mt-[18px] flex items-baseline justify-between gap-3">
                <span className="text-[24px] font-extrabold tracking-[-.02em]">{c.title}</span>
                <span className="text-[11px] font-extrabold uppercase tracking-[.14em] text-accent">{c.status}</span>
              </div>
              <div className="mt-1.5 text-[15px] font-medium text-muted">{c.sub}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function Community({ f }: { f: Facility }) {
  return (
    <section data-place={placeOf(f)} data-tone="ink" className="bg-ink px-gutter py-section text-paper">
      <div className="grid items-center gap-[clamp(48px,6vw,110px)] md:grid-cols-2">
        <Frame src={f.communityImg} alt="" k={0.12} fit={f.communityFit} className="h-[60svh] md:h-[78svh]" />
        <div>
          <div data-reveal="rise" className="eyebrow mb-6">
            Community
          </div>
          <p data-reveal="rise" data-delay="100" className="text-[clamp(26px,2.8vw,42px)] font-bold leading-[1.2] tracking-[-.025em] text-pretty">
            {f.community}
          </p>
          <ul className="mt-12 border-t border-paper/15">
            {f.communityList.map((c, i) => (
              <li key={c} data-reveal="rise" data-delay={i * 90} className="flex gap-5 border-b border-paper/15 py-5 text-[18px] font-semibold">
                <span className="pt-[3px] text-[14px] font-extrabold text-accent">0{i + 1}</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function More({ current }: { current: Facility['slug'] }) {
  const others = FACILITIES.filter((f) => f.slug !== current)
  return (
    <section className="px-gutter py-section">
      <div data-reveal="rise" className="eyebrow mb-8">
        More in NewGiza
      </div>
      <div className="grid gap-[clamp(16px,2vw,28px)] md:grid-cols-2">
        {others.map((o, i) => (
          <Link
            key={o.slug}
            to={`/${o.slug}`}
            data-reveal="rise"
            data-delay={i * 140}
            className="group relative block h-[48svh] overflow-hidden rounded-[24px] text-paper md:h-[56svh]"
          >
            <div data-parallax="0.08" className="absolute inset-x-0 -top-[12%] -bottom-[12%]">
              <Img src={o.hero} alt="" sizes="(min-width: 768px) 50vw, 100vw" className="transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-105" />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0)_40%,rgba(8,8,8,.85)_100%)]" />
            <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 md:inset-x-8 md:bottom-8">
              <div>
                <div className="text-[12px] font-bold uppercase tracking-[.2em] text-accent">{o.tag}</div>
                <div className="mt-2.5 text-[clamp(30px,3.4vw,52px)] font-extrabold leading-none tracking-[-.035em]">{o.name}</div>
              </div>
              <Arrow size={56} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
