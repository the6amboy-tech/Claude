# Asharas 🎧

A modern, responsive music player with an Apple-inspired frosted-glass theme,
powered by a custom [JioSaavn API](https://jiosaavn-api-one-rho.vercel.app).
No ads, no logins.

## Features

- **Song search** via `GET /api/search/songs?query=…` with instant, animated results
  (album cover, title, artist, album, duration)
- **HTML5 audio playback** using the highest-quality stream from each song's
  `downloadUrl` array (320kbps preferred, gracefully falls back)
- **Play Next / Previous** buttons that cycle through the search results, plus
  auto-advance when a track ends and auto-skip on broken streams
- **Apple-style frosted glass UI** — `backdrop-filter: blur(25px)` panels over
  ambient gradient orbs, 3D floating glass control buttons that bob and lift on
  hover, prominent album artwork in results and on the player panel, animated
  play/pause icon morph, live equalizer badge on the active track
- Seek bar with live progress fill, volume control, media-session integration
  (lock-screen / hardware media keys), and space-bar play/pause
- Fully responsive — the player bar reflows on phones

## Running it

It's a static site — no build step. Either open `index.html` directly, or serve
the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure: search bar, results list, player bar |
| `style.css` | Dark glassmorphism theme, animations, responsive layout |
| `app.js` | API calls, result rendering, playback + playlist logic |
