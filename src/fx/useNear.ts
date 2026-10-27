import { useEffect, useState, type RefObject } from 'react'

/**
 * True once `ref` comes within `margin` of the viewport (and stays true).
 * Used to start loading images in sideways tracks a bit before they are needed:
 * native lazy-loading can wait until they slide in horizontally and flash grey.
 */
export function useNear<T extends Element>(ref: RefObject<T | null>, margin = '150% 0px') {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setNear(true), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin, near])
  return near
}
