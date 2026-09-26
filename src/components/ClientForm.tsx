import { Building2, UserRound } from 'lucide-react'
import type { Client } from '../types'
import { PHONE_HREF } from '../lib/company'
import { Card, Field } from './ui'

interface Props {
  client: Client
  onChange: (patch: Partial<Client>) => void
}

export function ClientForm({ client, onChange }: Props) {
  return (
    <Card title="Кому отправляем предложение" step="1" icon={<UserRound size={16} />}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Имя">
          <input
            className="field"
            value={client.name}
            placeholder="Иван Петров"
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </Field>
        <Field label="Компания / ИП">
          <input
            className="field"
            value={client.company}
            placeholder='ООО «Дизайн Студия»'
            onChange={(e) => onChange({ company: e.target.value })}
          />
        </Field>
        <Field label="Телефон">
          <input
            className="field num"
            value={client.phone}
            placeholder="+7 900 000-00-00"
            inputMode="tel"
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </Field>
        <Field label="E-mail">
          <input
            className="field"
            value={client.email}
            placeholder="client@example.ru"
            inputMode="email"
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </Field>
        <Field label="Адрес" className="sm:col-span-2">
          <input
            className="field"
            value={client.address}
            placeholder="г. Воронеж, ул. Ленина, 1"
            onChange={(e) => onChange({ address: e.target.value })}
          />
        </Field>
        <Field label="Объект" hint="необязательно" className="sm:col-span-2">
          <input
            className="field"
            value={client.object}
            placeholder="Квартира / дом / коммерческое помещение"
            onChange={(e) => onChange({ object: e.target.value })}
          />
        </Field>
      </div>

      {client.phone ? (
        <p className="mt-4 flex items-center gap-2 text-[12.5px] text-muted">
          <Building2 size={13} />
          Быстрый контакт клиента:
          <a href={telHref(client.phone)} className="num font-semibold text-accent hover:underline">
            {client.phone}
          </a>
        </p>
      ) : (
        <p className="mt-4 text-[12px] text-muted">
          Телефон менеджера магазина:{' '}
          <a href={PHONE_HREF} className="num font-semibold text-accent hover:underline">
            8 920 22-58-222
          </a>
        </p>
      )}
    </Card>
  )
}

function telHref(value: string): string {
  const digits = value.replace(/\D/g, '')
  return `tel:${digits.startsWith('8') ? `+7${digits.slice(1)}` : `+${digits}`}`
}
