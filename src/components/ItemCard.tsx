import { useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Copy,
  ImagePlus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react'
import type { Item } from '../types'
import { UNITS } from '../lib/company'
import { compressImage, formatBytes } from '../lib/image'
import { itemSubtotal } from '../lib/calc'
import { money, num } from '../lib/format'
import { Field, IconButton } from './ui'
import { twMerge } from './tw'

interface Props {
  item: Item
  index: number
  total: number
  canMoveUp: boolean
  canMoveDown: boolean
  onChange: (patch: Partial<Item>) => void
  onRemove: () => void
  onDuplicate: () => void
  onMove: (direction: -1 | 1) => void
}

export function ItemCard({
  item,
  index,
  total,
  canMoveUp,
  canMoveDown,
  onChange,
  onRemove,
  onDuplicate,
  onMove,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const manual = item.totalOverride !== null

  const accept = async (file: File | undefined | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Нужен файл изображения (JPG, PNG, WEBP)')
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      setError('Файл больше 12 МБ — выберите изображение поменьше')
      return
    }
    try {
      onChange({ photo: await compressImage(file) })
      setError(null)
    } catch {
      setError('Не удалось обработать изображение')
    }
  }

  return (
    <article className="rise group rounded-2xl border border-line bg-elevated/60 p-4 transition-colors focus-within:border-line-strong sm:p-5">
      <div className="flex items-start gap-3">
        <span className="num mt-1 grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-surface text-[12px] font-bold text-muted">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_120px_92px_120px_132px]">
            <Field label="Наименование товара">
              <input
                className="field"
                value={item.name}
                placeholder="Люстра подвесная, арт. LX-2041"
                onChange={(e) => onChange({ name: e.target.value })}
              />
            </Field>

            <Field label="Артикул" hint="необяз.">
              <input
                className="field"
                value={item.sku}
                placeholder="LX-2041"
                onChange={(e) => onChange({ sku: e.target.value })}
              />
            </Field>

            <Field label="Ед.">
              <select
                className="field cursor-pointer"
                value={item.unit}
                onChange={(e) => onChange({ unit: e.target.value })}
              >
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Кол-во">
              <input
                className="field num text-right"
                value={Number.isFinite(item.qty) ? item.qty : ''}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                onChange={(e) => onChange({ qty: Number(e.target.value) || 0 })}
              />
            </Field>

            <Field label="Цена за 1 шт">
              <input
                className="field num text-right"
                value={Number.isFinite(item.price) ? item.price : ''}
                type="number"
                min={0}
                step={1}
                inputMode="decimal"
                onChange={(e) => onChange({ price: Number(e.target.value) || 0 })}
              />
            </Field>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <Field label="Примечание к позиции" hint="необязательно">
              <input
                className="field"
                value={item.note}
                placeholder="Цвет плафона — чёрный, длина подвеса 1,5 м"
                onChange={(e) => onChange({ note: e.target.value })}
              />
            </Field>

            <div className="flex items-end">
              <div className="w-full min-w-[168px] rounded-xl border border-line bg-surface px-4 py-2.5 lg:w-[200px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium tracking-wide text-muted uppercase">
                    Сумма
                  </span>
                  {manual ? (
                    <button
                      type="button"
                      onClick={() => onChange({ totalOverride: null })}
                      title="Вернуть автоматический расчёт"
                      className="flex items-center gap-1 text-[10.5px] font-medium text-accent hover:underline"
                    >
                      <RotateCcw size={10} /> авто
                    </button>
                  ) : null}
                </div>
                <div className="num mt-0.5 text-[19px] leading-tight font-bold tracking-tight">
                  {money(itemSubtotal(item))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-muted uppercase">
                Фото товара
              </span>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  void accept(e.dataTransfer.files?.[0])
                }}
                onPaste={(e) => {
                  const file = Array.from(e.clipboardData.files).find((f) =>
                    f.type.startsWith('image/'),
                  )
                  if (file) void accept(file)
                }}
                className={twMerge(
                  'flex min-h-[92px] items-center gap-3 rounded-xl border border-dashed p-3 transition-colors',
                  dragging
                    ? 'border-accent bg-accent-soft'
                    : item.photo
                      ? 'border-line bg-surface'
                      : 'border-line-strong bg-surface/60',
                )}
              >
                {item.photo ? (
                  <>
                    <img
                      src={item.photo}
                      alt="Фото товара"
                      className="size-[68px] shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="num text-[11.5px] text-muted">
                        {formatBytes(Math.round((item.photo.length * 3) / 4))}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => inputRef.current?.click()}
                          className="rounded-lg border border-line px-2.5 py-1 text-[12px] font-medium transition-colors hover:bg-elevated"
                        >
                          Заменить
                        </button>
                        <button
                          type="button"
                          onClick={() => onChange({ photo: null })}
                          className="rounded-lg px-2.5 py-1 text-[12px] font-medium text-accent transition-colors hover:bg-accent-soft"
                        >
                          Убрать
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <span className="grid size-[46px] shrink-0 place-items-center rounded-lg border border-line bg-elevated text-muted">
                      <ImagePlus size={18} />
                    </span>
                    <span className="text-[12.5px] leading-snug text-muted">
                      Перетащите фото сюда, вставьте из буфера
                      <br />
                      <span className="text-muted/70">или нажмите, чтобы выбрать файл</span>
                    </span>
                  </button>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    void accept(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </div>
              {error ? <p className="mt-1.5 text-[11.5px] text-accent">{error}</p> : null}
            </div>

            <div className="flex flex-wrap items-end gap-2 sm:justify-end">
              <div className="mr-auto flex items-center gap-2 sm:mr-0">
                <IconButton label="Переместить выше" onClick={() => onMove(-1)} disabled={!canMoveUp}>
                  <ArrowUp size={15} />
                </IconButton>
                <IconButton
                  label="Переместить ниже"
                  onClick={() => onMove(1)}
                  disabled={!canMoveDown}
                >
                  <ArrowDown size={15} />
                </IconButton>
                <IconButton label="Дублировать позицию" onClick={onDuplicate}>
                  <Copy size={15} />
                </IconButton>
                <IconButton
                  label="Удалить позицию"
                  onClick={onRemove}
                  className="hover:bg-accent-soft hover:text-accent"
                >
                  <Trash2 size={15} />
                </IconButton>
              </div>
              <button
                type="button"
                onClick={() => onChange({ totalOverride: total })}
                title="Задать сумму вручную"
                className="text-[11.5px] text-muted transition-colors hover:text-fg sm:hidden"
              >
                Сумма вручную: {money(total)}
              </button>
            </div>
          </div>

          {manual ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-accent/30 bg-accent-soft px-3 py-2">
              <X size={12} className="text-accent" />
              <span className="text-[12px] text-muted">Сумма задана вручную:</span>
              <span className="num text-[12.5px] font-bold">{money(item.totalOverride ?? 0)}</span>
              <span className="text-[12px] text-muted line-through">{money(total)}</span>
              <button
                type="button"
                onClick={() => onChange({ totalOverride: null })}
                className="ml-auto text-[11.5px] font-semibold text-accent hover:underline"
              >
                Вернуть авторасчёт
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onChange({ totalOverride: total })}
              className="hidden w-fit text-[11.5px] text-muted transition-colors hover:text-fg sm:block"
            >
              Задать сумму вручную ({num(total)})
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
