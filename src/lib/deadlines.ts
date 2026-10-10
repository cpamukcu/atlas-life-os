export type Urgency = 'overdue' | 'urgent' | 'soon' | 'later'

const H = 3600_000

/** Red under 24h, amber under 72h. */
export function urgency(due: Date, now: Date): Urgency {
  const left = due.getTime() - now.getTime()
  if (left < 0) return 'overdue'
  if (left < 24 * H) return 'urgent'
  if (left < 72 * H) return 'soon'
  return 'later'
}

export function timeLeft(due: Date, now: Date): string {
  const ms = due.getTime() - now.getTime()
  if (ms < 0) return 'late'
  const h = Math.floor(ms / H)
  if (h < 1) return `${Math.max(1, Math.floor(ms / 60_000))}m`
  if (h < 48) return `${h}h`
  const d = Math.floor(h / 24)
  const rh = h % 24
  return rh && d < 4 ? `${d}d ${rh}h` : `${d}d`
}
