import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Link2, Share2, X } from 'lucide-react'
import type { Company, Proposal } from '../types'
import { SHARE_TARGETS, buildShareUrl } from '../lib/share'
import { money } from '../lib/format'
import { Button, Pill } from './ui'
import { twMerge } from './tw'

interface Props {
  open: boolean
  proposal: Proposal
  company: Company
  total: number
  onClose: () => void
}

export function ShareDialog({ open, proposal, company, total, onClose }: Props) {
  const url = useMemo(() => (open ? buildShareUrl(proposal) : ''), [open, proposal])
  const [copied, setCopied] = useState(false)
  const [photoNote, setPhotoNote] = useState(true)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  if (!open) return null

  const text = `Коммерческое предложение № ${proposal.number} от ${company.name} на сумму ${money(total)}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const area = document.createElement('textarea')
      area.value = url
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    setCopied(true)
    setPhotoNote(false)
  }

  const nativeShare = async () => {
    try {
      await navigator.share({ title: text, text, url })
      setPhotoNote(false)
    } catch {
      /* user cancelled */
    }
  }

  const photoCount = proposal.items.filter((item) => item.photo).length

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="rise max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-surface shadow-2xl sm:rounded-2xl">
        <header className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="grid size-8 place-items-center rounded-lg bg-accent-soft text-accent">
            <Share2 size={16} />
          </span>
          <div>
            <h3 className="font-display text-[15px] font-bold">Отправить предложение ссылкой</h3>
            <p className="text-[12px] text-muted">
              Клиент откроет ссылку и увидит готовое коммерческое предложение
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-fg"
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-[12px] font-medium tracking-wide text-muted uppercase">
              <Link2 size={13} /> Ссылка на предложение
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                className="field num min-w-0 flex-1 text-[11.5px]"
              />
              <Button variant={copied ? 'accent' : 'primary'} onClick={() => void copy()}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Скопировано' : 'Копировать'}
              </Button>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
              <Pill tone={url.length > 7000 ? 'accent' : 'neutral'}>
                {url.length} символов
              </Pill>
              <span>Вся расчётная часть сохраняется в самой ссылке.</span>
            </div>
          </div>

          {photoCount > 0 && photoNote ? (
            <p className="rounded-xl border border-accent/30 bg-accent-soft px-3.5 py-2.5 text-[12px] leading-relaxed">
              В ссылку <strong>не попадают фотографии</strong> ({photoCount}{' '}
              {photoCount === 1 ? 'фото' : 'фото'}), чтобы она оставалась короткой. Для КП с фото
              отправьте PDF или Excel — они содержат все изображения.
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            {SHARE_TARGETS.map((target) => (
              <a
                key={target.id}
                href={target.href(url, text)}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => setPhotoNote(false)}
                className={twMerge(
                  'flex items-center gap-3 rounded-xl border border-line bg-elevated px-3.5 py-3 transition-all',
                  'hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_8px_24px_-16px_rgba(0,0,0,0.6)]',
                )}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: target.color }}
                />
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-semibold">{target.label}</span>
                  <span className="block truncate text-[11.5px] text-muted">{target.hint}</span>
                </span>
              </a>
            ))}
          </div>

          {typeof navigator !== 'undefined' && 'share' in navigator ? (
            <Button variant="outline" className="w-full" onClick={() => void nativeShare()}>
              <Share2 size={15} /> Отправить системным меню устройства
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
