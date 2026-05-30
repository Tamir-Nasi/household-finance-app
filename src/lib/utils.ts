/** Format a number as Israeli Shekel */
export function formatILS(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format a date string as Hebrew short date */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(dateStr))
}

/** Combine class names (simple utility — no clsx dep needed) */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Get days remaining in the current month */
export function daysRemainingInMonth(): number {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return lastDay - now.getDate()
}

/** Total days in a given month */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/** Current month label in Hebrew (e.g. "מאי 2025") */
export function currentMonthLabel(): string {
  return new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(new Date())
}

export function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  )
}

/** Today's date as ISO string (YYYY-MM-DD) */
export function today(): string {
  return new Date().toISOString().slice(0, 10)
}
