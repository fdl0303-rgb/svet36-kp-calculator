import { useState } from 'react'
import { ChevronDown, FileSignature, Percent, RotateCcw } from 'lucide-react'
import type { Company, Options } from '../types'
import { daysWord } from '../lib/format'
import { Button, Card, Field } from './ui'
import { twMerge } from './tw'

interface Props {
  options: Options
  company: Company
  onChange: (patch: Partial<Options>) => void
  onCompanyChange: (patch: Partial<Company>) => void
  onCompanyReset: () => void
}

export function OptionsForm({
  options,
  company,
  onChange,
  onCompanyChange,
  onCompanyReset,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Card
      title="Условия и реквизиты"
      step="3"
      icon={<FileSignature size={16} />}
      action={
        <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? 'Свернуть' : 'Настроить'}
          <ChevronDown size={14} className={twMerge('transition-transform', open && 'rotate-180')} />
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Срок действия" hint="дней">
          <input
            className="field num text-right"
            type="number"
            min={1}
            max={90}
            value={options.validDays}
            onChange={(e) => onChange({ validDays: Math.max(1, Number(e.target.value) || 1) })}
          />
        </Field>
        <Field label="Скидка" hint="%">
          <input
            className="field num text-right"
            type="number"
            min={0}
            max={100}
            value={options.discount}
            onChange={(e) => onChange({ discount: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
          />
        </Field>
        <Field label="Менеджер">
          <input
            className="field"
            value={options.manager}
            placeholder="Анна, отдел оптовых продаж"
            onChange={(e) => onChange({ manager: e.target.value })}
          />
        </Field>
      </div>

      {open ? (
        <div className="mt-5 space-y-5 border-t border-line pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Условия оплаты">
              <textarea
                className="field min-h-[72px] resize-y"
                value={options.payment}
                onChange={(e) => onChange({ payment: e.target.value })}
              />
            </Field>
            <Field label="Доставка">
              <textarea
                className="field min-h-[72px] resize-y"
                value={options.delivery}
                onChange={(e) => onChange({ delivery: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Комментарий к предложению" hint="попадёт в PDF и Excel">
            <textarea
              className="field min-h-[72px] resize-y"
              value={options.comment}
              placeholder="Подберём светильники под ваш дизайн-проект и приедем на замер бесплатно."
              onChange={(e) => onChange({ comment: e.target.value })}
            />
          </Field>

          <div className="rounded-2xl border border-line bg-elevated/60 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Percent size={14} className="text-accent" />
              <span className="text-[13px] font-semibold">Реквизиты компании для шапки КП</span>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={onCompanyReset}>
                <RotateCcw size={13} /> Сбросить
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Название">
                <input
                  className="field"
                  value={company.name}
                  onChange={(e) => onCompanyChange({ name: e.target.value })}
                />
              </Field>
              <Field label="Статус / профиль">
                <input
                  className="field"
                  value={company.tagline}
                  onChange={(e) => onCompanyChange({ tagline: e.target.value })}
                />
              </Field>
              <Field label="Адрес" className="sm:col-span-2">
                <input
                  className="field"
                  value={company.address}
                  onChange={(e) => onCompanyChange({ address: e.target.value })}
                />
              </Field>
              <Field label="Дополнительный адрес" className="sm:col-span-2">
                <input
                  className="field"
                  value={company.extraAddress}
                  onChange={(e) => onCompanyChange({ extraAddress: e.target.value })}
                />
              </Field>
              <Field label="Телефон">
                <input
                  className="field num"
                  value={company.phone}
                  onChange={(e) => onCompanyChange({ phone: e.target.value })}
                />
              </Field>
              <Field label="E-mail">
                <input
                  className="field"
                  value={company.email}
                  onChange={(e) => onCompanyChange({ email: e.target.value })}
                />
              </Field>
              <Field label="ИНН">
                <input
                  className="field num"
                  value={company.inn}
                  placeholder="не указан"
                  onChange={(e) => onCompanyChange({ inn: e.target.value })}
                />
              </Field>
              <Field label="КПП">
                <input
                  className="field num"
                  value={company.kpp}
                  placeholder="не указан"
                  onChange={(e) => onCompanyChange({ kpp: e.target.value })}
                />
              </Field>
              <Field label="ОГРН / ОГРНИП">
                <input
                  className="field num"
                  value={company.ogrn}
                  placeholder="не указан"
                  onChange={(e) => onCompanyChange({ ogrn: e.target.value })}
                />
              </Field>
              <Field label="Руководитель">
                <input
                  className="field"
                  value={company.director}
                  placeholder="ИП Иванов И. И."
                  onChange={(e) => onCompanyChange({ director: e.target.value })}
                />
              </Field>
              <Field label="Р/с" className="sm:col-span-2">
                <input
                  className="field num"
                  value={company.account}
                  placeholder="не указан"
                  onChange={(e) => onCompanyChange({ account: e.target.value })}
                />
              </Field>
              <Field label="Банк" className="sm:col-span-2">
                <input
                  className="field"
                  value={company.bank}
                  placeholder="не указан"
                  onChange={(e) => onCompanyChange({ bank: e.target.value })}
                />
              </Field>
            </div>
            <p className="mt-3 text-[11.5px] text-muted">
              Реквизиты сохраняются в браузере и подставляются в шапку PDF и Excel. Предложение
              действует {options.validDays} {daysWord(options.validDays)}.
            </p>
          </div>
        </div>
      ) : null}
    </Card>
  )
}
