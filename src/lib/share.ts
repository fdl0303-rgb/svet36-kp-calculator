import type { Item, Proposal } from '../types'

type ShareItem = [string, string, string, number, number, number | null, string]

interface SharePayload {
  v: 1
  n: string
  d: string
  c: [string, string, string, string, string, string]
  o: [number, string, string, string, string, number]
  i: ShareItem[]
}

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeProposal(p: Proposal): string {
  const payload: SharePayload = {
    v: 1,
    n: p.number,
    d: p.date,
    c: [
      p.client.name,
      p.client.company,
      p.client.phone,
      p.client.email,
      p.client.address,
      p.client.object,
    ],
    o: [
      p.options.validDays,
      p.options.payment,
      p.options.delivery,
      p.options.comment,
      p.options.manager,
      p.options.discount,
    ],
    i: p.items.map<ShareItem>((item) => [
      item.name,
      item.sku,
      item.unit,
      round2(item.qty),
      round2(item.price),
      item.totalOverride === null ? null : round2(item.totalOverride),
      item.note,
    ]),
  }
  return toBase64Url(JSON.stringify(payload))
}

export function decodeProposal(data: string): Proposal | null {
  try {
    const parsed = JSON.parse(fromBase64Url(data)) as SharePayload
    if (parsed.v !== 1 || !Array.isArray(parsed.i)) return null
    return {
      number: parsed.n,
      date: parsed.d,
      client: {
        name: parsed.c?.[0] ?? '',
        company: parsed.c?.[1] ?? '',
        phone: parsed.c?.[2] ?? '',
        email: parsed.c?.[3] ?? '',
        address: parsed.c?.[4] ?? '',
        object: parsed.c?.[5] ?? '',
      },
      options: {
        validDays: parsed.o?.[0] ?? 3,
        payment: parsed.o?.[1] ?? '',
        delivery: parsed.o?.[2] ?? '',
        comment: parsed.o?.[3] ?? '',
        manager: parsed.o?.[4] ?? '',
        discount: parsed.o?.[5] ?? 0,
      },
      items: parsed.i.map<Partial<Item>>((row) => ({
        name: row[0] ?? '',
        sku: row[1] ?? '',
        unit: row[2] || 'шт',
        qty: num(row[3]),
        price: num(row[4]),
        totalOverride: row[5] === null || row[5] === undefined ? null : num(row[5]),
        note: row[6] ?? '',
        photo: null,
      })) as Item[],
    }
  } catch {
    return null
  }
}

export function readHashProposal(): Proposal | null {
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return null
  const params = new URLSearchParams(hash)
  const data = params.get('p') ?? (hash.startsWith('p=') ? hash.slice(2) : '')
  return data ? decodeProposal(data) : null
}

export function buildShareUrl(p: Proposal): string {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#p=${encodeProposal(p)}`
}

export function linkSizeTone(length: number): 'ok' | 'warn' {
  return length > 7000 ? 'warn' : 'ok'
}

export interface ShareTarget {
  id: string
  label: string
  hint: string
  href: (url: string, text: string) => string
  color: string
}

export const SHARE_TARGETS: ShareTarget[] = [
  {
    id: 'telegram',
    label: 'Telegram',
    hint: 'Отправить в чат',
    color: '#2AABEE',
    href: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    hint: 'Отправить в чат',
    color: '#25D366',
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
  },
  {
    id: 'email',
    label: 'E-mail',
    hint: 'Письмом клиенту',
    color: '#EA4335',
    href: (url, text) =>
      `mailto:?subject=${encodeURIComponent('Коммерческое предложение — Свет-36')}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
  },
  {
    id: 'viber',
    label: 'Viber',
    hint: 'Отправить в чат',
    color: '#7360F2',
    href: (url, text) => `https://viber.me/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
]

function round2(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100
}

function num(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
