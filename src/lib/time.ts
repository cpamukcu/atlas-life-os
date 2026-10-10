import { TIMEZONE } from '../config'

/** Wall-clock parts in Asia/Shanghai, independent of the device's timezone. */
export function shanghaiParts(d: Date = new Date()) {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]))
  return {
    dateKey: `${p.year}-${p.month}-${p.day}`,
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
  }
}

export function todayKey(d: Date = new Date()): string {
  return shanghaiParts(d).dateKey
}

/** Shift a YYYY-MM-DD key by whole days. */
export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return t.toISOString().slice(0, 10)
}

export function hourDecimal(d: Date = new Date()): number {
  const p = shanghaiParts(d)
  return p.hour + p.minute / 60 + p.second / 3600
}

export function partOfDay(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}
