/* ============ Asharas music player ============ */
const API_BASE = "https://jiosaavn-api-one-rho.vercel.app";

// Neutral glass-toned placeholder shown when a song has no artwork
const COVER_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#1c1c26"/>
      <circle cx="50" cy="50" r="26" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="4"/>
      <circle cx="50" cy="50" r="6" fill="rgba(255,255,255,0.35)"/>
    </svg>`
  );

const el = {
  form: document.getElementById("search-form"),
  input: document.getElementById("search-input"),
  status: document.getElementById("status"),
  results: document.getElementById("results"),
  player: document.getElementById("player"),
  audio: document.getElementById("audio"),
  cover: document.getElementById("player-cover"),
  title: document.getElementById("player-title"),
  artist: document.getElementById("player-artist"),
  btnPlay: document.getElementById("btn-play"),
  btnPrev: document.getElementById("btn-prev"),
  btnNext: document.getElementById("btn-next"),
  seek: document.getElementById("seek"),
  timeCurrent: document.getElementById("time-current"),
  timeTotal: document.getElementById("time-total"),
  volume: document.getElementById("volume"),
};

let playlist = []; // normalized songs from the last search
let currentIndex = -1;
let seeking = false;
let errorStreak = 0; // consecutive tracks that failed to load

/* ---------- API helpers ---------- */

// The API returns arrays of {quality, url} (some deployments use "link").
function pickHighestQuality(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  const kbps = (q) => parseInt(String(q?.quality || ""), 10) || 0;
  const best = [...items].sort((a, b) => kbps(b) - kbps(a))[0];
  return best.url || best.link || "";
}

function pickImage(images) {
  if (typeof images === "string") return images;
  if (!Array.isArray(images) || images.length === 0) return "";
  const size = (i) => parseInt(String(i?.quality || ""), 10) || 0;
  const best = [...images].sort((a, b) => size(b) - size(a))[0];
  return best.url || best.link || "";
}

function artistNames(song) {
  const primary = song.artists?.primary;
  if (Array.isArray(primary) && primary.length) {
    return primary.map((a) => a.name).join(", ");
  }
  return song.primaryArtists || song.singers || "Unknown Artist";
}

function decodeEntities(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str || "";
  return txt.value;
}

function normalizeSong(song) {
  return {
    id: song.id,
    title: decodeEntities(song.name || song.title || "Untitled"),
    artist: decodeEntities(artistNames(song)),
    album: decodeEntities(song.album?.name || ""),
    cover: pickImage(song.image),
    streamUrl: pickHighestQuality(song.downloadUrl),
    duration: Number(song.duration) || 0,
  };
}

async function searchSongs(query) {
  const url = `${API_BASE}/api/search/songs?query=${encodeURIComponent(query)}&limit=25`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API responded with ${res.status}`);
  const json = await res.json();
  const results = json.data?.results || json.results || [];
  return results.map(normalizeSong).filter((s) => s.streamUrl);
}

/* ---------- Rendering ---------- */

function setStatus(html) {
  el.status.innerHTML = html;
  el.status.style.display = html ? "" : "none";
}

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function renderResults() {
  el.results.innerHTML = "";
  playlist.forEach((song, i) => {
    const li = document.createElement("li");
    li.className = "track";
    li.style.animationDelay = `${Math.min(i * 45, 450)}ms`;
    li.dataset.index = i;

    const img = document.createElement("img");
    img.className = "track-cover";
    img.src = song.cover || COVER_FALLBACK;
    img.alt = `${song.title} album artwork`;
    img.loading = "lazy";
    img.onerror = () => { img.onerror = null; img.src = COVER_FALLBACK; };

    const info = document.createElement("div");
    info.className = "track-info";
    const name = document.createElement("div");
    name.className = "track-name";
    name.textContent = song.title;
    const by = document.createElement("div");
    by.className = "track-by";
    by.textContent = song.album ? `${song.artist} · ${song.album}` : song.artist;
    info.append(name, by);

    const eq = document.createElement("span");
    eq.className = "track-eq";
    eq.innerHTML = "<span></span><span></span><span></span>";

    const dur = document.createElement("span");
    dur.className = "track-duration";
    dur.textContent = formatTime(song.duration);

    li.append(img, info, eq, dur);
    li.addEventListener("click", () => playIndex(i));
    el.results.appendChild(li);
  });
}

