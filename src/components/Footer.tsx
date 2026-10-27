import { Link } from 'react-router-dom'
import { scrollToTarget } from '../fx/engine'
import { useRegister } from './RegisterDialog'
import { SmartLink, Words } from './ui'

const pill =
  'flex min-h-14 cursor-pointer items-center rounded-full px-8 text-[13px] uppercase tracking-[.14em] transition-colors duration-300'

export function Footer({ title, cta = 'Book a visit', home = true }: { title: string; cta?: string; home?: boolean }) {
  const openRegister = useRegister()
  return (
    <footer id="contact" data-tone="ink" className="bg-ink px-gutter pt-[clamp(80px,14vh,160px)] pb-12 text-paper">
      <h2 className="max-w-[14ch] text-[clamp(48px,8vw,140px)] font-extrabold leading-[.92] tracking-[-.045em]">
        <Words text={title} />
      </h2>
      <div data-reveal="rise" data-delay="150" className="mt-12 flex flex-wrap gap-4">
        <button type="button" onClick={openRegister} className={`${pill} bg-accent font-extrabold text-ink hover:bg-paper`}>
          {cta}
        </button>
        {home ? (
          <button
            type="button"
            onClick={() => scrollToTarget(0)}
            className={`${pill} border-[1.5px] border-paper/40 font-bold hover:border-paper hover:bg-paper hover:text-ink`}
          >
            Back to top ↑
          </button>
        ) : (
          <Link to="/" className={`${pill} border-[1.5px] border-paper/40 font-bold hover:border-paper hover:bg-paper hover:text-ink`}>
            Back to NewGiza
          </Link>
        )}
      </div>

      <div className="mt-[clamp(80px,14vh,160px)] grid gap-10 border-t border-paper/15 pt-10 text-[14px] text-paper/60 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="text-[20px] font-extrabold tracking-[.04em] text-paper">NEWGIZA</div>
          <p className="mt-4 max-w-[34ch] leading-[1.6]">
            A 1,544-acre community on the Cairo–Alex Desert Road, minutes from the Pyramids.
          </p>
        </div>
        <FooterCol
          title="Community"
          links={[
            ['Masterplan', '/#masterplan'],
            ['Neighbourhoods', '/#neighbourhoods'],
            ['Artlife', '/#artlife'],
            ['Resident app', '/#app'],
          ]}
        />
        <FooterCol
          title="Destinations"
          links={[
            ['NewGiza University', '/university'],
            ['Health Park', '/health-park'],
            ['Sports Clubs', '/club'],
          ]}
        />
        <div>
          <div className="mb-4 text-[12px] font-bold uppercase tracking-[.2em] text-paper">Visit</div>
          <p className="leading-[1.7]">
            West Cairo
            <br />
            Cairo–Alex Desert Road, Giza
          </p>
          <button type="button" onClick={openRegister} className="mt-3 cursor-pointer text-paper underline decoration-accent decoration-2 underline-offset-[6px] hover:text-accent">
            Register interest
          </button>
        </div>
      </div>

      <div className="mt-14 flex flex-wrap justify-between gap-4 text-[12px] text-paper/45">
        <span>© {new Date().getFullYear()} NewGiza. All rights reserved.</span>
        <span>Figures from the NewGiza presentation. Subject to change.</span>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="mb-4 text-[12px] font-bold uppercase tracking-[.2em] text-paper">{title}</div>
      <ul className="grid gap-2">
        {links.map(([label, to]) => (
          <li key={label}>
            <SmartLink to={to} className="inline-block py-1 transition-colors hover:text-accent">
              {label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
