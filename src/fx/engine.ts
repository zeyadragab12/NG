import Lenis from 'lenis'

/**
 * Scroll motion engine, ported from the handoff's scrollfx.js.
 *
 * One requestAnimationFrame loop drives Lenis smooth scrolling and every
 * data-attribute effect. Each frame reads all geometry first, then writes,
 * and only writes values that changed, so the page never thrashes layout.
 *
 *   data-reveal="rise|mask|out|clip|zoom"  plays once when it enters the viewport
 *   data-delay="ms"                         explicit transition delay
 *   data-progress                           exposes --p (0→1) through a tall section
 *   data-htrack (inside data-progress)      slides horizontally with --p (and with sideways swipes)
 *   data-window="start,end"                 inert unless --p is inside the window
 *   data-view                               exposes --v, 0→1 progress through the viewport
 *   data-vtrack                             slides horizontally while passing the viewport
 *   data-parallax="k"                       translateY by distance from viewport centre × k
 *   data-count="N" data-dec="d"             counts up once visible
 *   data-scrollbar / data-nav               page progress bar and nav state
 */

let lenis: Lenis | null = null

export function scrollToTarget(target: HTMLElement | number, immediate = false) {
  if (lenis) {
    lenis.scrollTo(target, { immediate, force: true, duration: 1.6 })
    return
  }
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: immediate ? 'instant' : 'smooth' })
  else target.scrollIntoView({ behavior: immediate ? 'instant' : 'smooth' })
}

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
const fmt = (n: number, dec: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })

type Progress = { el: HTMLElement; track: HTMLElement | null; windows: HTMLElement[] }
type ScrollListener = (info: { y: number; vh: number; vw: number }) => void
const scrollListeners = new Set<ScrollListener>()

/** Run `fn` every frame the page scroll (or viewport) changes. */
export function onScroll(fn: ScrollListener): () => void {
  scrollListeners.add(fn)
  requestUpdate()
  return () => {
    scrollListeners.delete(fn)
  }
}

type ProgressListener = (info: { p: number; scrolled: number; range: number; vh: number; vw: number }) => void
const listeners = new Map<HTMLElement, Set<ProgressListener>>()
let requestUpdate = () => {}

/** Run `fn` every frame the scroll position of a [data-progress] section changes. */
export function onProgress(el: HTMLElement, fn: ProgressListener): () => void {
  let set = listeners.get(el)
  if (!set) listeners.set(el, (set = new Set()))
  set.add(fn)
  requestUpdate()
  return () => {
    set.delete(fn)
    if (!set.size) listeners.delete(el)
  }
}


