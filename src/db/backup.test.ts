import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { exportAll, importAll } from './backup'
import { db, saveSettings } from './db'

describe('backup', () => {
  beforeEach(async () => {
    await Promise.all(db.tables.map((t) => t.clear()))
  })

  it('round-trips every table', async () => {
    await saveSettings({ name: 'Can' })
    await db.tasks.add({ id: 't1', title: 'Case study', area: 'School', done: false, createdAt: 'x' })
    await db.days.put({ date: '2026-10-10', plates: { gym: { done: true } }, routine: {}, slip: false })
    const b = await exportAll()

    await Promise.all(db.tables.map((t) => t.clear()))
    expect(await db.tasks.count()).toBe(0)

    await importAll(b)
    expect(await db.tasks.count()).toBe(1)
    expect((await db.days.get('2026-10-10'))?.plates.gym.done).toBe(true)
    expect((await db.settings.get('me'))?.name).toBe('Can')
  })

  it('rejects files that are not ATLAS backups', async () => {
    await expect(importAll({ foo: 1 } as never)).rejects.toThrow('Not an ATLAS backup')
  })
})
