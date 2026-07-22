# Asharas 🎧

A premium, responsive music player with an Apple-inspired frosted-glass theme
and a 3D motion system, powered by a custom
[JioSaavn API](https://jiosaavn-api-one-rho.vercel.app). No ads, no logins.

**Live:** https://www.asharas.in

## Features

- **Welcome screen** with two entry modes — Mood Player (jump straight to
  vibes) and Normal Player (search-first)
- **Song search** via `GET /api/search/songs?query=…` with animated glass
  result cards (artwork, title, artist, album, duration)
- **Mood grid** — Hip Hop, Chill, Party, Workout, Romance, Focus, Trending,
  Sad — combined with a **language selector** (Telugu, Hindi, English, Tamil,
  Kannada, Malayalam, Punjabi)
- **HTML5 audio playback** picking the highest-quality stream from each
  song's `downloadUrl` array (320kbps preferred; handles `url`/`link` and
  `artists.primary`/`primaryArtists` API variants)
- **Full player bar**: play/pause, next/previous, shuffle, repeat
  (off/all/one), favorite, download, dim mode, seek, volume, media-session
  (lock-screen keys), and keyboard shortcuts (Space, N, P, ←/→)
- **Multi-layer search** — Song / Artist / Language filter pills and a live
  "recommended searches" dropdown that updates as you type; the top-right
  language selector subsets moods, trending and search across the app
- **Queue management** — add-to-queue on every track (rows, trending,
  language rows, recently played) plus a dedicated Queue view
- **Favorites & playlists** stored in localStorage, with add-to-playlist from
  any song row
- **Recently Played** rail and a famous-hits **Trending Now** (curated global
  + Indian classics), language home rows, and a **Did you know?** fun-fact card
- **6 premium themes** (Aurora, Royal Sapphire, Dark Horizon, Velvet Moss,
  Crimson Eclipse, Neon Wave, Classic Slate) with distinct sidebar / panel /
  player hues, switchable live from the toolbar
- **Real Listen Together** — the host generates a 6-character code, friends
  join by code or invite link (`?session=CODE`), and playback stays synced
  across devices over MQTT; the host can transfer the crown to any listener
- **Premium Apple glass UI** — `backdrop-filter: blur(25px)` panels, aurora
  orbs, 3D tilt cards, floating control buttons, sheen sweeps, shimmering
  wordmark, serif-accented typography (Space Grotesk + Inter + Instrument
  Serif + JetBrains Mono)
- **Premium mobile layout** — pill navigation, docked glass-sheet player,
  large touch targets, safe-area insets, distinct type scale

## Running locally

Static site, no build step:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | Welcome screen, shell (sidebar + views), player bar, dialogs |
| `style.css` | Glass theme, 3D motion system, responsive layouts |
| `app.js` | API calls, views, queue/shuffle/repeat, favorites, playlists |
| `.github/workflows/deploy-pages.yml` | Auto-deploy to GitHub Pages on push |
