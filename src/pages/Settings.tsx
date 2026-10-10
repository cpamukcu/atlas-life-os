import { useRef, useState } from 'react'
import { suitUp } from '../audio/sfx'
import { say } from '../audio/voice'
import { Switch } from '../components/Switch'
import type { PlateDef } from '../config'
import { exportAll, importAll, downloadJson, isBackup } from '../db/backup'
import { saveSettings, uid } from '../db/db'
import { useSettings } from '../db/hooks'
import { todayKey } from '../lib/time'

const COLORS = ['#FF8A3D', '#B388FF', '#FF6EC7', '#64FFDA', '#FFC94A', '#00E5FF', '#7FD8A6']

export function Settings() {
  const s = useSettings()
  const [msg, setMsg] = useState('')
  const file = useRef<HTMLInputElement>(null)

  const setPlates = (plates: PlateDef[]) => saveSettings({ plates })

  async function onImport(f: File) {
    try {
      const data = JSON.parse(await f.text())
      if (!isBackup(data)) throw new Error('That file is not an ATLAS backup.')
      if (!confirm('Replace all data on this device with this backup?')) return
      await importAll(data)
      setMsg('Backup restored.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Import failed.')
    }
  }

  return (
    <>
      <h1 className="h1">SETTINGS</h1>

      <section className="panel">
        <div className="panel-h">
          <span className="micro">IDENTITY</span>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <label className="micro">Name on screen</label>
          <input className="field" defaultValue={s.name} key={'n' + s.name} onBlur={(e) => e.target.value.trim() && saveSettings({ name: e.target.value.trim() })} />
          <label className="micro">How the voice says it</label>
          <input className="field" defaultValue={s.spokenName} key={'v' + s.spokenName} onBlur={(e) => e.target.value.trim() && saveSettings({ spokenName: e.target.value.trim() })} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-h">
          <span className="micro">SOUND AND EFFECTS</span>
        </div>
        <label className="toggle">
          <span>Sound and voice (suit-up boot, Ryan)</span>
          <Switch on={s.sound} onChange={(v) => saveSettings({ sound: v })} label="Sound" />
        </label>
        <label className="toggle">
          <span>Calm mode (night study)</span>
          <Switch on={s.calm} onChange={(v) => saveSettings({ calm: v })} label="Calm mode" />
        </label>
        <div className="row" style={{ gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <button className="btn gold" onClick={() => suitUp()}>
            Test suit-up
          </button>
          <button className="btn cyan" onClick={() => say('hello-evening')}>
            Test Ryan
          </button>
          <button className="btn" onClick={() => saveSettings({ lastBoot: '' }).then(() => location.reload())}>
            Replay boot
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-h">
          <span className="micro">PLATES</span>
          <span className="micro">{s.plates.length}</span>
        </div>
        {s.plates.map((p, i) => (
          <div key={p.id} className="dl">
            <span className="bar" style={{ background: p.color }} />
            <input
              className="field sp"
              defaultValue={p.name}
              onBlur={(e) => {
                const name = e.target.value.trim()
                if (name && name !== p.name) setPlates(s.plates.map((x, j) => (j === i ? { ...x, name } : x)))
              }}
              aria-label="Plate name"
            />
            <button className="chip" disabled={s.plates.length <= 1} onClick={() => confirm(`Remove the ${p.name} plate?`) && setPlates(s.plates.filter((_, j) => j !== i))} aria-label={`Remove ${p.name}`}>
              ✕
            </button>
          </div>
        ))}
        <button
          className="btn"
          style={{ width: '100%', marginTop: 8 }}
          disabled={s.plates.length >= 6}
          onClick={() => setPlates([...s.plates, { id: uid().slice(0, 8), name: 'Study', color: COLORS[s.plates.length % COLORS.length], kind: 'minutes' }])}
        >
          Add plate
        </button>
      </section>

      <section className="panel">
        <div className="panel-h">
          <span className="micro">MONEY</span>
        </div>
        <label className="micro">Daily budget (¥)</label>
        <input className="field mono" inputMode="numeric" defaultValue={s.dailyBudget} key={'b' + s.dailyBudget} onBlur={(e) => Number(e.target.value) > 0 && saveSettings({ dailyBudget: Number(e.target.value) })} />
      </section>

      <section className="panel">
        <div className="panel-h">
          <span className="micro">BACKUP</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 10px' }}>
          Your data lives only on this device for now. Export a backup every week; iPhone can clear website data if storage runs low.
        </p>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button className="btn gold" onClick={async () => downloadJson(await exportAll(), `atlas-backup-${todayKey()}.json`)}>
            Export JSON
          </button>
          <button className="btn" onClick={() => file.current?.click()}>
            Import JSON
          </button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
        </div>
        {msg && <div style={{ marginTop: 8, fontSize: 13, color: 'var(--cyan)' }}>{msg}</div>}
      </section>

      <section className="panel">
        <div className="panel-h">
          <span className="micro">INSTALL ON IPHONE</span>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>
          Open this page in Safari, tap the Share button, then "Add to Home Screen". ATLAS opens full screen and works offline.
        </p>
      </section>
      <p className="micro" style={{ textAlign: 'center' }}>
        ATLAS v{__APP_VERSION__} // LOCAL MODE
      </p>
    </>
  )
}