function markActive() {
  el.results.querySelectorAll(".track").forEach((li) => {
    const isActive = Number(li.dataset.index) === currentIndex;
    li.classList.toggle("active", isActive);
    li.classList.toggle("paused", isActive && el.audio.paused);
  });
}

/* ---------- Playback ---------- */

function playIndex(i) {
  if (i < 0 || i >= playlist.length) return;
  currentIndex = i;
  const song = playlist[i];

  el.audio.src = song.streamUrl;
  el.audio.play().catch(() => {});

  el.cover.src = song.cover || COVER_FALLBACK;
  el.cover.onerror = () => { el.cover.onerror = null; el.cover.src = COVER_FALLBACK; };
  el.title.textContent = song.title;
  el.artist.textContent = song.artist;
  document.title = `${song.title} · Asharas`;

  el.player.classList.add("visible");
  el.player.setAttribute("aria-hidden", "false");
  markActive();

  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: song.album,
      artwork: song.cover ? [{ src: song.cover, sizes: "500x500", type: "image/jpeg" }] : [],
    });
    navigator.mediaSession.setActionHandler("previoustrack", playPrev);
    navigator.mediaSession.setActionHandler("nexttrack", playNext);
  }
}

function playNext() {
  if (!playlist.length) return;
  playIndex((currentIndex + 1) % playlist.length);
}

function playPrev() {
  if (!playlist.length) return;
  playIndex((currentIndex - 1 + playlist.length) % playlist.length);
}

function togglePlay() {
  if (currentIndex === -1) {
    if (playlist.length) playIndex(0);
    return;
  }
  if (el.audio.paused) el.audio.play().catch(() => {});
  else el.audio.pause();
}

/* ---------- Events ---------- */

el.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = el.input.value.trim();
  if (!query) return;

  setStatus('<div class="spinner"></div>');
  el.results.innerHTML = "";
  try {
    playlist = await searchSongs(query);
    currentIndex = -1;
    if (!playlist.length) {
      setStatus(`No playable songs found for “${query.replace(/</g, "&lt;")}”.`);
      return;
    }
    setStatus("");
    renderResults();
  } catch (err) {
    console.error(err);
    setStatus(`<span class="error">Couldn’t reach the music API. ${err.message}</span>`);
  }
});

el.status.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  el.input.value = chip.dataset.q;
  el.form.requestSubmit();
});

el.btnPlay.addEventListener("click", togglePlay);
el.btnNext.addEventListener("click", playNext);
el.btnPrev.addEventListener("click", playPrev);

el.audio.addEventListener("play", () => {
  el.player.classList.add("playing");
  markActive();
});
el.audio.addEventListener("pause", () => {
  el.player.classList.remove("playing");
  markActive();
});
el.audio.addEventListener("ended", playNext); // auto-advance
el.audio.addEventListener("playing", () => { errorStreak = 0; });
el.audio.addEventListener("error", () => {
  if (currentIndex === -1) return;
  errorStreak++;
  if (errorStreak >= playlist.length) {
    setStatus('<span class="error">None of these tracks could be streamed. Try another search.</span>');
    return;
  }
  setStatus('<span class="error">This track failed to load — skipping.</span>');
  playNext();
});

el.audio.addEventListener("loadedmetadata", () => {
  el.timeTotal.textContent = formatTime(el.audio.duration);
  el.seek.max = el.audio.duration || 0;
});

el.audio.addEventListener("timeupdate", () => {
  if (seeking) return;
  el.timeCurrent.textContent = formatTime(el.audio.currentTime);
  el.seek.value = el.audio.currentTime;
  paintRange(el.seek);
});

el.seek.addEventListener("input", () => {
  seeking = true;
  el.timeCurrent.textContent = formatTime(Number(el.seek.value));
  paintRange(el.seek);
});
el.seek.addEventListener("change", () => {
  el.audio.currentTime = Number(el.seek.value);
  seeking = false;
});

el.volume.addEventListener("input", () => {
  el.audio.volume = Number(el.volume.value);
  paintRange(el.volume);
});

// Keep the range track's filled portion in sync with its value
function paintRange(range) {
  const min = Number(range.min) || 0;
  const max = Number(range.max) || 100;
  const pct = max > min ? ((Number(range.value) - min) / (max - min)) * 100 : 0;
  range.style.setProperty("--fill", `${pct}%`);
}

// Space bar toggles play/pause when not typing in the search box
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && document.activeElement !== el.input) {
    e.preventDefault();
    togglePlay();
  }
});

el.audio.volume = Number(el.volume.value);
paintRange(el.volume);
paintRange(el.seek);
