import { useState } from 'react'
import { db, uid } from '../db/db'
import { setMood } from '../db/hooks'
import { AREAS } from '../lib/catalog'
import { todayKey } from '../lib/time'

type Kind = 'task' | 'expense' | 'mood' | 'note'
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Fun', 'Study', 'Other']

export function QuickAdd({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState<Kind>('task')
  const [text, setText] = useState('')
  const [due, setDue] = useState('')
  const [area, setArea] = useState('School')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState('Food')
  const [err, setErr] = useState('')
  async function save() {
    const now = new Date().toISOString()
    const today = todayKey()
    if (kind === 'task') {
      if (!text.trim()) return setErr('Give the task a name.')
      await db.tasks.add({ id: uid(), title: text.trim(), area, due: due ? new Date(due).toISOString() : undefined, done: false, createdAt: now })
    } else if (kind === 'expense') {
      const n = Number(amount)
      if (!(n > 0)) return setErr('Enter an amount above zero.')
      await db.expenses.add({ id: uid(), amount: Math.round(n * 100) / 100, category: cat, note: text.trim(), date: today, createdAt: now })
    } else if (kind === 'note') {
      if (!text.trim()) return setErr('Write something first.')
      await db.notes.add({ id: uid(), text: text.trim(), createdAt: now })
    }
    onClose()
  }

  async function mood(n: number) {
    await setMood(todayKey(), n)
    onClose()
  }

  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Quick add">
        <div className="panel-h">
          <span className="micro gold">QUICK ADD</span>
          <button className="chip" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>
        <div className="chips">
          {(['task', 'expense', 'mood', 'note'] as Kind[]).map((k) => (
            <button key={k} className={`chip ${kind === k ? 'on' : ''}`} onClick={() => (setKind(k), setErr(''))}>
              {k[0].toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>

        {kind === 'mood' ? (
          <div className="chips" style={{ justifyContent: 'space-between' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className="btn" style={{ flex: 1 }} onClick={() => mood(n)}>
                {n}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {kind === 'expense' && (
              <>
                <input className="field mono" inputMode="decimal" placeholder="Amount (¥)" value={amount} onChange={(e) => (setAmount(e.target.value), setErr(''))} autoFocus />
                <div className="chips" style={{ margin: 0 }}>
                  {CATEGORIES.map((c) => (
                    <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
            <input
              className="field"
              placeholder={kind === 'task' ? 'Finish case study report' : kind === 'expense' ? 'Note (optional)' : 'Quick note'}
              value={text}
              onChange={(e) => (setText(e.target.value), setErr(''))}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              autoFocus={kind !== 'expense'}
            />
            {kind === 'task' && (
              <>
                <input className="field mono" type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
                <div className="chips" style={{ margin: 0 }}>
                  {AREAS.map((a) => (
                    <button key={a} className={`chip ${area === a ? 'on' : ''}`} onClick={() => setArea(a)}>
                      {a}
                    </button>
                  ))}
                </div>
              </>
            )}
            {err && <div style={{ color: 'var(--red)', fontSize: 13 }}>{err}</div>}
            <button className="btn gold" onClick={save}>
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
