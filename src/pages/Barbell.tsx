import { useState } from 'react'
import { Switch } from '../components/Switch'
import type { PlateDef } from '../config'
import { setPlate, setSlip, toggleRoutine, useAllDays, useSettings, useToday } from '../db/hooks'
import { addDays, todayKey } from '../lib/time'
import { isWonDay, plateLoaded, wonStreak, type GymState, type PlateLog } from '../lib/wonday'

const NOTE_HINT: Record<string, string> = { code: 'What did you ship?', content: 'What did you post?', zh: 'What did you study?' }

function PlateCard({ plate, log, date }: { plate: PlateDef; log: PlateLog | undefined; date: string }) {
  const [excuse, setExcuse] = useState(log?.gym === 'skipped' ? (log.note ?? '') : '')
  const [askExcuse, setAskExcuse] = useState(false)
  const loaded = plateLoaded(log)
  const save = (patch: Partial<PlateLog>) => setPlate(date, plate.id, { done: false, ...log, ...patch })

  return (
    <section className="panel" style={{ borderColor: loaded ? plate.color : undefined }}>
      <div className="panel-h">
        <span className="micro" style={{ color: plate.color }}>
          {plate.name.toUpperCase()}
        </span>
        <span className="micro" style={{ color: loaded ? 'var(--green)' : 'var(--muted)' }}>
          {loaded ? 'LOADED' : log?.gym === 'skipped' ? 'SKIPPED' : 'EMPTY'}
        </span>
      </div>

      {plate.kind === 'gym' ? (
        <>
          <div className="chips" style={{ margin: 0 }}>
            {(['trained', 'rest'] as GymState[]).map((g) => (
              <button key={g} className={`chip ${log?.gym === g ? 'on' : ''}`} onClick={() => (setAskExcuse(false), save({ gym: g, done: true, note: undefined }))}>
                {g === 'trained' ? 'Trained' : 'Rest day'}
              </button>
            ))}
            <button className={`chip ${log?.gym === 'skipped' || askExcuse ? 'on' : ''}`} onClick={() => setAskExcuse(true)}>
              Skipped
            </button>
          </div>
          {askExcuse && (
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              <input className="field" placeholder="Why? Be honest, no judgment." value={excuse} onChange={(e) => setExcuse(e.target.value)} />
              <button
                className="btn"
                onClick={() => {
                  if (!excuse.trim()) return
                  save({ gym: 'skipped', done: false, note: excuse.trim() })
                  setAskExcuse(false)
                }}
              >
                {excuse.trim() ? 'Save skip' : 'Write the reason to save'}
              </button>
            </div>
          )}
          {log?.gym === 'skipped' && !askExcuse && <div className="empty">Reason: {log.note}</div>}
        </>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          <div className="row">
            <input
              className="field mono"
              style={{ maxWidth: 110 }}
              inputMode="numeric"
              placeholder="min"
              defaultValue={log?.minutes ?? ''}
              onBlur={(e) => {
                const m = Number(e.target.value) || 0
                save({ minutes: m, done: m > 0 || !!log?.done })
              }}
              aria-label={`${plate.name} minutes`}
            />
            <span className="micro">MINUTES</span>
            <span className="sp" />
            <button className={`btn ${loaded ? 'gold' : ''}`} onClick={() => save({ done: !loaded })}>
              {loaded ? 'Loaded' : 'Load plate'}
            </button>
          </div>
          <input className="field" placeholder={NOTE_HINT[plate.id] ?? 'Note'} defaultValue={log?.note ?? ''} onBlur={(e) => save({ note: e.target.value.trim() || undefined })} />
        </div>
      )}
    </section>
  )
}

export function Barbell() {
  const s = useSettings()
  const today = useToday()
  const days = useAllDays()
  const key = todayKey()
  const all = { ...days, [key]: today }
  const won = isWonDay(today, s.plates, s.routine)
  const streak = wonStreak(all, key, s.plates, s.routine)
  const week = Array.from({ length: 14 }, (_, i) => addDays(key, i - 13))

  return (
    <>
      <h1 className="h1">BARBELL</h1>
      <section className="panel">
        <div className="panel-h">
          <span className="micro">STATUS</span>
          <span className="micro" style={{ color: won ? 'var(--green)' : 'var(--gold)' }}>
            {won ? 'DAY SECURED' : 'IN PROGRESS'}
          </span>
        </div>
        <div className="row" style={{ gap: 4 }}>
          {week.map((d) => {
            const w = all[d] && isWonDay(all[d], s.plates, s.routine)
            return <span key={d} title={d} style={{ flex: 1, height: 22, background: w ? 'var(--green)' : 'rgba(224,40,58,.12)', border: `1px solid ${d === key ? 'var(--gold)' : 'rgba(224,40,58,.3)'}`, boxShadow: w ? '0 0 8px var(--green)' : undefined }} />
          })}
        </div>
        <div className="micro" style={{ marginTop: 8 }}>
          LAST 14 DAYS // WON STREAK {streak}
        </div>
      </section>

      {s.plates.map((p) => (
        <PlateCard key={p.id + key} plate={p} log={today.plates[p.id]} date={key} />
      ))}

      <section className="panel">
        <div className="panel-h">
          <span className="micro">MORNING ROUTINE</span>
        </div>
        {s.routine.map((r) => (
          <label key={r.id} className="toggle">
            <span>{r.label}</span>
            <Switch on={!!today.routine[r.id]} onChange={() => toggleRoutine(key, r.id)} label={r.label} />
          </label>
        ))}
      </section>

      <section className="panel">
        <div className="panel-h">
          <span className="micro">BAD HABITS</span>
        </div>
        <label className="toggle">
          <span>I slipped today</span>
          <Switch on={today.slip} onChange={(v) => setSlip(key, v)} label="I slipped today" />
        </label>
        <div className="empty">{today.slip ? "Noted. One slip doesn't erase your progress. Tomorrow is a fresh start." : 'Quit counters and the relapse calendar arrive with your CP data import.'}</div>
      </section>
    </>
  )
}
