import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '../config'
import { timeLeft, urgency } from './deadlines'
import { buildGreeting } from './greeting'
import { addDays, todayKey } from './time'
import { emptyDay, isWonDay, platesLoaded, wonStreak, type DayLog } from './wonday'

const { plates, routine } = DEFAULT_SETTINGS

function wonDay(date: string): DayLog {
  const d = emptyDay(date)
  plates.forEach((p) => (d.plates[p.id] = { done: true }))
  routine.forEach((r) => (d.routine[r.id] = true))
  return d
}

describe('time', () => {
  it('uses Shanghai date, not device date', () => {
    // 2026-10-10 17:30 UTC is already 2026-10-11 01:30 in Shanghai
    expect(todayKey(new Date('2026-10-10T17:30:00Z'))).toBe('2026-10-11')
  })
  it('shifts days across month ends', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
})

describe('won day', () => {
  it('needs all plates, full routine and no slip', () => {
    const d = wonDay('2026-10-10')
    expect(isWonDay(d, plates, routine)).toBe(true)
    d.slip = true
    expect(isWonDay(d, plates, routine)).toBe(false)
  })
  it('fails when one routine item is missing', () => {
    const d = wonDay('2026-10-10')
    d.routine[routine[0].id] = false
    expect(isWonDay(d, plates, routine)).toBe(false)
  })
  it('never counts a skipped gym day as loaded', () => {
    const d = wonDay('2026-10-10')
    d.plates.gym = { done: true, gym: 'skipped', note: 'sick' }
    expect(platesLoaded(d, plates)).toBe(3)
    expect(isWonDay(d, plates, routine)).toBe(false)
  })
  it('counts a rest day as loaded', () => {
    const d = wonDay('2026-10-10')
    d.plates.gym = { done: true, gym: 'rest' }
    expect(isWonDay(d, plates, routine)).toBe(true)
  })
})

describe('streak', () => {
  const days: Record<string, DayLog> = {}
  for (let i = 1; i <= 5; i++) days[addDays('2026-10-10', -i)] = wonDay(addDays('2026-10-10', -i))

  it('stays alive when today is not won yet', () => {
    expect(wonStreak(days, '2026-10-10', plates, routine)).toBe(5)
  })
  it('includes today once won', () => {
    expect(wonStreak({ ...days, '2026-10-10': wonDay('2026-10-10') }, '2026-10-10', plates, routine)).toBe(6)
  })
  it('breaks on a gap', () => {
    const gap = { ...days }
    delete gap[addDays('2026-10-10', -3)]
    expect(wonStreak(gap, '2026-10-10', plates, routine)).toBe(2)
  })
})

describe('deadlines', () => {
  const now = new Date('2026-10-10T12:00:00Z')
  const at = (h: number) => new Date(now.getTime() + h * 3600_000)
  it('colors by time left', () => {
    expect(urgency(at(-1), now)).toBe('overdue')
    expect(urgency(at(18), now)).toBe('urgent')
    expect(urgency(at(50), now)).toBe('soon')
    expect(urgency(at(100), now)).toBe('later')
  })
  it('formats time left', () => {
    expect(timeLeft(at(18), now)).toBe('18h')
    expect(timeLeft(at(52), now)).toBe('2d 4h')
    expect(timeLeft(at(120), now)).toBe('5d')
  })
})

describe('greeting', () => {
  it('matches the ATLAS voice', () => {
    const g = buildGreeting({ name: 'Can', hour: 8, classesToday: 2, urgentDeadlineHours: 30, platesLeft: 3, platesTotal: 4 })
    expect(g.hello).toBe('Good morning, Can.')
    expect(g.body).toBe("Two classes today, one deadline in 30 hours, and three plates left to load. Let's secure the day.")
  })
  it('celebrates when all plates are loaded', () => {
    const g = buildGreeting({ name: 'Can', hour: 20, classesToday: 0, urgentDeadlineHours: null, platesLeft: 0, platesTotal: 4 })
    expect(g.body).toBe('All plates loaded. Well done.')
  })
})
