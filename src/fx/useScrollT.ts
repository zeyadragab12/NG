import { useEffect, useRef, type RefObject } from 'react'
import { onScroll } from './engine'
import { clamp01 } from './steps'

/**
 * Calls `fn(t)` while `ref` passes through the screen. t is 0 when the element's top
 * reaches `start` × viewport height and 1 after `span` × its own height has scrolled past.
 */
export function useScrollT<T extends HTMLElement>(
  ref: RefObject<T | null>,
  fn: (t: number, rect: DOMRect, vh: number) => void,
  start = 0.85,
  span = 0.75,
) {
  const cb = useRef(fn)
  cb.current = fn
  useEffect(
    () =>
      onScroll(({ vh }) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        if (r.bottom < -vh || r.top > vh * 2) return
        cb.current(clamp01((vh * start - r.top) / Math.max(1, r.height * span)), r, vh)
      }),
    [ref, start, span],
  )
}
