const COUNTER_KEY = 'svet36:kp-counter'
const DRAFT_KEY = 'svet36:kp-draft'
const COMPANY_KEY = 'svet36:company'
const THEME_KEY = 'svet36:theme'

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...(JSON.parse(raw) as object) } as T
  } catch {
    return fallback
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota or private mode — ignore */
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export { COUNTER_KEY, COMPANY_KEY, DRAFT_KEY, THEME_KEY }
