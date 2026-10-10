# Roadmap

Decisions so far: name Can (spoken "Jan"), English UI, iPhone, CNY, all modules, Iron-vibe design D (extra red), Ryan voice.

## Done — v0.1 (local mode)
App shell, HUD design, Command Center, Barbell with won-day logic, Tasks, quick-add, basic Money, Settings, backup, PWA, CI + Pages deploy.

## Next
1. **CP migration**: study cp-habit-building-app, console snippet to export its localStorage, importer with before/after counts and streak check. The original repo is never modified.
2. **Sync backend** (Supabase free tier is the front-runner; must work from China with VPN, offline-first).
3. **Academics (ZJU)**: Playwright on the Mac only, you log in yourself, JSON APIs preferred, documented in `docs/data-sources.md`; timetable grid, teaching week, `.ics` feed; manual timetable form as fallback.
4. **Money + Health first**, then Noor, Work & Income, Goals, Journal, Learning.
5. **ATLAS intelligence**: rule-based insights, dynamic voice (Azure neural free tier), mic commands, optional AI chat via backend key.
6. **Notifications**: web push (iPhone needs the home-screen install), morning briefing, plate nudge, deadline alerts.
