import logoUrl from '../assets/logo.png'
import { NAV_LINKS, PHONE, PHONE_HREF, SITE } from '../lib/company'

export function SiteFooter({ company }: { company: { email: string; address: string; hours: string } }) {
  return (
    <footer className="mt-16 border-t border-line bg-surface/60">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <span className="inline-flex items-center rounded-xl bg-white px-2 py-1.5">
            <img src={logoUrl} alt="Свет-36" className="h-8 w-auto" />
          </span>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted">
            {company.address}. Магазин дизайнерского освещения: люстры, светильники, трековые
            системы, уличное освещение и светодиодная лента.
          </p>
        </div>

        <div>
          <div className="text-[11px] font-semibold tracking-wider text-muted uppercase">
            Контакты
          </div>
          <ul className="mt-3 space-y-2 text-[13.5px]">
            <li>
              <a href={PHONE_HREF} className="num font-semibold transition-colors hover:text-accent">
                {PHONE}
              </a>
            </li>
            <li>
              <a href={`mailto:${company.email}`} className="transition-colors hover:text-accent">
                {company.email}
              </a>
            </li>
            <li className="text-muted">{company.hours}</li>
            <li>
              <a
                href={SITE}
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted transition-colors hover:text-accent"
              >
                svet-36.ru ↗
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-[11px] font-semibold tracking-wider text-muted uppercase">
            Разделы магазина
          </div>
          <ul className="mt-3 grid gap-2 text-[13.5px] sm:grid-cols-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-muted transition-colors hover:text-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-4 text-[12px] text-muted sm:px-6">
          <span>© {new Date().getFullYear()} Свет-36. Калькулятор коммерческих предложений.</span>
          <span>
            Цены указаны с учётом НДС и действительны в течение 3 дней с даты формирования.
          </span>
        </div>
      </div>
    </footer>
  )
}
