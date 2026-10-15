# Shred: Denzel's fat-loss / abs PWA

A static, offline-capable PWA. No build step. Content is copied from the Notion **Health Dashboard** and its **Sessions** pages (fetched 2026-10-15).

## Run locally
    cd /workspace/health-app && python3 -m http.server 8787
    # open http://localhost:8787  (service workers need http://localhost or https)

## Install on phone
Host the folder on any HTTPS static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages), open it in Safari (iOS) → Share → *Add to Home Screen*, or in Chrome (Android) → *Install app*.

## Files
- `index.html`, `styles.css`, `app.js`: the UI (hash router, 6 tabs)
- `data.js`: all plan content (sessions/exercises/sets×reps, meals, groceries, cook schedule, targets)
- `sw.js`: offline cache (precaches app + demo images). Bump `VERSION` after edits.
- `manifest.json`, `icons/`: PWA manifest + icons
- `assets/demos/`: exercise demo images downloaded from the Notion workout pages

## Data
Everything is stored in `localStorage` (`shred.v1`) on the device. Settings → Export JSON / CSV, Import JSON.
Testing aid: `?date=YYYY-MM-DD` overrides "today".
