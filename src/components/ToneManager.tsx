import { useEffect } from 'react'
import { onScroll } from '../fx/engine'

/** Sets html[data-tone] from the [data-tone] section crossing the middle of the screen. */
export function ToneManager() {
  useEffect(() => {
    let current = ''
    const stop = onScroll(({ vh }) => {
      let tone = 'paper'
      // only sections: <html> carries data-tone too (it is where the result is stored)
      document.querySelectorAll<HTMLElement>('body [data-tone]').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top <= vh * 0.5 && r.bottom > vh * 0.5) tone = el.dataset.tone || 'paper'
      })
      if (tone !== current) {
        current = tone
        document.documentElement.dataset.tone = tone
      }
    })
    return () => {
      stop()
      delete document.documentElement.dataset.tone
    }
  }, [])
  return null
}
