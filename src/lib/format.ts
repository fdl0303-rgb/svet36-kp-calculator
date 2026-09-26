export const RUB = '₽'

const nf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const nf0 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function money(value: number): string {
  const v = Number.isFinite(value) ? value : 0
  return `${nf.format(v)} ${RUB}`
}

export function moneyExact(value: number): string {
  const v = Number.isFinite(value) ? value : 0
  return `${nf2.format(v)} ${RUB}`
}

export function num(value: number): string {
  return nf.format(Number.isFinite(value) ? value : 0)
}

export function numExact(value: number): string {
  return Number.isInteger(value) ? nf0.format(value) : nf2.format(value)
}

export function plural(count: number, forms: [string, string, string]): string {
  const n = Math.abs(count) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return forms[2]
  if (n1 > 1 && n1 < 5) return forms[1]
  if (n1 === 1) return forms[0]
  return forms[2]
}

export function itemsWord(count: number): string {
  return plural(count, ['позиция', 'позиции', 'позиций'])
}

export function unitsWord(count: number, unit: string): string {
  return `${num(count)} ${unit} ${plural(count, ['', '', ''])}`.trim()
}

const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function todayISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDate(iso: string): string {
  const d = parseISODate(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDateShort(iso: string): string {
  const d = parseISODate(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

export function daysWord(count: number): string {
  return plural(count, ['день', 'дня', 'дней'])
}
