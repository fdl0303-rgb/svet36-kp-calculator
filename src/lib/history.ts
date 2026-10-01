import type { Proposal } from '../types'
import { discountAmount, grandTotal, itemsTotal, sumQty } from './calc'

const DB_NAME = 'svet36:kp-history'
const DB_VERSION = 1
const META = 'meta'
const DOCS = 'docs'

/** Короткая запись истории — без фотографий, поэтому помещается в память целиком. */
export interface HistoryEntry {
  id: string
  name: string
  number: string
  date: string
  client: string
  count: number
  qty: number
  sum: number
  discount: number
  grand: number
  fingerprint: string
  savedAt: number
  updatedAt: number
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Браузер не поддерживает локальное хранилище'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(DOCS)) db.createObjectStore(DOCS)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(readableError(request.error, 'Не удалось открыть локальную базу'))
    request.onblocked = () => reject(new Error('База занята другой вкладкой — закройте её и повторите'))
  }).catch((error: unknown) => {
    dbPromise = null
    throw error
  })
  return dbPromise
}

function readableError(error: DOMException | null, fallback: string): Error {
  if (error?.name === 'QuotaExceededError') {
    return new Error('В браузере закончилось место. Удалите часть предложений из истории и повторите.')
  }
  if (error?.message) return new Error(error.message)
  return new Error(fallback)
}

/** Все сохранённые предложения, свежие сверху. */
export async function listHistory(): Promise<HistoryEntry[]> {
  const db = await openDb()
  return new Promise<HistoryEntry[]>((resolve, reject) => {
    const transaction = db.transaction(META, 'readonly')
    const request = transaction.objectStore(META).getAll()
    request.onsuccess = () => {
      const rows = (request.result as HistoryEntry[]).sort((a, b) => b.updatedAt - a.updatedAt)
      resolve(rows)
    }
    request.onerror = () => reject(readableError(request.error, 'Не удалось прочитать историю'))
  })
}

/** Полный документ с фотографиями — грузится только при открытии предложения. */
export async function readDocument(id: string): Promise<Proposal | null> {
  const db = await openDb()
  return new Promise<Proposal | null>((resolve, reject) => {
    const transaction = db.transaction(DOCS, 'readonly')
    const request = transaction.objectStore(DOCS).get(id)
    request.onsuccess = () => resolve((request.result as Proposal | undefined) ?? null)
    request.onerror = () => reject(readableError(request.error, 'Не удалось открыть предложение'))
  })
}

/** Добавляет предложение в историю или обновляет уже сохранённое. */
export async function writeHistoryEntry(entry: HistoryEntry, proposal: Proposal): Promise<void> {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([META, DOCS], 'readwrite')
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(readableError(transaction.error, 'Не удалось сохранить предложение'))
    transaction.onerror = () => reject(readableError(transaction.error, 'Не удалось сохранить предложение'))
    transaction.objectStore(META).put(entry)
    transaction.objectStore(DOCS).put(proposal, entry.id)
  })
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([META, DOCS], 'readwrite')
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(readableError(transaction.error, 'Не удалось удалить предложение'))
    transaction.onerror = () => reject(readableError(transaction.error, 'Не удалось удалить предложение'))
    transaction.objectStore(META).delete(id)
    transaction.objectStore(DOCS).delete(id)
  })
}

/** Название по умолчанию: клиент и номер предложения. */
export function defaultHistoryName(proposal: Proposal): string {
  const who = proposal.client.company || proposal.client.name
  return who ? `${who} — ${proposal.number}` : `КП ${proposal.number}`
}

/** Сумма и дата проставляются автоматически из текущего документа. */
export function buildHistoryEntry(
  proposal: Proposal,
  id: string,
  name: string,
  savedAt: number,
): HistoryEntry {
  const sum = itemsTotal(proposal.items)
  return {
    id,
    name: name.trim() || defaultHistoryName(proposal),
    number: proposal.number,
    date: proposal.date,
    client: proposal.client.company || proposal.client.name,
    count: proposal.items.length,
    qty: sumQty(proposal.items),
    sum,
    discount: discountAmount(sum, proposal.options.discount),
    grand: grandTotal(proposal),
    fingerprint: proposalFingerprint(proposal),
    savedAt,
    updatedAt: Date.now(),
  }
}

/** Отпечаток документа для отслеживания несохранённых правок (фото — по длине). */
export function proposalFingerprint(proposal: Proposal): string {
  return JSON.stringify({
    number: proposal.number,
    date: proposal.date,
    client: proposal.client,
    options: proposal.options,
    items: proposal.items.map((item) => [
      item.name,
      item.sku,
      item.unit,
      item.qty,
      item.price,
      item.totalOverride,
      item.note,
      item.photo ? item.photo.length : 0,
    ]),
  })
}