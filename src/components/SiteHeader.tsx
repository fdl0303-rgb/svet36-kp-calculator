import { useEffect, useState } from 'react'
import { MapPin, Moon, Phone, Sun } from 'lucide-react'
import logoUrl from '../assets/logo.png'
import {
  CATEGORIES,
  NAV_LINKS,
  PHONE,
  PHONE_HREF,
  SITE,
  categoryHref,
} from '../lib/company'
import { THEME_KEY } from '../lib/storage'
import { twMerge } from './tw'

type Theme = 'light' | 'dark' | 'system'

function useTheme(): [Theme, (next: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(THEME_KEY) as Theme) || 'system'
    } catch {
      return 'system'
    }
  })

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  const set = (next: Theme) => {
    setTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* ignore */
    }
  }

  return [theme, set]
}

function ThemeToggle() {
  const [theme, setTheme] = useTheme()
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className="flex items-center rounded-xl border border-line bg-elevated p-0.5">
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={isDark ? 'Светлая тема' : 'Тёмная тема'}
        aria-label="Переключить тему"
        className="grid size-8 place-items-center rounded-[10px] text-muted transition-colors hover:text-fg"
      >
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>
      <a
        href={SITE}
        target="_blank"
        rel="noreferrer noopener"
        title="Открыть интернет-магазин svet-36.ru"
        className="num ml-0.5 hidden rounded-[10px] px-2.5 py-1.5 text-[11.5px] font-semibold text-muted transition-colors hover:text-accent sm:block"
      >
        svet-36.ru ↗
      </a>
    </div>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="hidden border-b border-line/70 py-2 md:block">
          <div className="flex items-center justify-between text-[12px] text-muted">
            <span className="flex items-center gap-2">
              <span className="inline-block size-1.5 rounded-full bg-pos" />
              Магазин дизайнерского освещения · Воронеж
            </span>
            <nav className="flex items-center gap-5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors hover:text-accent"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-4 py-3">
          <a href={SITE} target="_blank" rel="noreferrer noopener" className="shrink-0">
            <span
              className={twMerge(
                'flex items-center rounded-xl px-2 py-1.5 transition-colors',
                'bg-white dark:bg-white',
              )}
            >
              <img src={logoUrl} alt="Свет-36" className="h-8 w-auto sm:h-10" />
            </span>
          </a>

          <div className="hidden min-w-0 flex-1 lg:block">
            <div className="font-display text-[15px] leading-tight font-extrabold tracking-tight">
              Калькулятор коммерческого предложения
            </div>
            <div className="truncate text-[12.5px] text-muted">
              Люстры, светильники, трековые системы и дизайнерский свет
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <div className="hidden text-right sm:block">
              <a
                href={PHONE_HREF}
                className="num block text-[15px] font-bold tracking-tight transition-colors hover:text-accent"
              >
                {PHONE}
              </a>
              <span className="flex items-center justify-end gap-1 text-[11.5px] text-muted">
                <MapPin size={11} /> Воронеж, Донбасская 16з
              </span>
            </div>
            <a
              href={PHONE_HREF}
              className="grid size-10 place-items-center rounded-xl bg-fg text-bg transition-opacity hover:opacity-90 sm:hidden"
              aria-label="Позвонить"
            >
              <Phone size={16} />
            </a>
            <ThemeToggle />
          </div>
        </div>

        <nav className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto border-t border-line/70 py-1.5">
          {CATEGORIES.map((name) => (
            <a
              key={name}
              href={categoryHref(name)}
              target="_blank"
              rel="noreferrer noopener"
              className="shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-muted transition-colors hover:bg-elevated hover:text-fg"
            >
              {name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
