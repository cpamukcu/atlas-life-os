# ATLAS — personal life operating system

One private app for school, habits, tasks, money, health, faith and reflection, with an AI-assistant personality called ATLAS and an Iron-Man-inspired (but original) holographic HUD.

**Live:** https://canpamukcu.github.io/atlas-life-os/

> v0.1 runs in **local mode**: everything you enter is stored on the device you use (IndexedDB). Phone and computer sync comes in a later phase. Export a backup regularly (Settings → Backup).

## Install on iPhone

1. Open the live link in **Safari**.
2. Tap **Share → Add to Home Screen**.
3. Open ATLAS from the home screen. It runs full screen and works offline.

To hear the suit-up sound and Ryan's greeting, turn on **Settings → Sound and voice**. iPhone only plays sound after a tap, so the boot screen shows **TAP TO ENGAGE**.

## Daily use

- **Home:** tap a plate to load it, tap the routine bars as you finish each step. All plates + full routine + no slip = **DAY SECURED**.
- **+ button:** add a task, expense, mood or note in a few seconds.
- **Barbell:** details per plate (gym trained / rest / skipped with a reason, minutes, what you shipped).
- **Tasks:** everything grouped by when it's due.

## Add or rename a plate

Settings → Plates. Rename in place, ✕ to remove, **Add plate** for a new one (for example "Study"). No code changes needed.

## Backup and restore

Settings → Backup → **Export JSON** saves `atlas-backup-YYYY-MM-DD.json`. **Import JSON** replaces the data on this device with a backup. Backup files are git-ignored; never commit them.

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # unit tests (won day, streak, deadlines, greeting, backup)
npm run lint
npm run typecheck
npm run build
```

Every push runs lint, type-check, tests and build on GitHub Actions; pushes to `main` deploy to GitHub Pages.

- Icons: `python3 scripts/make-icons.py`
- Voice clips: `scripts/make-voice.sh` (needs `pip install edge-tts`)
- Assistant name and defaults: `src/config.ts`

## Privacy

Single user. No analytics, no trackers, no third-party requests at runtime (fonts are bundled). Personal data never goes in this repo.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/ROADMAP.md](docs/ROADMAP.md).
