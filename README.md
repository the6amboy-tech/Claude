# Asharas 🎧

A premium, responsive music player with an Apple-inspired frosted-glass theme
and a 3D motion system, powered by a custom
[JioSaavn API](https://jiosaavn-api-one-rho.vercel.app). No ads, no logins.

**Live:** https://the6amboy-tech.github.io/Claude/

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
- **Favorites & playlists** stored in localStorage, with add-to-playlist from
  any song row
- **Trending Now** rail with See-all, a **Did you know?** fun-fact card, and
  **Listen Together** share links (`?q=…&song=…`) that auto-load the same
  song for a friend
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
