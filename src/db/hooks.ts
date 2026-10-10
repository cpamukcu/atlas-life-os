import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, type Settings } from '../config'
import { todayKey } from '../lib/time'
import { emptyDay, type DayLog, type PlateLog } from '../lib/wonday'
import { db, getSettings } from './db'

export function useSettings(): Settings {
  return useLiveQuery(getSettings, [], DEFAULT_SETTINGS)
}

/** Re-renders every `ms` so clocks, countdowns and the date roll over. */
export function useNow(ms = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

export function useToday(): DayLog {
  const key = todayKey(useNow(30_000))
  return useLiveQuery(async () => (await db.days.get(key)) ?? emptyDay(key), [key], emptyDay(key))
}

export function useAllDays(): Record<string, DayLog> {
  return useLiveQuery(
    async () => Object.fromEntries((await db.days.toArray()).map((d) => [d.date, d])),
    [],
    {},
  )
}

export function useTasks() {
  return useLiveQuery(() => db.tasks.toArray(), [], [])
}

export function useExpenses() {
  return useLiveQuery(() => db.expenses.toArray(), [], [])
}

async function updateDay(date: string, fn: (d: DayLog) => void) {
  await db.transaction('rw', db.days, async () => {
    const d = (await db.days.get(date)) ?? emptyDay(date)
    fn(d)
    await db.days.put(d)
  })
}

export const setPlate = (date: string, id: string, log: PlateLog) =>
  updateDay(date, (d) => {
    d.plates[id] = log
  })

export const toggleRoutine = (date: string, id: string) =>
  updateDay(date, (d) => {
    d.routine[id] = !d.routine[id]
  })

export const setSlip = (date: string, slip: boolean) =>
  updateDay(date, (d) => {
    d.slip = slip
  })

export const setMood = (date: string, mood: number) =>
  updateDay(date, (d) => {
    d.mood = mood
  })
