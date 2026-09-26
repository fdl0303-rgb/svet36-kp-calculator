type ClassValue = string | false | null | undefined

export function twMerge(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}

export function cx(...values: ClassValue[]): string {
  return twMerge(...values)
}
