# Asharas 🎧

A responsive, Apple Music-inspired web player with a light adaptive-material
interface, immersive lyrics, and touch-first motion, powered by a custom
[JioSaavn API](https://jiosaavn-api-one-rho.vercel.app). No ads, no logins.

**Live:** https://www.asharas.in

## Features

- **Song search** via `GET /api/search/songs?query=…` with animated glass
  result cards (artwork, title, artist, album, duration)
- **Mood grid** — Hip Hop, Chill, Party, Workout, Romance, Focus, Trending,
  Sad — combined with a **language selector** (Telugu, Hindi, English, Tamil,
  Kannada, Malayalam, Punjabi)
- **HTML5 audio playback** picking the highest-quality stream from each
  song's `downloadUrl` array (320kbps preferred; handles `url`/`link` and
  `artists.primary`/`primaryArtists` API variants)
- **Full player bar**: play/pause, next/previous, shuffle, repeat
  (off/all/one), favorite, download, seek, volume, media-session
  (lock-screen keys), and keyboard shortcuts (Space, N, P, ←/→)
- **Multi-layer search** — Song / Artist / Language filter pills and a live
  "recommended searches" dropdown that updates as you type; the top-right
  language selector subsets moods, trending and search across the app
- **Queue management** — add-to-queue on every track (rows, trending,
  language rows, recently played) plus a dedicated Queue view
- **Favorites & playlists** stored in localStorage, with add-to-playlist from
  any song row
- **Recently Played** rail and a famous-hits **Trending Now** selection,
  plus language-specific home rows
- **Real Listen Together** — the host generates a 4-digit code, friends
  join by code or invite link (`?session=CODE`), and playback stays synced
  across devices over MQTT; the host can transfer the crown to any listener
- **Apple Music-inspired UI** — a light desktop library sidebar, restrained
  translucent navigation materials, precise system typography, and an
  artwork-driven immersive player with large synced lyrics
- **iPhone-style mobile layout** — five-tab navigation, a compact mini-player,
  full-screen Now Playing, 44px touch targets, and safe-area support

## Running locally

Static site, no build step:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell, library views, player, lyrics, and dialogs |
| `style.css` | Base components and motion primitives |
| `apple-player.css` | Adaptive light desktop/mobile presentation layer |
| `app.js` | API calls, views, queue/shuffle/repeat, favorites, playlists |
| `.github/workflows/deploy-pages.yml` | Auto-deploy to GitHub Pages on push |
