import { Core, type TimelineEvent } from '../components/Core'
import { setPlate, toggleRoutine, useAllDays, useExpenses, useNow, useSettings, useTasks, useToday } from '../db/hooks'
import { timeLeft, urgency } from '../lib/deadlines'
import { buildGreeting } from '../lib/greeting'
import { hourDecimal, shanghaiParts, todayKey } from '../lib/time'
import { plateLoaded, wonStreak } from '../lib/wonday'

const URG_COLOR = { overdue: 'var(--red)', urgent: 'var(--red)', soon: 'var(--amber)', later: 'var(--dim)' }

function countdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((v) => String(v).padStart(2, '0')).join(':')
}

export function Home() {
  const s = useSettings()
  const today = useToday()
  const days = useAllDays()
  const tasks = useTasks()
  const expenses = useExpenses()
  const now = useNow()
  const key = todayKey(now)
  const { hour } = shanghaiParts(now)

  const loaded = s.plates.map((p) => plateLoaded(today.plates[p.id]))
  const left = loaded.filter((x) => !x).length
  const open = tasks.filter((t) => !t.done && t.due).sort((a, b) => a.due!.localeCompare(b.due!))
  const urgentNext = open.find((t) => urgency(new Date(t.due!), now) === 'urgent')
  const next = open.find((t) => new Date(t.due!) > now)
  const streak = wonStreak({ ...days, [key]: today }, key, s.plates, s.routine)
  const spent = expenses.filter((e) => e.date === key).reduce((a, e) => a + e.amount, 0)
  const doneToday = tasks.filter((t) => t.doneAt && todayKey(new Date(t.doneAt)) === key).length
  const dueToday = tasks.filter((t) => t.due && todayKey(new Date(t.due)) === key).length
  const routineN = s.routine.filter((r) => today.routine[r.id]).length

  const events: TimelineEvent[] = open
    .filter((t) => todayKey(new Date(t.due!)) === key)
    .map((t) => {
      const h = hourDecimal(new Date(t.due!))
      return { start: Math.max(0, h - 0.5), end: h, color: URG_COLOR[urgency(new Date(t.due!), now)] }
    })

  const g = buildGreeting({
    name: s.name,
    hour,
    classesToday: 0,
    urgentDeadlineHours: urgentNext ? Math.max(1, Math.floor((new Date(urgentNext.due!).getTime() - now.getTime()) / 3600_000)) : null,
    platesLeft: left,
    platesTotal: s.plates.length,
  })

  return (
    <>
      <p className="greet mat">
        {g.hello.replace(`${s.name}.`, '')}
        <b>{s.name}</b>. {g.body}
      </p>
      <div className="readout">
        <span>PWR 98%</span>
        <span>
          SYS <b>NOMINAL</b>
        </span>
        <span>LOCAL MODE</span>
      </div>
      <Core plates={s.plates} loaded={loaded} events={events} hour={hourDecimal(now)} />
      <p className="micro" style={{ textAlign: 'center', margin: '0 0 12px' }}>
        PLATES {loaded.length - left}/{loaded.length} // STREAK {streak} // ROUTINE {routineN}/{s.routine.length}
      </p>

      <section className="panel mat">
        <div className="row">
          <div className="sp">
            <div className="micro gold">NEXT UP // TASK</div>
            {next ? (
              <>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{next.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  {new Date(next.due!).toLocaleString('en-GB', { timeZone: 'Asia/Shanghai', weekday: 'short', hour: '2-digit', minute: '2-digit' })} · {next.area}
                </div>
              </>
            ) : (
              <div className="empty">Nothing scheduled. Add a task with the + button.</div>
            )}
          </div>
          {next && (
            <div className="mono" style={{ fontSize: 20, color: 'var(--cyan)', textShadow: '0 0 10px rgba(0,229,255,.6)' }}>
              {countdown(new Date(next.due!).getTime() - now.getTime())}
            </div>
          )}
        </div>
      </section>

      <section className="panel mat">
        <div className="panel-h">
          <span className="micro">BARBELL // TODAY</span>
          <span className="micro" style={{ color: 'var(--text)' }}>
            {loaded.length - left}/{loaded.length}
          </span>
        </div>
        <div className="plates" style={{ '--n': s.plates.length } as React.CSSProperties}>
          {s.plates.map((p, i) => (
            <button
              key={p.id}
              className={`plate ${loaded[i] ? 'on' : ''}`}
              style={{ '--c': p.color } as React.CSSProperties}
              aria-pressed={loaded[i]}
              onClick={() => {
                const cur = today.plates[p.id]
                setPlate(key, p.id, loaded[i] ? { ...cur, done: false, gym: undefined } : { ...cur, done: true, gym: p.kind === 'gym' ? 'trained' : undefined })
              }}
            >
              <span className="ic" />
              {p.name}
            </button>
          ))}
        </div>
        <div className="panel-h" style={{ marginTop: 12, marginBottom: 0 }}>
          <span className="micro">MORNING ROUTINE</span>
          <span className="micro" style={{ color: 'var(--text)' }}>
            {routineN}/{s.routine.length}
          </span>
        </div>
        <div className="routine">
          {s.routine.map((r) => (
            <button key={r.id} className={today.routine[r.id] ? 'on' : ''} onClick={() => toggleRoutine(key, r.id)} aria-label={r.label} aria-pressed={!!today.routine[r.id]} title={r.label}>
              <span />
            </button>
          ))}
        </div>
      </section>

      <section className="panel mat">
        <div className="panel-h">
          <span className="micro">THREAT BOARD // DEADLINES</span>
        </div>
        {open.length === 0 && <div className="empty">No deadlines. Clear skies.</div>}
        {open.slice(0, 4).map((t) => {
          const u = urgency(new Date(t.due!), now)
          return (
            <div key={t.id} className={`dl ${u === 'urgent' || u === 'overdue' ? 'urgent' : ''}`}>
              <span className="bar" style={{ background: URG_COLOR[u] }} />
              <span className="sp">
                {t.title}
                {(u === 'urgent' || u === 'overdue') && <span className="tag-urgent">{u === 'overdue' ? 'OVERDUE' : 'URGENT'}</span>}
              </span>
              <span className="t" style={{ color: u === 'later' ? 'var(--muted)' : URG_COLOR[u] }}>
                {timeLeft(new Date(t.due!), now)}
              </span>
            </div>
          )
        })}
      </section>

      <section className="panel mat">
        <div className="micro" style={{ color: 'var(--noor)' }}>
          NOOR // SMALL STEP
        </div>
        <div style={{ fontSize: 14, marginTop: 4 }}>
          Read 3 ayat today. <span style={{ color: 'var(--noor)' }}>"With hardship comes ease."</span> 94:5
        </div>
      </section>

      <div className="stats mat">
        <div className="tile">
          <div className="v" style={{ color: 'var(--green)' }}>
            {streak}
          </div>
          <div className="micro">Won streak</div>
        </div>
        <div className="tile">
          <div className="v">
            {doneToday}/{Math.max(dueToday, doneToday)}
          </div>
          <div className="micro">Tasks</div>
        </div>
        <div className="tile">
          <div className="v" style={{ color: 'var(--muted)' }}>
            —
          </div>
          <div className="micro">Sleep</div>
        </div>
        <div className="tile">
          <div className="v" style={{ color: spent > s.dailyBudget ? 'var(--red)' : 'var(--amber)' }}>
            {s.currency}
            {Math.round(spent)}
          </div>
          <div className="micro">
            of {s.currency}
            {s.dailyBudget}
          </div>
        </div>
      </div>
    </>
  )
}
