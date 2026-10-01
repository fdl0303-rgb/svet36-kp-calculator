import { useMemo, useState } from 'react'
import { Archive, Check, FolderOpen, Loader2, Pencil, Search, Trash, TriangleAlert } from 'lucide-react'
import { formatDateShort, formatStamp, itemsWord, money, num } from '../lib/format'
import type { HistoryEntry } from '../lib/history'
import { Card, IconButton } from './ui'
import { twMerge } from './tw'

interface Props {
  entries: HistoryEntry[]
  loading: boolean
  error: string | null
  currentId: string | null
  dirty: boolean
  onOpen: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function HistoryPanel({ entries, loading, error, currentId, dirty, onOpen, onDelete }: Props) {
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<HistoryEntry | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rowError, setRowError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((entry) =>
      [entry.name, entry.client, entry.number, entry.date]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q)),
    )
  }, [entries, query])

  const open = async (entry: HistoryEntry) => {
    setBusyId(entry.id)
    setRowError(null)
    try {
      await onOpen(entry.id)
      setPending(null)
    } catch (e) {
      setRowError(e instanceof Error ? e.message : 'Не удалось открыть предложение')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (entry: HistoryEntry) => {
    setBusyId(entry.id)
    setRowError(null)
    try {
      await onDelete(entry.id)
      setPending(null)
    } catch (e) {
      setRowError(e instanceof Error ? e.message : 'Не удалось удалить предложение')
    } finally {
      setBusyId(null)
    }
  }

  const askOpen = (entry: HistoryEntry) => {
    if (dirty && entry.id !== currentId) {
      setPending(entry)
      return
    }
    void open(entry)
  }

  return (
    <Card
      title="История предложений"
      icon={<Archive size={16} />}
      action={
        <span className="num rounded-md bg-elevated px-2 py-0.5 text-[11px] text-muted">
          {entries.length ? `${entries.length} ${itemsWord(entries.length)}` : 'пусто'}
        </span>
      }
    >
      {entries.length > 3 ? (
        <div className="relative mb-3">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          />
          <input
            className="field pl-9"
            value={query}
            placeholder="Поиск по названию, клиенту или номеру"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      ) : null}

      {pending ? (
        <div className="mb-3 rounded-xl border border-accent/35 bg-accent-soft px-3.5 py-3">
          <p className="flex items-start gap-2 text-[12.5px] leading-relaxed">
            <Pencil size={14} className="mt-0.5 shrink-0 text-accent" />
            <span>
              В открытом предложении есть несохранённые правки. Открыть{' '}
              <strong className="font-semibold">«{pending.name}»</strong> — изменения пропадут.
            </span>
          </p>
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              className="text-[12.5px] font-medium text-accent underline underline-offset-2"
              onClick={() => setPending(null)}
            >
              Остаться здесь
            </button>
            <button
              type="button"
              className="rounded-lg bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white"
              onClick={() => void open(pending)}
            >
              Всё равно открыть
            </button>
          </div>
        </div>
      ) : null}

      {error || rowError ? (
        <p className="mb-3 flex items-start gap-2 rounded-xl border border-accent/30 bg-accent-soft px-3.5 py-2.5 text-[12.5px] text-accent">
          <TriangleAlert size={14} className="mt-0.5 shrink-0" />
          {rowError || error}
        </p>
      ) : null}

      {loading ? (
        <p className="flex items-center gap-2 py-4 text-[12.5px] text-muted">
          <Loader2 size={14} className="animate-spin" /> Загружаем историю…
        </p>
      ) : filtered.length ? (
        <ul className="thin-scroll max-h-[420px] space-y-1.5 overflow-y-auto pr-0.5">
          {filtered.map((entry) => {
            const active = entry.id === currentId
            const changed = entry.updatedAt !== entry.savedAt
            return (
              <li
                key={entry.id}
                className={twMerge(
                  'group flex items-stretch gap-1 rounded-xl border transition-colors',
                  active
                    ? 'border-accent/40 bg-accent-soft'
                    : 'border-line bg-elevated hover:border-line-strong',
                )}
              >
                <button
                  type="button"
                  onClick={() => askOpen(entry)}
                  disabled={busyId === entry.id}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left disabled:opacity-60"
                >
                  <span
                    className={twMerge(
                      'grid size-8 shrink-0 place-items-center rounded-lg',
                      active ? 'bg-accent text-white' : 'bg-surface text-muted',
                    )}
                  >
                    {busyId === entry.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : active ? (
                      <Check size={15} />
                    ) : (
                      <FolderOpen size={15} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-semibold">{entry.name}</span>
                      {active ? (
                        <span className="rounded-full bg-accent px-1.5 py-px text-[10px] font-medium text-white">
                          открыто
                        </span>
                      ) : null}
                    </span>
                    <span className="num mt-0.5 block truncate text-[11.5px] text-muted">
                      № {entry.number} · {formatDateShort(entry.date)} ·{' '}
                      {num(entry.count)} {itemsWord(entry.count)} · {formatStamp(entry.updatedAt)}
                      {changed ? ' · изменено' : ''}
                    </span>
                  </span>
                  <span className="num shrink-0 text-[13px] font-bold">{money(entry.grand)}</span>
                </button>
                <div className="flex items-center pr-1.5">
                  <IconButton
                    label={`Удалить «${entry.name}»`}
                    onClick={() => void remove(entry)}
                    disabled={busyId === entry.id}
                    className="hover:text-accent"
                  >
                    <Trash size={14} />
                  </IconButton>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[12.5px] leading-relaxed text-muted">
          {entries.length
            ? 'Ничего не найдено — измените запрос поиска.'
            : 'Здесь появятся все сохранённые предложения. Нажмите «Сохранить» — предложение попадёт в историю вместе с суммой и датой, его можно будет открыть и дополнить.'}
        </p>
      )}

      <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
        История хранится в этом браузере вместе с фотографиями: с другого устройства её не видно, и
        при очистке данных браузера она пропадёт.
      </p>
    </Card>
  )
}