export function startScrollFx(): () => void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.history.scrollRestoration = 'manual'

  if (!reduce) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 })
  }

  const written = new WeakMap<HTMLElement, Map<string, string>>()
  const write = (el: HTMLElement, key: string, value: string) => {
    let rec = written.get(el)
    if (!rec) written.set(el, (rec = new Map()))
    if (rec.get(key) === value) return
    rec.set(key, value)
    el.style.setProperty(key, value)
  }

  let pending: HTMLElement[] = []
  let progress: Progress[] = []
  let views: HTMLElement[] = []
  let vtracks: HTMLElement[] = []
  let parallax: HTMLElement[] = []
  let counts: HTMLElement[] = []
  let bar: HTMLElement | null = null
  let nav: HTMLElement | null = null

  let needScan = true
  let dirty = true
  let lastY = -1
  let navY = 0
  let raf = 0

  const scan = () => {
    needScan = false
    dirty = true
    pending = []
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      if (el.dataset.fx === '1') return
      if (!el.dataset.fx) {
        el.dataset.fx = '0'
        if (el.dataset.delay) el.style.transitionDelay = `${el.dataset.delay}ms`
      }
      if (reduce) el.dataset.fx = '1'
      else pending.push(el)
    })
    progress = [...document.querySelectorAll<HTMLElement>('[data-progress]')].map((el) => ({
      el,
      track: el.querySelector<HTMLElement>('[data-htrack]'),
      windows: [...el.querySelectorAll<HTMLElement>('[data-window]')],
    }))
    views = [...document.querySelectorAll<HTMLElement>('[data-view]')]
    vtracks = [...document.querySelectorAll<HTMLElement>('[data-vtrack]')]
    parallax = reduce ? [] : [...document.querySelectorAll<HTMLElement>('[data-parallax]')]
    counts = [...document.querySelectorAll<HTMLElement>('[data-count]:not([data-counted])')]
    if (reduce) {
      counts.forEach((el) => (el.dataset.counted = '1'))
      counts = []
    } else {
      counts.forEach((el) => {
        if (el.dataset.armed) return
        el.dataset.armed = '1'
        el.textContent = fmt(0, +(el.dataset.dec || 0))
      })
    }
    bar = document.querySelector('[data-scrollbar]')
    nav = document.querySelector('[data-nav]')
  }

  const runCount = (el: HTMLElement) => {
    el.dataset.counted = '1'
    const to = parseFloat(el.dataset.count || '0')
    const dec = +(el.dataset.dec || 0)
    const t0 = performance.now()
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 1800)
      el.textContent = fmt(to * (1 - Math.pow(1 - k, 4)), dec)
      if (k < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  const update = (y: number) => {
    const h = window.innerHeight
    const w = window.innerWidth

    // ---- read phase ----
    const toReveal: HTMLElement[] = []
    pending = pending.filter((el) => {
      if (!el.isConnected) return false
      const r = el.getBoundingClientRect()
      const type = el.dataset.reveal
      const off = type === 'rise' ? 64 : type === 'mask' ? r.height * 1.1 : 0
      if (r.top - off < h * 0.92 && r.bottom > 0) {
        toReveal.push(el)
        return false
      }
      return true
    })

    const pReads = progress.map(({ el, track }) => {
      const r = el.getBoundingClientRect()
      const span = el.dataset.progress === 'self' ? r.height : Math.max(1, r.height - h)
      const p = clamp01(-r.top / span)
      const dx = track ? Math.max(0, track.scrollWidth - w) : 0
      return { p, dx, scrolled: -r.top, range: span }
    })
    const vReads = views.map((el) => {
      const r = el.getBoundingClientRect()
      return clamp01((h - r.top) / (h + r.height))
    })
    const vtReads = vtracks.map((el) => {
      const r = el.getBoundingClientRect()
      const v = clamp01((h - r.top) / (h + r.height))
      return { e: clamp01((v - 0.2) / 0.55), dx: Math.max(0, el.scrollWidth - w + w * 0.06) }
    })
    const parReads = parallax.map((el) => {
      const r = (el.parentElement ?? el).getBoundingClientRect()
      return r.top + r.height / 2 - h / 2
    })
    const countsDue = counts.filter((el) => {
      const r = el.getBoundingClientRect()
      return r.top < h * 0.92 && r.bottom > 0
    })
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - h)

    // section listeners read their own geometry, so run them before the engine writes styles
    scrollListeners.forEach((fn) => fn({ y, vh: h, vw: w }))

    // ---- write phase ----
    let k = 0
    toReveal.forEach((el) => {
      if (!el.dataset.delay && el.dataset.reveal === 'rise') {
        el.style.transitionDelay = `${Math.min(k, 8) * 90}ms`
        k++
      }
      el.dataset.fx = '1'
    })

    progress.forEach(({ el, track, windows }, i) => {
      const { p, dx, scrolled, range } = pReads[i]
      write(el, '--p', p.toFixed(4))
      listeners.get(el)?.forEach((fn) => fn({ p, scrolled, range, vh: h, vw: w }))
      if (track) write(track, 'transform', `translate3d(${(-p * dx).toFixed(1)}px,0,0)`)
      windows.forEach((win) => {
        const [s, e] = (win.dataset.window || '0,1').split(',').map(Number)
        const on = p >= s && (e >= 1 ? true : p < e)
        if (win.inert === on) win.inert = !on
      })
    })
    views.forEach((el, i) => write(el, '--v', vReads[i].toFixed(4)))
    vtracks.forEach((el, i) =>
      write(el, 'transform', `translate3d(${(-vtReads[i].e * vtReads[i].dx).toFixed(1)}px,0,0)`),
    )
    parallax.forEach((el, i) =>
      write(el, 'transform', `translate3d(0,${(-parReads[i] * +(el.dataset.parallax || 0)).toFixed(1)}px,0)`),
    )
    if (countsDue.length) {
      countsDue.forEach(runCount)
      counts = counts.filter((el) => !el.dataset.counted)
    }

    if (bar) write(bar, 'transform', `scaleX(${(y / maxScroll).toFixed(4)})`)
    if (nav) {
      const solid = y > h * 0.6
      if (nav.dataset.solid !== String(solid)) nav.dataset.solid = String(solid)
      // hide on the way down, show on the way up
      const delta = y - navY
      if (Math.abs(delta) > 6) {
        const hidden = delta > 0 && y > h * 1.2
        if (nav.dataset.hidden !== String(hidden)) nav.dataset.hidden = String(hidden)
        navY = y
      }
    }
  }

  const tick = (t: number) => {
    lenis?.raf(t)
    if (needScan) scan()
    const y = window.scrollY
    if (y !== lastY) {
      lastY = y
      dirty = true
    }
    if (dirty) {
      dirty = false
      update(y)
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  // ---- sideways input on horizontal tracks ----
  // A pinned [data-htrack] section moves with vertical scroll. A sideways swipe (trackpad,
  // Shift + wheel, finger) over it is turned into the vertical scroll that moves the track
  // the same distance, so the cards follow whichever way the user pushes them.
  const trackAt = (clientY: number) => {
    const h = window.innerHeight
    for (const { el, track } of progress) {
      if (!track) continue
      const r = el.getBoundingClientRect()
      // only while the section is pinned, so a sideways swipe never jumps the page into it
      if (r.top > 1 || r.bottom < h - 1 || r.top > clientY || r.bottom < clientY) continue
      const range = Math.max(1, r.height - h)
      const dx = Math.max(1, track.scrollWidth - window.innerWidth)
      return { start: window.scrollY + r.top, range, ratio: range / dx }
    }
    return null
  }
  // vertical scroll target for a sideways move of `dx` px; null when the track is already at that end
  const sidewaysTarget = (t: { start: number; range: number; ratio: number }, from: number, dx: number) => {
    const to = Math.min(t.start + t.range, Math.max(t.start, from + dx * t.ratio))
    return Math.abs(to - from) < 0.5 ? null : to
  }
  // successive wheel events add up from where the last one aimed, not from where the glide is now
  let wheelTo = 0
  let wheelAt = -1e9
  const current = (now: number) => (now - wheelAt < 250 ? wheelTo : window.scrollY)
  const go = (y: number, immediate: boolean) => {
    if (lenis) lenis.scrollTo(y, { immediate, force: true })
    else window.scrollTo({ top: y, behavior: 'instant' })
  }

  const onWheel = (e: WheelEvent) => {
    // Shift + wheel arrives as deltaX in most browsers, as deltaY in some
    const dx = e.deltaX || (e.shiftKey ? e.deltaY : 0)
    if (!dx || Math.abs(dx) <= Math.abs(e.shiftKey ? 0 : e.deltaY)) return
    const t = trackAt(e.clientY)
    if (!t) return
    const to = sidewaysTarget(t, current(e.timeStamp), dx * (e.deltaMode === 1 ? 40 : 1))
    if (to === null) return
    e.preventDefault()
    e.stopPropagation() // keep Lenis from also reading this wheel event
    wheelTo = to
    wheelAt = e.timeStamp
    go(to, false)
  }

  let touch: { x: number; y: number; t: number; axis: '' | 'x' | 'y'; v: number; track: ReturnType<typeof trackAt> } | null = null
  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return (touch = null)
    const p = e.touches[0]
    touch = { x: p.clientX, y: p.clientY, t: e.timeStamp, axis: '', v: 0, track: trackAt(p.clientY) }
  }
  const onTouchMove = (e: TouchEvent) => {
    if (!touch?.track || touch.axis === 'y') return
    const p = e.touches[0]
    const mx = p.clientX - touch.x
    if (!touch.axis) {
      const my = p.clientY - touch.y
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return
      touch.axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'
      if (touch.axis === 'y') return
    }
    e.preventDefault()
    const to = sidewaysTarget(touch.track, window.scrollY, -mx)
    const dt = Math.max(1, e.timeStamp - touch.t)
    touch.v = 0.8 * (-mx / dt) + 0.2 * touch.v
    touch.x = p.clientX
    touch.t = e.timeStamp
    if (to !== null) go(to, true)
  }
  const onTouchEnd = () => {
    // let a quick flick glide on, like a native swipe
    if (touch?.track && touch.axis === 'x' && Math.abs(touch.v) > 0.2) {
      const to = sidewaysTarget(touch.track, window.scrollY, touch.v * 260)
      if (to !== null) {
        if (lenis) lenis.scrollTo(to, { force: true, duration: 0.9 })
        else window.scrollTo({ top: to, behavior: 'smooth' })
      }
    }
    touch = null
  }
  window.addEventListener('wheel', onWheel, { passive: false, capture: true })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchend', onTouchEnd)
  window.addEventListener('touchcancel', onTouchEnd)

  const markDirty = () => (dirty = true)
  requestUpdate = markDirty
  const mo = new MutationObserver(() => (needScan = true))
  mo.observe(document.body, { childList: true, subtree: true })
  const ro = new ResizeObserver(markDirty)
  ro.observe(document.body)
  window.addEventListener('resize', markDirty)

  return () => {
    cancelAnimationFrame(raf)
    mo.disconnect()
    ro.disconnect()
    window.removeEventListener('resize', markDirty)
    window.removeEventListener('wheel', onWheel, { capture: true })
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
    window.removeEventListener('touchcancel', onTouchEnd)
    lenis?.destroy()
    lenis = null
  }
}
