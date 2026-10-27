import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { lockScroll } from '../fx/engine'
import { useRegister } from './RegisterDialog'
import { SmartLink } from './ui'

const LINKS = [
  { label: 'Masterplan', to: '/#masterplan' },
  { label: 'Neighbourhoods', to: '/#neighbourhoods' },
  { label: 'NGU', to: '/university' },
  { label: 'Health Park', to: '/health-park' },
  { label: 'Club', to: '/club' },
  { label: 'Artlife', to: '/#artlife' },
  { label: 'App', to: '/#app' },
]

export function Nav() {
  const { pathname } = useLocation()
  const openRegister = useRegister()
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    lockScroll(open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <div
        data-scrollbar
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left scale-x-0 bg-accent"
      />

      <header
        data-nav
        data-open={open}
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-6 border-b border-transparent px-[clamp(20px,4vw,64px)] py-4 text-paper transition-[background-color,color,border-color,translate] duration-500 ease-[var(--ease-soft)] data-[hidden=true]:-translate-y-full data-[solid=true]:border-[color-mix(in_oklab,var(--fg)_12%,transparent)] data-[solid=true]:bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] data-[solid=true]:text-[var(--fg)] data-[solid=true]:backdrop-blur-[14px] md:py-5 data-[open=true]:translate-y-0! data-[open=true]:border-transparent! data-[open=true]:bg-transparent! data-[open=true]:text-paper! data-[open=true]:backdrop-blur-none!"
      >
        <Link to="/" className="relative z-10 text-[22px] font-extrabold tracking-[.04em]" aria-label="NewGiza home">
          NEWGIZA
        </Link>

        <nav aria-label="Main" className="hidden min-[1120px]:block">
          <ul className="flex gap-[clamp(14px,2vw,30px)] text-[13px] font-semibold uppercase tracking-[.06em]">
            {LINKS.map((l) => {
              const active = l.to === pathname
              return (
                <li key={l.label}>
                  <SmartLink
                    to={l.to}
                    aria-current={active ? 'page' : undefined}
                    className={`relative py-2 transition-colors hover:text-accent ${active ? 'text-accent' : ''}`}
                  >
                    {l.label}
                  </SmartLink>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="relative z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={openRegister}
            className="hidden min-h-11 cursor-pointer rounded-full border-[1.5px] border-current px-5 text-[12px] font-bold uppercase tracking-[.12em] transition-colors hover:border-accent hover:bg-accent hover:text-ink sm:block"
          >
            Register interest
          </button>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
            className="flex size-11 cursor-pointer flex-col items-center justify-center gap-[7px] rounded-full border-[1.5px] border-current min-[1120px]:hidden"
          >
            <span className={`h-[1.5px] w-4 bg-current transition-transform duration-500 ${open ? 'translate-y-[4.25px] rotate-45' : ''}`} />
            <span className={`h-[1.5px] w-4 bg-current transition-transform duration-500 ${open ? '-translate-y-[4.25px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-ink px-[clamp(20px,4vw,64px)] pt-28 pb-10 text-paper transition-[clip-path] duration-700 ease-[var(--ease-panel)] min-[1120px]:hidden ${
          open ? '[clip-path:inset(0_0_0_0)]' : '[clip-path:inset(0_0_100%_0)]'
        }`}
      >
        <nav aria-label="Mobile">
          <ul className="grid gap-1">
            {LINKS.map((l, i) => (
              <li key={l.label} className="overflow-hidden">
                <SmartLink
                  to={l.to}
                  onClick={() => setOpen(false)}
                  aria-current={l.to === pathname ? 'page' : undefined}
                  className={`block py-1 text-[clamp(34px,9vw,64px)] font-extrabold leading-[1.05] tracking-[-.035em] transition-colors hover:text-accent ${
                    l.to === pathname ? 'text-accent' : ''
                  }`}
                >
                  <span
                    className={`inline-block transition-transform duration-700 ease-[var(--ease-rise)] ${open ? 'translate-y-0' : 'translate-y-[110%]'}`}
                    style={{ transitionDelay: open ? `${180 + i * 50}ms` : '0ms' }}
                  >
                    {l.label.toLowerCase()}.
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>
        <div
          className={`flex flex-wrap items-center justify-between gap-4 transition-opacity duration-700 ${open ? 'opacity-100 delay-500' : 'opacity-0'}`}
        >
          <span className="text-[12px] font-semibold uppercase tracking-[.2em] text-paper/60">
            West Cairo · 1,544 acres
          </span>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              openRegister()
            }}
            className="min-h-12 cursor-pointer rounded-full bg-accent px-7 text-[13px] font-extrabold uppercase tracking-[.14em] text-ink"
          >
            Register interest
          </button>
        </div>
      </div>
    </>
  )
}
