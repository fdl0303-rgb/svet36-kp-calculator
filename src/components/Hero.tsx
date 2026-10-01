import { CalendarDays, FilePlus2, Hash, Sparkles, Zap } from 'lucide-react'
import type { Proposal } from '../types'
import { Button, Field } from './ui'

interface Props {
  proposal: Proposal
  onNumber: (value: string) => void
  onDate: (value: string) => void
  onNew: () => void
}

const FEATURES = [
  { icon: Zap, text: 'PDF и Excel с фото товаров' },
  { icon: Sparkles, text: 'Готовая ссылка для клиента' },
  { icon: CalendarDays, text: 'Срок действия 3 дня' },
]

export function Hero({ proposal, onNumber, onDate, onNew }: Props) {
  return (
    <section className="border-b border-line bg-surface/40">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:py-14">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-elevated px-3 py-1.5 text-[12px] font-medium text-muted">
            <span className="size-1.5 rounded-full bg-accent" />
            Свет-36 · Воронеж · designer lighting
          </span>

          <h1 className="font-display mt-5 text-[30px] leading-[1.08] font-extrabold tracking-tight sm:text-[42px]">
            Калькулятор
            <br />
            коммерческого предложения
          </h1>

          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted">
            Укажите светильники, количество и цены — на выходе получите готовое КП с реквизитами
            Свет-36, логотипом, фотографиями и итоговой суммой. Экспорт в PDF и Excel или отправка
            клиенту одной ссылкой.
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2.5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-[13px] text-muted">
                <Icon size={14} className="text-accent" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="surface self-start p-5">
          <div className="text-[11px] font-semibold tracking-wider text-muted uppercase">
            Параметры документа
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Номер предложения" hint="в шапке КП">
              <div className="relative">
                <Hash
                  size={13}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                />
                <input
                  className="field num pl-8"
                  value={proposal.number}
                  onChange={(e) => onNumber(e.target.value)}
                />
              </div>
            </Field>
            <Field label="Дата" hint="отсчёт 3 дней">
              <div className="relative">
                <CalendarDays
                  size={14}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                />
                <input
                  type="date"
                  className="field num pl-8"
                  value={proposal.date}
                  onChange={(e) => onDate(e.target.value || proposal.date)}
                />
              </div>
            </Field>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <Button variant="outline" size="sm" onClick={onNew}>
              <FilePlus2 size={14} /> Новое предложение
            </Button>
            <span className="text-[11.5px] text-muted">
              Черновик сохраняется автоматически, «Сохранить» — в историю
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
