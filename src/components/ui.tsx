import type { ReactNode } from 'react'
import { twMerge } from './tw'

export function Card({
  title,
  step,
  icon,
  action,
  children,
  className,
}: {
  title: string
  step?: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={twMerge('surface overflow-hidden', className)}>
      <header className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
        {step ? (
          <span className="num grid size-7 shrink-0 place-items-center rounded-lg bg-fg text-[11px] font-bold text-bg">
            {step}
          </span>
        ) : null}
        {icon ? <span className="text-accent">{icon}</span> : null}
        <h2 className="font-display text-[15px] font-bold tracking-tight">{title}</h2>
        {action ? <div className="ml-auto flex items-center gap-2">{action}</div> : null}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
  hint,
  className,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <label
      className={twMerge(
        'flex cursor-pointer select-none items-start gap-2.5 rounded-xl border border-line bg-elevated px-3 py-2.5 transition-colors hover:border-line-strong',
        checked && 'border-accent/40 bg-accent-soft',
        className,
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        aria-hidden="true"
        className={twMerge(
          'mt-px grid size-[18px] shrink-0 place-items-center rounded-md border transition-colors',
          checked ? 'border-accent bg-accent text-white' : 'border-line-strong bg-surface',
        )}
      >
        {checked ? (
          <svg
            viewBox="0 0 16 16"
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path d="M3.5 8.5l3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] leading-tight font-medium">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-[11.5px] leading-snug text-muted">{hint}</span>
        ) : null}
      </span>
    </label>
  )
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={twMerge('block', className)}>
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="text-[12px] font-medium tracking-wide text-muted uppercase">{label}</span>
        {hint ? <span className="text-[11px] text-muted/70">{hint}</span> : null}
      </span>
      {children}
    </label>
  )
}

type ButtonProps = {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'accent' | 'ghost' | 'outline' | 'danger' | 'subtle'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  title?: string
  href?: string
}

const VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-fg text-bg hover:opacity-90 active:opacity-80 disabled:opacity-40 shadow-[0_1px_2px_rgba(0,0,0,0.12)]',
  accent: 'bg-accent text-white hover:bg-accent-hover active:opacity-90 disabled:opacity-40',
  outline: 'border border-line-strong text-fg hover:bg-elevated active:opacity-80 disabled:opacity-40',
  ghost: 'text-muted hover:text-fg hover:bg-elevated active:opacity-80 disabled:opacity-40',
  subtle: 'bg-elevated text-fg hover:bg-line/60 active:opacity-80 disabled:opacity-40',
  danger: 'text-accent hover:bg-accent-soft active:opacity-80 disabled:opacity-40',
}

const SIZES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-[12.5px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-[13.5px] gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[15px] gap-2 rounded-xl',
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'outline',
  size = 'md',
  className,
  disabled,
  title,
  href,
}: ButtonProps) {
  const classes = twMerge(
    'inline-flex select-none items-center justify-center font-medium whitespace-nowrap transition-[background-color,color,opacity,transform] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100',
    VARIANTS[variant],
    SIZES[size],
    className,
  )

  if (href) {
    return (
      <a className={classes} href={href} target="_blank" rel="noreferrer noopener" title={title}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} onClick={onClick} type={type} disabled={disabled} title={title}>
      {children}
    </button>
  )
}

export function IconButton({
  children,
  onClick,
  label,
  className,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  label: string
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        'grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-fg disabled:pointer-events-none disabled:opacity-30',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-elevated px-4 py-3">
      <div className="text-[11px] font-medium tracking-wide text-muted uppercase">{label}</div>
      <div className="num mt-1 text-[17px] font-bold">{value}</div>
      {hint ? <div className="mt-0.5 text-[11px] text-muted">{hint}</div> : null}
    </div>
  )
}

export function Pill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'accent' | 'pos'
}) {
  const tones = {
    neutral: 'border-line text-muted bg-elevated',
    accent: 'border-transparent bg-accent-soft text-accent',
    pos: 'border-transparent bg-pos/12 text-pos',
  }
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-medium',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}
