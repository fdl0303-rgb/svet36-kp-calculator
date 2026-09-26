import type { Item, Proposal } from '../types'

export function itemSubtotal(item: Item): number {
  if (item.totalOverride !== null) return round2(item.totalOverride)
  return round2((Number(item.qty) || 0) * (Number(item.price) || 0))
}

export function isOverridden(item: Item): boolean {
  return item.totalOverride !== null
}

export function sumQty(items: Item[]): number {
  return round2(items.reduce((acc, item) => acc + (Number(item.qty) || 0), 0))
}

export function itemsTotal(items: Item[]): number {
  return round2(items.reduce((acc, item) => acc + itemSubtotal(item), 0))
}

export function discountAmount(itemsTotalValue: number, discount: number): number {
  const d = Math.min(100, Math.max(0, Number(discount) || 0))
  return round2((itemsTotalValue * d) / 100)
}

export function grandTotal(p: Proposal): number {
  return round2(itemsTotal(p.items) - discountAmount(itemsTotal(p.items), p.options.discount))
}

export function round2(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100
}

export function filledItems(items: Item[]): Item[] {
  return items.filter((item) => item.name.trim() !== '')
}

export function createItem(overrides: Partial<Item> = {}): Item {
  return {
    id: cryptoId(),
    name: '',
    sku: '',
    unit: 'шт',
    qty: 1,
    price: 0,
    totalOverride: null,
    note: '',
    photo: null,
    ...overrides,
  }
}

export function cryptoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
