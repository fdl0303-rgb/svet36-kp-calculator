import { COUNTER_KEY, loadJSON, saveJSON } from './storage'

/** Формат номера: С36-2609-014 */
export function buildProposalNumber(dateISO: string): string {
  const [year, month] = dateISO.split('-')
  const stamp = `${year.slice(2)}${month}`
  const counters = loadJSON<Record<string, number>>(COUNTER_KEY, {})
  const next = (counters[stamp] ?? 0) + 1
  counters[stamp] = next
  saveJSON(COUNTER_KEY, counters)
  return `С36-${stamp}-${String(next).padStart(3, '0')}`
}
