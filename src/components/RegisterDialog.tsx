import { createContext, useCallback, useContext, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { lockScroll } from '../fx/engine'
import { submitLead, validateLead, type Interest, type Lead, type LeadErrors } from '../lib/lead'

const RegisterContext = createContext<() => void>(() => {})
export const useRegister = () => useContext(RegisterContext)

const INTERESTS: Interest[] = ['Residential', 'Artlife & offices', 'NGU', 'Health Park', 'Clubs']
const EMPTY: Lead = { name: '', phone: '', email: '', interest: 'Residential', message: '' }

export function RegisterProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [lead, setLead] = useState<Lead>(EMPTY)
  const [errors, setErrors] = useState<LeadErrors>({})
  const [touched, setTouched] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const open = useCallback(() => {
    if (state === 'sent') {
      setLead(EMPTY)
      setState('idle')
      setTouched(false)
      setErrors({})
    }
    ref.current?.showModal()
    lockScroll(true)
  }, [state])

  const close = () => ref.current?.close()

  const set = <K extends keyof Lead>(key: K, value: Lead[K]) => {
    const next = { ...lead, [key]: value }
    setLead(next)
    if (touched) setErrors(validateLead(next))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    const found = validateLead(lead)
    setErrors(found)
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0]
      ref.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setState('sending')
    try {
      await submitLead(lead)
      setState('sent')
    } catch {
      setState('error')
    }
  }

  return (
    <RegisterContext.Provider value={open}>
      {children}
      <dialog
        ref={ref}
        onClose={() => lockScroll(false)}
        onClick={(e) => e.target === ref.current && close()}
        aria-labelledby="register-title"
        className="m-auto max-h-[calc(100svh-32px)] w-[min(640px,calc(100vw-32px))] overflow-hidden rounded-[28px] bg-paper p-0 text-ink shadow-[0_60px_120px_-30px_rgba(0,0,0,.6)]"
      >
        <div data-lenis-prevent className="max-h-[calc(100svh-32px)] overflow-y-auto overscroll-contain p-[clamp(24px,5vw,48px)]">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="eyebrow mb-3">Register interest</div>
              <h2 id="register-title" className="text-[clamp(32px,5vw,48px)] font-extrabold leading-[.95] tracking-[-.04em]">
                {state === 'sent' ? 'thank you.' : 'come and see newgiza.'}
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border-[1.5px] border-ink/20 transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>

          {state === 'sent' ? (
            <div className="mt-8">
              <p className="max-w-[44ch] text-[17px] leading-[1.6] text-muted">
                Thanks, {lead.name.split(' ')[0]}. The NewGiza sales team will call you on {lead.phone} to arrange your visit.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-8 min-h-12 cursor-pointer rounded-full bg-ink px-8 text-[13px] font-extrabold uppercase tracking-[.14em] text-paper transition-colors hover:bg-accent hover:text-ink"
              >
                Done
              </button>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} className="mt-8 grid gap-5">
              <Field label="Full name" name="name" error={errors.name} autoComplete="name" value={lead.name} onChange={(v) => set('name', v)} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Phone" name="phone" type="tel" inputMode="tel" error={errors.phone} autoComplete="tel" value={lead.phone} onChange={(v) => set('phone', v)} />
                <Field label="Email" name="email" type="email" error={errors.email} autoComplete="email" value={lead.email} onChange={(v) => set('email', v)} />
              </div>

              <fieldset>
                <legend className="mb-3 text-[12px] font-bold uppercase tracking-[.16em] text-muted">Interested in</legend>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((it) => (
                    <label key={it} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="interest"
                        value={it}
                        checked={lead.interest === it}
                        onChange={() => set('interest', it)}
                        className="peer absolute inset-0 cursor-pointer opacity-0"
                      />
                      <span className="flex min-h-11 items-center rounded-full border-[1.5px] border-ink/20 px-4 text-[14px] font-semibold transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:border-ink">
                        {it}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field label="Message (optional)" name="message" multiline error={errors.message} value={lead.message} onChange={(v) => set('message', v)} />

              {state === 'error' && (
                <p role="alert" className="rounded-xl bg-accent/10 px-4 py-3 text-[14px] font-medium text-[#B23A26]">
                  We could not send your details. Please try again in a moment.
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <p className="max-w-[34ch] text-[12px] leading-[1.5] text-muted">
                  We only use these details to contact you about NewGiza.
                </p>
                <button
                  type="submit"
                  disabled={state === 'sending'}
                  className="min-h-12 cursor-pointer rounded-full bg-accent px-8 text-[13px] font-extrabold uppercase tracking-[.14em] text-ink transition-[background-color,opacity] hover:bg-ink hover:text-paper disabled:cursor-wait disabled:opacity-60"
                >
                  {state === 'sending' ? 'Sending…' : 'Send'}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </RegisterContext.Provider>
  )
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  multiline,
  type = 'text',
  ...rest
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  error?: string
  multiline?: boolean
  type?: string
  autoComplete?: string
  inputMode?: 'tel' | 'email' | 'text'
}) {
  const id = useId()
  const cls = `w-full rounded-2xl border-[1.5px] bg-white/70 px-4 text-[16px] font-medium text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink focus:bg-white ${
    error ? 'border-[#C9402B]' : 'border-ink/15 hover:border-ink/40'
  }`
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[12px] font-bold uppercase tracking-[.16em] text-muted">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} name={name} rows={3} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} className={`${cls} resize-none py-3`} />
      ) : (
        <input id={id} name={name} type={type} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} className={`${cls} h-12`} {...rest} />
      )}
      {error && (
        <p id={`${id}-e`} className="mt-2 text-[13px] font-medium text-[#B23A26]">
          {error}
        </p>
      )}
    </div>
  )
}
