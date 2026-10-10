# Architecture (v0.1, local mode)

```
 iPhone / Mac browser (PWA, installed to home screen)
 ┌─────────────────────────────────────────────────────────┐
 │  React screens (src/pages)                              │
 │   Home · Academics · Barbell · Tasks · More / Settings  │
 │        │ read via live hooks       ▲ re-render          │
 │        ▼                           │                    │
 │  src/db/hooks.ts  ──►  Dexie (IndexedDB "atlas")        │
 │                        settings · days · tasks ·        │
 │                        expenses · notes                 │
 │  src/lib/*  pure logic (won day, streak, deadlines,     │
 │             greeting, Shanghai time) — unit tested      │
 │  src/audio/* Web Audio: suit-up sfx, Ryan clips, meter  │
 │  Service worker (vite-plugin-pwa): offline cache        │
 └─────────────────────────────────────────────────────────┘
            ▲ static files
 GitHub Pages  ◄── GitHub Actions (lint, typecheck, test, build, deploy)
```

## Decisions

| Topic | Choice | Why |
|---|---|---|
| Hosting | GitHub Pages, public repo | Free; only code is public, never data |
| Storage | IndexedDB on device (Dexie) | Works offline; no server needed yet |
| Sync | Later phase (Supabase free is the front-runner) | Must work from mainland China with a daily VPN |
| Time | Always Asia/Shanghai | Day boundaries and streaks match life in Hangzhou |
| Fonts | Bundled with @fontsource | Google Fonts is unreliable in mainland China |
| Voice | Pre-generated Ryan (en-GB neural) clips + Web Audio effect | Natural voice offline; dynamic speech later via Azure free tier |
| Look | Iron-vibe HUD: red / gold / cyan | Chosen from mockups A–D; original art, no Marvel assets |

## Won day

`isWonDay` in `src/lib/wonday.ts`: every plate loaded (a skipped gym day never counts; a rest day does) + every morning-routine item done + no bad-habit slip. The streak counts back from today, or from yesterday if today isn't won yet. These rules will be checked against the original CP app during the CP data import.

## Adding a module

1. Add it to `MODULES` in `src/lib/catalog.ts` (appears under More).
2. Add a page in `src/pages/` and a route case in `src/App.tsx`.
3. New tables: bump `db.version()` in `src/db/db.ts` and add the table to `TABLES` in `src/db/backup.ts`.
