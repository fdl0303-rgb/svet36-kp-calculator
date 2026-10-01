import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CalendarDays, Hash, Loader2, Save, TriangleAlert, X } from 'lucide-react'
import type { Proposal } from '../types'
import { formatDate, itemsWord, money } from '../lib/format'
import type { HistoryEntry } from '../lib/history'
import { Button } from './ui'

interface Props {
  proposal: Proposal
  totals: { count: number; qty: number; sum: number; discount: number; grand: number }
  current: HistoryEntry | null
  initialName: string
  onSave: (name: string) => Promise<void>
  onClose: () => void
}

export function SaveDialog({ proposal, totals, current, initialName, onSave, onClose }: Props) {
  const [name, setName] = useState(initialName)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const submit = async () => {
    const title = name.trim()
    if (!title) {
      setError('Введите название предложения')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onSave(title)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить предложение')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="rise max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-surface shadow-2xl sm:rounded-2xl">
        <header className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="grid size-8 place-items-center rounded-lg bg-accent-soft text-accent">
            <Save size={16} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-[15px] font-bold">
              {current ? 'Обновить предложение в истории' : 'Сохранить предложение в историю'}
            </h3>
            <p className="text-[12px] text-muted">
              {current
                ? 'Правки заменят сохранённую версию — дата и сумма пересчитаются'
                : 'Сумма и дата проставятся автоматически, название — ваше'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="ml-auto grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-fg"
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 flex items-baseline gap-2">
              <span className="text-[12px] font-medium tracking-wide text-muted uppercase">
                Название предложения
              </span>
              <span className="text-[11px] text-muted/70">обязательно</span>
            </span>
            <input
              autoFocus
              className="field"
              value={name}
              maxLength={120}
              placeholder="ООО Ромашка — освещение квартиры"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void submit()
              }}
            />
          </label>

          <div className="rounded-xl border border-line bg-elevated p-4">
            <div className="text-[11px] font-semibold tracking-wider text-muted uppercase">
              Проставится автоматически
            </div>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <Row
                icon={<CalendarDays size={13} />}
                label="Дата предложения"
                value={formatDate(proposal.date)}
              />
              <Row
                icon={<Hash size={13} />}
                label="Номер"
                value={proposal.number}
                mono
              />
              <div className="rounded-lg border border-accent/30 bg-accent-soft px-3 py-2 sm:col-span-2">
                <dt className="text-[11px] font-medium tracking-wide text-accent uppercase">
                  Сумма заказа
                </dt>
                <dd className="num mt-0.5 text-[19px] font-bold">{money(totals.grand)}</dd>
                <dd className="num mt-0.5 text-[11px] text-muted">
                  {money(totals.sum)}
                  {totals.discount ? ` − ${money(totals.discount)} (скидка ${proposal.options.discount}%)` : ''}
                </dd>
              </div>
              <div className="text-[11.5px] text-muted sm:col-span-2">
                {totals.count} {itemsWord(totals.count)}, всего {totals.qty} шт.
              </div>
            </dl>
          </div>

          {current ? (
            <p className="text-[11.5px] text-muted">
              Сохранено {new Date(current.savedAt).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
              . Можно переименовать здесь же — новое название сохранится.
            </p>
          ) : null}

          {error ? (
            <p className="flex items-start gap-2 rounded-xl border border-accent/30 bg-accent-soft px-3.5 py-2.5 text-[12.5px] text-accent">
              <TriangleAlert size={14} className="mt-0.5 shrink-0" />
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={onClose} disabled={busy}>
              Отмена
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => void submit()} disabled={busy}>
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {current ? 'Обновить' : 'Сохранить'}
            </Button>
          </div>

          <p className="text-[11px] leading-relaxed text-muted">
            История хранится в этом браузере вместе с фотографиями. Она не попадает в ссылку для
            клиента и не видна другим устройствам.
          </p>
        </div>
      </div>
    </div>
  )
}

function Row({
  icon,
  label,
  value,
  mono,
}: {
  icon: ReactNode
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted uppercase">
        <span className="text-accent">{icon}</span>
        {label}
      </dt>
      <dd className={mono ? 'num mt-0.5 text-[14px] font-semibold' : 'mt-0.5 text-[14px] font-semibold'}>
        {value}
      </dd>
    </div>
  )
}