import { db } from './db'

export const BACKUP_VERSION = 1

export interface Backup {
  app: 'atlas'
  version: number
  exportedAt: string
  tables: Record<string, unknown[]>
}

const TABLES = ['settings', 'days', 'tasks', 'expenses', 'notes'] as const

export async function exportAll(): Promise<Backup> {
  const tables: Record<string, unknown[]> = {}
  for (const t of TABLES) tables[t] = await db.table(t).toArray()
  return { app: 'atlas', version: BACKUP_VERSION, exportedAt: new Date().toISOString(), tables }
}

export function isBackup(x: unknown): x is Backup {
  const b = x as Backup
  return !!b && b.app === 'atlas' && typeof b.version === 'number' && typeof b.tables === 'object'
}

/** Replaces all local data with the backup's contents. */
export async function importAll(b: Backup) {
  if (!isBackup(b)) throw new Error('Not an ATLAS backup file')
  await db.transaction('rw', TABLES.map((t) => db.table(t)), async () => {
    for (const t of TABLES) {
      await db.table(t).clear()
      const rows = b.tables[t]
      if (Array.isArray(rows) && rows.length) await db.table(t).bulkPut(rows)
    }
  })
}

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
