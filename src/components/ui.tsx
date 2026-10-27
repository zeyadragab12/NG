import { Fragment, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { scrollToTarget } from '../fx/engine'
import images from '../data/images.json'

/** Inline styles that use CSS custom properties (scroll-driven formulas). */
export const css = (o: Record<string, string | number>) => o as CSSProperties

type ImageMeta = { w: number; h: number; sizes: number[] }
const IMAGES = images as Record<string, ImageMeta>
const webp = (src: string, w: number) => `/img/${src.replace(/\.(jpe?g|png)$/i, '')}-${w}.webp`

/** Smallest generated WebP at least `width` px wide (falls back to the original file). */
export function imgUrl(src: string, width = 960) {
  const m = IMAGES[src]
  if (!m) return `/assets/${src}`
  return webp(src, m.sizes.find((s) => s >= width) ?? m.sizes[m.sizes.length - 1])
}

/** srcset for every generated width of `src` (WebP copies made by `npm run images`). */
export function imgSrcSet(src: string) {
  const m = IMAGES[src]
  return m ? m.sizes.map((w) => `${webp(src, w)} ${w}w`).join(', ') : undefined
}

export function Img({
  src,
  alt = '',
  fit = 'cover',
  eager = false,
  sizes = '100vw',
  className = '',
}: {
  src: string
  alt?: string
  fit?: 'cover' | 'contain'
  eager?: boolean
  /** How wide the image shows on screen, so the browser picks the right file. */
  sizes?: string
  className?: string
}) {
  const m = IMAGES[src]
  return (
    <img
      src={imgUrl(src)}
      srcSet={imgSrcSet(src)}
      sizes={m ? sizes : undefined}
      width={m?.w}
      height={m?.h}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className={`absolute inset-0 h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
    />
  )
}

/** Five dark columns that lift in sequence to uncover an image. */
export function Panels({ base = 0 }: { base?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] grid grid-cols-5">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} data-reveal="out" data-delay={base + i * 70} className="-mr-px bg-ink" />
      ))}
    </div>
  )
}

/** Heading words that rise out of a mask one after another. Use "|" for a line break. */
export function Words({ text, base = 0, step = 70 }: { text: string; base?: number; step?: number }) {
  let n = 0
  return text.split(' ').map((w, i) =>
    w === '|' ? (
      <br key={i} />
    ) : (
      <Fragment key={i}>
        {i > 0 && text.split(' ')[i - 1] !== '|' && ' '}
        <span className="mask-wrap">
          <span data-reveal="mask" data-delay={base + n++ * step} className="inline-block">
            {w}
          </span>
        </span>
      </Fragment>
    ),
  )
}

export function Count({ value, dec = 0 }: { value: number; dec?: number }) {
  return (
    <span data-count={value} data-dec={dec}>
      {value.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })}
    </span>
  )
}

/** Rounded image frame with the panel reveal and a parallax layer. */
export function Frame({
  src,
  alt = '',
  k = 0.08,
  base = 0,
  className = '',
  radius = 'rounded-[24px]',
  panels = true,
  fit = 'cover',
  sizes = '(min-width: 1024px) 50vw, 100vw',
  children,
}: {
  src: string
  alt?: string
  k?: number
  base?: number
  className?: string
  radius?: string
  panels?: boolean
  fit?: 'cover' | 'contain'
  sizes?: string
  children?: ReactNode
}) {
  return (
    <div className={`relative isolate overflow-hidden bg-ink ${radius} ${className}`}>
      {panels && <Panels base={base} />}
      <div data-parallax={k} className="absolute inset-x-0 -top-[12%] -bottom-[12%]">
        <Img src={src} alt={alt} sizes={sizes} fit={fit} className={fit === 'contain' ? 'p-[6%]' : ''} />
      </div>
      {children}
    </div>
  )
}

export function Arrow({ size = 64, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={`flex flex-none items-center justify-center rounded-full bg-paper text-ink transition-transform duration-500 ease-[var(--ease-soft)] group-hover:-rotate-45 group-hover:scale-110 ${className}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12h16M14 6l6 6-6 6" />
      </svg>
    </span>
  )
}

/** Router link that smooth-scrolls when the target is a section on the current page. */
export function SmartLink({
  to,
  className,
  children,
  onClick,
  ...rest
}: {
  to: string
  className?: string
  children: ReactNode
  onClick?: () => void
  'aria-current'?: 'page' | undefined
}) {
  const { pathname } = useLocation()
  const [path, hash] = to.split('#')
  const handle = (e: MouseEvent) => {
    onClick?.()
    if (hash && (path || '/') === pathname) {
      const el = document.getElementById(hash)
      if (el) {
        e.preventDefault()
        scrollToTarget(el)
      }
    }
  }
  return (
    <Link to={to} className={className} onClick={handle} {...rest}>
      {children}
    </Link>
  )
}

export function Marquee({ text, shift = '-45%' }: { text: string; shift?: string }) {
  return (
    <section
      data-view
      aria-hidden
      className="tone-line overflow-hidden border-y py-[5vh]"
    >
      <div
        className="whitespace-nowrap text-[clamp(64px,11vw,190px)] font-extrabold leading-none tracking-[-.045em] will-change-transform"
        style={{ transform: `translateX(calc(var(--v,0) * ${shift}))` }}
      >
        {text}
      </div>
    </section>
  )
}

export function StatusDot({ done }: { done: boolean }) {
  return <span className={`inline-block size-2 flex-none rounded-full ${done ? 'bg-ok' : 'bg-accent'}`} />
}
