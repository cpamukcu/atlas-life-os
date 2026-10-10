import type { PlateDef, RoutineItem } from '../config'
import { addDays } from './time'

export type GymState = 'trained' | 'rest' | 'skipped'

export interface PlateLog {
  done: boolean
  minutes?: number
  note?: string
  gym?: GymState
}

export interface DayLog {
  date: string
  plates: Record<string, PlateLog>
  routine: Record<string, boolean>
  slip: boolean
  mood?: number
}

export function emptyDay(date: string): DayLog {
  return { date, plates: {}, routine: {}, slip: false }
}

/** A plate counts as loaded when marked done; a skipped gym day never does. */
export function plateLoaded(log: PlateLog | undefined): boolean {
  if (!log) return false
  if (log.gym === 'skipped') return false
  return log.done
}

export function platesLoaded(day: DayLog, plates: PlateDef[]): number {
  return plates.filter((p) => plateLoaded(day.plates[p.id])).length
}

export function routineDone(day: DayLog, routine: RoutineItem[]): number {
  return routine.filter((r) => day.routine[r.id]).length
}

/** WON DAY = every plate loaded + full morning routine + no bad-habit slip. */
export function isWonDay(day: DayLog, plates: PlateDef[], routine: RoutineItem[]): boolean {
  return (
    plates.length > 0 &&
    platesLoaded(day, plates) === plates.length &&
    routineDone(day, routine) === routine.length &&
    !day.slip
  )
}

/**
 * Consecutive won days ending today. If today isn't won yet the streak is
 * still alive, so counting starts from yesterday.
 */
export function wonStreak(
  days: Record<string, DayLog>,
  today: string,
  plates: PlateDef[],
  routine: RoutineItem[],
): number {
  const won = (k: string) => {
    const d = days[k]
    return d ? isWonDay(d, plates, routine) : false
  }
  let key = won(today) ? today : addDays(today, -1)
  let n = 0
  while (won(key)) {
    n++
    key = addDays(key, -1)
  }
  return n
}
