/* ============ Asharas music player ============ */
const API_BASE = "https://jiosaavn-api-one-rho.vercel.app";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* A small, interruptible spring for gesture-driven values. Retargeting cancels
   the previous frame loop and starts from the live presentation value. */
function springValue({ from, to, velocity = 0, response = 0.36, damping = 1, update, complete }) {
  if (prefersReducedMotion()) {
    update(to);
    complete?.();
    return () => {};
  }

  const omega = (2 * Math.PI) / response;
  const stiffness = omega * omega;
  const drag = 2 * damping * omega;
  let value = from;
  let speed = velocity;
  let previous = performance.now();
  let frame = 0;
  let cancelled = false;

  const tick = (now) => {
    if (cancelled) return;
    const dt = Math.min((now - previous) / 1000, 1 / 30);
    previous = now;
    const acceleration = -stiffness * (value - to) - drag * speed;
    speed += acceleration * dt;
    value += speed * dt;
    update(value);

    if (Math.abs(value - to) < 0.25 && Math.abs(speed) < 2) {
      update(to);
      complete?.();
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
}

function projectMomentum(velocity, decelerationRate = 0.998) {
  return (velocity / 1000) * decelerationRate / (1 - decelerationRate);
}

function rubberband(distance, dimension, constant = 0.55) {
  return (distance * dimension * constant) /
    (dimension + constant * Math.abs(distance));
}

function showModalFrom(dialog, source = document.activeElement) {
  if (!dialog || dialog.open) return;
  const rect = source?.getBoundingClientRect?.();
  if (rect) {
    const x = rect.left + rect.width / 2 < innerWidth / 2 ? "0%" : "100%";
    const y = rect.top + rect.height / 2 < innerHeight / 2 ? "0%" : "100%";
    dialog.style.setProperty("--dialog-origin", `${x} ${y}`);
  }
  dialog.showModal();
}

// Neutral glass-toned placeholder shown when a song has no artwork
const COVER_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#161620"/>
      <circle cx="50" cy="50" r="26" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="4"/>
      <circle cx="50" cy="50" r="6" fill="rgba(255,255,255,0.35)"/>
    </svg>`
  );

const $ = (id) => document.getElementById(id);
const el = {
  form: $("search-form"),
  input: $("search-input"),
  viewHome: $("view-home"),
  viewList: $("view-list"),
  viewPlaylists: $("view-playlists"),
  listTitle: $("list-title"),
  backHome: $("back-home"),
  backHome2: $("back-home-2"),
  results: $("results"),
  trendingRow: $("trending-row"),
  teluguRow: $("telugu-row"),
  hindiRow: $("hindi-row"),
  englishRow: $("english-row"),
  tamilRow: $("tamil-row"),
  kannadaRow: $("kannada-row"),
  malayalamRow: $("malayalam-row"),
  punjabiRow: $("punjabi-row"),
  seeAll: $("see-all"),
  moodGrid: $("mood-grid"),
  pulseCard: $("asharas-pulse"),
  pulseMood: $("pulse-mood"),
  pulseLanguage: $("pulse-language"),
  pulseEnergy: $("pulse-energy"),
  pulseEnergyLabel: $("pulse-energy-label"),
  pulseGenerate: $("pulse-generate"),
  pulseShare: $("pulse-share"),
  pulseStatus: $("pulse-status"),
  pulseStage: $("pulse-stage"),
  pulseCovers: $("pulse-covers"),
  pulseResultTitle: $("pulse-result-title"),
  pulseResultMeta: $("pulse-result-meta"),
  pulseResultActions: $("pulse-result-actions"),
  pulsePlay: $("pulse-play"),
  pulseOpen: $("pulse-open"),
  langSelect: $("lang-select"),
  contentTitle: $("content-title"),
  accountButton: $("account-button"),
  searchWrap: document.querySelector(".search-wrap"),
  reco: $("reco"),
  searchModeSelect: $("search-mode-select"),
  recentsSection: $("recents-section"),
  recentsRow: $("recents-row"),
  listenTogether: $("listen-together"),
  navBtns: [...document.querySelectorAll("[data-nav]")],
  sideNew: $("side-new"),
  sideRecents: $("side-recents"),
  sideArtists: $("side-artists"),
  sideAlbums: $("side-albums"),
  sideSongs: $("side-songs"),
  mobileRecents: $("mobile-recents"),
  mobileFavorites: $("mobile-favorites"),
  mobileSongs: $("mobile-songs"),
  sidebarNowPlaying: $("sidebar-now-playing"),
  sidebarCover: $("sidebar-cover"),
  sidebarTitle: $("sidebar-title"),
  sidebarArtist: $("sidebar-artist"),
  player: $("player"),
  audio: $("audio"),
  cover: $("player-cover"),
  title: $("player-title"),
  artist: $("player-artist"),
  btnPlay: $("btn-play"),
  btnPrev: $("btn-prev"),
  btnNext: $("btn-next"),
  btnShuffle: $("btn-shuffle"),
  btnRepeat: $("btn-repeat"),
  btnFav: $("btn-fav"),
  btnDownload: $("btn-download"),
  btnDim: $("btn-dim"),
  seek: $("seek"),
  timeCurrent: $("time-current"),
  timeTotal: $("time-total"),
  volume: $("volume"),
  plDialog: $("pl-dialog"),
  plList: $("pl-list"),
  plNewName: $("pl-new-name"),
  plCreate: $("pl-create"),
  plClose: $("pl-close"),
  playlistsList: $("playlists-list"),
  plMakeName: $("pl-make-name"),
  plMake: $("pl-make"),
  toast: $("toast"),
  ltSessionBar: $("lt-session-bar"),
  ltBarCode: $("lt-bar-code"),
  ltBarCopyCode: $("lt-bar-copy-code"),
  ltBarCopyLink: $("lt-bar-copy-link"),
  ltBarTransfer: $("lt-bar-transfer"),
  ltBarLeave: $("lt-bar-leave"),
  ltDialog: $("lt-dialog"),
  ltHost: $("lt-host"),
  ltJoin: $("lt-join"),
  ltCancel: $("lt-cancel"),
  ltHostDialog: $("lt-host-dialog"),
  ltSessionCode: $("lt-session-code"),
  ltCopyCode: $("lt-copy-code"),
  ltCopyLink: $("lt-copy-link"),
  ltTransferHost: $("lt-transfer-host"),
  ltLeave: $("lt-leave"),
  ltHostClose: $("lt-host-close"),
  ltJoinDialog: $("lt-join-dialog"),
  ltCodeInput: $("lt-code-input"),
  ltJoinBtn: $("lt-join-btn"),
  ltJoinCancel: $("lt-join-cancel"),
  ltTransferDialog: $("lt-transfer-dialog"),
  ltTransferCancel: $("lt-transfer-cancel"),
  ltParticipantsList: $("lt-participants-list"),
  ltEmptyMsg: $("lt-empty-msg"),
  btnLyrics: $("btn-lyrics"),
  lyricsTranslate: $("lyrics-translate"),
  lyricsFocus: $("lyrics-focus"),
  lyricsPanel: $("lyrics-panel"),
  lyricsClose: $("lyrics-close"),
  lyricsMeta: $("lyrics-meta"),
  lyricsBody: $("lyrics-body"),
  viewQueue: $("view-queue"),
  backHome3: $("back-home-3"),
  clearQueue: $("clear-queue"),
  queueNowPlaying: $("queue-now-playing"),
  queueNextUp: $("queue-next-up"),
  queueRemaining: $("queue-remaining"),
  btnQueue: $("btn-queue"),
};

/* ---------- Persistent state ---------- */

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
const saveJSON = (key, val) => localStorage.setItem(key, JSON.stringify(val));

let favs = loadJSON("ash_favs", []);
let playlists = loadJSON("ash_playlists", []);
let recents = loadJSON("ash_recents", []);

let searchMode = "song"; // song | artist | language

// Curated, widely-recognizable hits used to seed Trending Now.
const FAMOUS_HITS = [
  "Kesariya", "Tum Hi Ho", "Apna Bana Le", "Chaleya", "Naatu Naatu",
  "Butta Bomma", "Samajavaragamana", "Blinding Lights", "Shape of You",
  "Believer", "Perfect Ed Sheeran", "Starboy", "Despacito", "Faded Alan Walker",
];
const FAMOUS_ARTISTS = [
  "Taylor Swift", "The Weeknd", "Billie Eilish", "Ed Sheeran",
  "Ariana Grande", "Drake", "Rihanna", "Bruno Mars", "Adele", "Dua Lipa",
  "Beyoncé", "Lady Gaga", "Justin Bieber", "Selena Gomez", "Olivia Rodrigo",
  "Sabrina Carpenter", "Harry Styles", "Post Malone", "SZA", "Kendrick Lamar",
  "A.R. Rahman", "Anirudh Ravichander", "Arijit Singh", "Shreya Ghoshal",
  "Sonu Nigam", "Lata Mangeshkar", "Kishore Kumar", "Asha Bhosle", "Sid Sriram",
  "S. P. Balasubrahmanyam", "Ilaiyaraaja", "Devi Sri Prasad", "Thaman S",
  "K. S. Chithra", "Pritam", "Amit Trivedi", "Badshah", "Diljit Dosanjh",
];

let queue = [];        // songs the player advances through
let playNextQueue = []; // songs queued to play after current track
let listSongs = [];    // songs currently rendered in the list view
let trendSongs = [];
let langSongsCache = {};  // cache for language-specific rows
let currentIndex = -1;
let seeking = false;
let errorStreak = 0;
let shuffleOn = false;
let repeatMode = "off"; // off | all | one
let lastQuery = "";
let dialogSong = null;

/* ---------- Session state ---------- */
let sessionCode = null;
let isHost = false;
let activeMoodQuery = null;
let activeMoodLabel = null;
let activeSearchQuery = null; // last text search, so a language change can re-run it
let pulseSongs = [];
let pulseMixTitle = "Asharas Pulse";

const PULSE_MOODS = {
  surprise: { label: "Surprise", query: "trending hit songs 2026", fallback: "popular songs" },
  glow: { label: "Feel Good", query: "feel good uplifting hits", fallback: "happy popular songs" },
  afterdark: { label: "After Dark", query: "late night chill r&b", fallback: "night drive songs" },
  focus: { label: "Deep Focus", query: "instrumental focus study", fallback: "lofi concentration music" },
  move: { label: "Move", query: "dance workout party hits", fallback: "energetic dance songs" },
  heart: { label: "Heart", query: "romantic love songs", fallback: "love hits" },
};

const PULSE_ENERGY = {
  1: { label: "Soft", query: "acoustic mellow" },
  2: { label: "Balanced", query: "popular" },
  3: { label: "Full", query: "high energy" },
};

// Real cross-device participants, keyed by client id -> display name.
let sessionParticipants = new Map();
const DISPLAY_NAMES = ["Alex", "Jordan", "Sam", "Riley", "Morgan", "Taylor", "Casey", "Quinn", "Nova", "Kai", "Rey", "Zoe"];
const myClientId = "u" + Math.random().toString(36).slice(2, 8);
const myName = DISPLAY_NAMES[Math.floor(Math.random() * DISPLAY_NAMES.length)];
const LT_BROKER = "wss://broker.emqx.io:8084/mqtt";
const ltTopic = (code) => `asharas/session/${code}`;
let ltClient = null;
let ltHeartbeat = 0, ltPruneTimer = 0;
let ltApplying = false; // guard so mirrored actions aren't re-broadcast
const ltLastSeen = new Map(); // client id -> last heartbeat time
const ltAvailable = () => typeof window.mqtt !== "undefined" && !window.__noMqtt;

function generateSessionCode() {
  let code = "";
  for (let i = 0; i < 4; i++) code += Math.floor(Math.random() * 10);
  return code;
}

function updateSessionBarCount() {
  if (!el.ltBarCode) return;
  const n = sessionParticipants.size + 1; // include self
  el.ltBarCode.textContent = `${sessionCode}  ·  🎧 ${n}`;
}

function updateParticipantsUI() {
  if (!el.ltParticipantsList || !el.ltEmptyMsg) return;
  updateSessionBarCount();
  el.ltParticipantsList.innerHTML = "";
  if (sessionParticipants.size === 0) {
    el.ltEmptyMsg.style.display = "block";
    return;
  }
  el.ltEmptyMsg.style.display = "none";
  const entries = [...sessionParticipants.entries()];
  entries.slice(0, 30).forEach(([id, name]) => {
    const row = document.createElement("div");
    row.className = "lt-participant glass";
    row.innerHTML = `
      <span class="lt-participant-avatar">${name[0]}</span>
      <span class="lt-participant-name">${name}</span>
      ${isHost ? `<button class="pill-btn glass lt-transfer-btn" data-who="${id}">Transfer</button>` : ""}
    `;
    el.ltParticipantsList.appendChild(row);
  });
  if (entries.length > 30) {
    const more = document.createElement("p");
    more.className = "empty-note";
    more.textContent = `…and ${entries.length - 30} more listeners`;
    el.ltParticipantsList.appendChild(more);
  }
  el.ltParticipantsList.querySelectorAll(".lt-transfer-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.who;
      ltPublish({ t: "host", to: id });
      isHost = false;
      toast(`Host transferred to ${sessionParticipants.get(id) || "listener"} 👑`);
      updateParticipantsUI();
      el.ltTransferDialog.close();
    });
  });
}

// host: startSession(true); guest: startSession(false, "ABC123")
function startSession(host, code) {
  if (!ltAvailable()) { toast("Realtime sync needs an internet connection."); return false; }
  isHost = host;
  sessionCode = host ? generateSessionCode() : code;
  sessionParticipants = new Map();
  el.ltSessionCode.textContent = sessionCode;
  el.ltBarCode.textContent = sessionCode;
  el.ltSessionBar.hidden = false;
  el.listenTogether.hidden = true;
  updateParticipantsUI();
  ltConnect();
  return true;
}

function endSession() {
  ltPublish({ t: "bye" });
  clearInterval(ltHeartbeat); clearInterval(ltPruneTimer);
  try { ltClient?.end(true); } catch {}
  ltClient = null;
  sessionCode = null;
  isHost = false;
  sessionParticipants = new Map();
  el.ltSessionBar.hidden = true;
  el.listenTogether.hidden = false;
  toast("Session ended");
}

/* ---------- Listen Together sync (real, over MQTT) ---------- */

function ltConnect() {
  const client = window.mqtt.connect(LT_BROKER, {
    clientId: "asharas_" + myClientId, keepalive: 30, reconnectPeriod: 3000, connectTimeout: 8000,
  });
  ltClient = client;
  client.on("connect", () => {
    client.subscribe(ltTopic(sessionCode));
    ltPublish({ t: "hello" });
    if (isHost) ltBroadcastState(true);
    toast(isHost ? `Hosting · ${sessionCode}` : `Joined · ${sessionCode} 🎧`);
  });
  client.on("message", (_topic, payload) => {
    let msg; try { msg = JSON.parse(payload.toString()); } catch { return; }
    if (msg.from === myClientId) return;
    ltHandle(msg);
  });
  // Presence at scale: the host pings every 10s, guests only every 30s.
  // A 1000-listener session stays a trickle (~35 msgs/s fan-in) instead of
  // a flood (200/s at the old 5s cadence).
  let tick = 0;
  ltHeartbeat = setInterval(() => {
    tick++;
    if (isHost || tick % 3 === 0) ltPublish({ t: "ping" });
  }, 10000);
  ltPruneTimer = setInterval(ltPrune, 30000);
}

function ltPublish(obj) {
  if (!ltClient || !sessionCode) return;
  obj.from = myClientId;
  obj.name = myName;
  try { ltClient.publish(ltTopic(sessionCode), JSON.stringify(obj)); } catch {}
}

// Host broadcasts a control event; the current song object rides along on
// songChange so guests can play it even without a shared library.
function broadcastHostEvent(msg) {
  if (!isHost || !sessionCode || ltApplying) return;
  if (msg.type === "songChange") msg.song = queue[currentIndex] || null;
  ltPublish({ t: "ctl", msg });
}

let ltLastStateSend = 0;
function ltBroadcastState(force = false) {
  const song = queue[currentIndex];
  if (!song) return;
  // Throttled so a storm of joiners doesn't make the host re-blast state
  // for every single hello.
  const now = Date.now();
  if (!force && now - ltLastStateSend < 1200) return;
  ltLastStateSend = now;
  broadcastHostEvent({ type: "songChange", songId: song.id, currentTime: el.audio.currentTime });
  broadcastHostEvent({ type: el.audio.paused ? "pause" : "play" });
}

// Cheap per-message bookkeeping: only the counter updates on every message;
// the full participant list rebuilds only while the transfer dialog is open.
function ltRefreshUI() {
  updateSessionBarCount();
  if (el.ltTransferDialog.open) updateParticipantsUI();
}

function ltHandle(msg) {
  if (msg.from) {
    const known = sessionParticipants.has(msg.from);
    sessionParticipants.set(msg.from, msg.name || "Listener");
    ltLastSeen.set(msg.from, Date.now());
    if (!known && msg.t === "hello") {
      if (sessionParticipants.size <= 8) toast(`${msg.name || "A listener"} joined 🎧`);
      if (isHost) ltBroadcastState(); // catch newcomers up (throttled)
    }
    ltRefreshUI();
  }
  if (msg.t === "bye") { sessionParticipants.delete(msg.from); ltRefreshUI(); return; }
  if (msg.t === "host") {
    isHost = msg.to === myClientId;
    if (isHost) { toast("You are now the host 👑"); ltBroadcastState(true); }
    else toast("Host changed");
    ltRefreshUI();
    return;
  }
  if (msg.t === "ctl" && !isHost) applyRemoteControl(msg.msg);
}

// Guests mirror the host's playback.
function applyRemoteControl(m) {
  if (!m) return;
  ltApplying = true;
  if (m.type === "songChange") {
    const s = m.song;
    if (s) {
      const same = queue[currentIndex] && queue[currentIndex].id === s.id;
      if (!same) { queue = [s]; currentIndex = -1; playIndex(0); }
      if (typeof m.currentTime === "number") {
        const seek = () => { try { el.audio.currentTime = m.currentTime; } catch {} };
        if (el.audio.readyState >= 1) seek();
        else el.audio.addEventListener("loadedmetadata", seek, { once: true });
      }
    }
  } else if (m.type === "play") { el.audio.play().catch(() => {}); }
  else if (m.type === "pause") { el.audio.pause(); }
  else if (m.type === "seek" && typeof m.time === "number") { try { el.audio.currentTime = m.time; } catch {} }
  setTimeout(() => { ltApplying = false; }, 250);
}

function ltPrune() {
  // guests ping every ~30s; drop anyone silent for 95s
  const now = Date.now();
  let changed = false;
  sessionParticipants.forEach((_n, id) => {
    if (now - (ltLastSeen.get(id) || 0) > 95000) {
      sessionParticipants.delete(id);
      ltLastSeen.delete(id);
      changed = true;
    }
  });
  if (changed) ltRefreshUI();
}

function sessionUrl() {
  const url = new URL(location.origin + location.pathname);
  url.searchParams.set("session", sessionCode || "");
  if (lastQuery) url.searchParams.set("q", lastQuery);
  const song = queue[currentIndex];
  if (song) url.searchParams.set("song", song.id);
  return url.toString();
}

function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text)
    .then(() => toast(`${label} copied ✓`))
    .catch(() => toast(text));
}

el.langSelect.value = loadJSON("ash_lang", "");
if (loadJSON("ash_dim", false)) document.documentElement.classList.add("dim");

// One adaptive light material keeps the interface visually consistent.
function applyTheme() {
  document.documentElement.setAttribute("data-theme", "light");
}
applyTheme();

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

/* ---------- Hardened API layer ----------
   Goals: never hammer the API (concurrency cap + request dedupe + caching),
   and never leave the UI empty on a hiccup (retries + stale-cache fallback).
   This is what keeps the site healthy under heavy simultaneous use. */
const API_TTL = 10 * 60 * 1000;          // searches: 10 minutes
const API_TTL_LONG = 6 * 60 * 60 * 1000; // home rails / curated seeds: 6 hours
const API_MAX_CONCURRENT = 4;
const apiInflight = new Map();
let apiActive = 0;
const apiWaiters = [];

function apiSlot() {
  if (apiActive < API_MAX_CONCURRENT) { apiActive++; return Promise.resolve(); }
  return new Promise((res) => apiWaiters.push(res));
}
function apiRelease() {
  const next = apiWaiters.shift();
  if (next) next(); // slot passes directly to the next waiter
  else apiActive--;
}

function apiCacheGet(key) {
  try { const raw = localStorage.getItem("ashc:" + key); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}
function apiCacheSet(key, data) {
  try { localStorage.setItem("ashc:" + key, JSON.stringify({ ts: Date.now(), data })); }
  catch {
    // storage full — drop our cache namespace and retry once
    try {
      Object.keys(localStorage).filter((k) => k.startsWith("ashc:")).forEach((k) => localStorage.removeItem(k));
      localStorage.setItem("ashc:" + key, JSON.stringify({ ts: Date.now(), data }));
    } catch {}
  }
}
function apiCachePrune() {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("ashc:"));
    if (keys.length <= 80) return;
    keys.map((k) => [k, (JSON.parse(localStorage.getItem(k)) || {}).ts || 0])
      .sort((a, b) => a[1] - b[1])
      .slice(0, keys.length - 60)
      .forEach(([k]) => localStorage.removeItem(k));
  } catch {}
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Up to 3 attempts with backoff+jitter; retries only on network errors,
// 429 (rate limited) and 5xx. 12s timeout per attempt.
async function fetchWithRetry(url) {
  const delays = [0, 700, 2100];
  let lastErr;
  for (const base of delays) {
    if (base) await sleep(base + Math.random() * 300);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) return res.json();
      lastErr = new Error(`API responded with ${res.status}`);
      if (res.status !== 429 && res.status < 500) throw lastErr;
    } catch (e) {
      clearTimeout(timer);
      if (e === lastErr) throw e; // non-retryable 4xx
      lastErr = e;
    }
  }
  throw lastErr;
}

async function searchSongs(query, limit = 25, ttl = API_TTL) {
  const key = `${limit}:${query.trim().toLowerCase()}`;
  const cached = apiCacheGet(key);
  if (cached && Date.now() - cached.ts < ttl) return cached.data;

  if (apiInflight.has(key)) return apiInflight.get(key);
  const p = (async () => {
    await apiSlot();
    try {
      const url = `${API_BASE}/api/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`;
      const json = await fetchWithRetry(url);
      const results = json.data?.results || json.results || [];
      const songs = results.map(normalizeSong).filter((s) => s.streamUrl);
      if (songs.length) { apiCacheSet(key, songs); apiCachePrune(); }
      return songs;
    } catch (err) {
      if (cached) return cached.data; // stale data beats an empty screen
      throw err;
    } finally {
      apiRelease();
      apiInflight.delete(key);
    }
  })();
  apiInflight.set(key, p);
  return p;
}

async function artistProfile(name) {
  const key = `artist:${name.trim().toLowerCase()}`;
  const cached = apiCacheGet(key);
  if (cached && Date.now() - cached.ts < API_TTL_LONG) return cached.data;

  if (apiInflight.has(key)) return apiInflight.get(key);
  const request = (async () => {
    await apiSlot();
    try {
      const url = `${API_BASE}/api/search/artists?query=${encodeURIComponent(name)}&limit=5`;
      const json = await fetchWithRetry(url);
      const results = json.data?.results || json.results || [];
      const exact = results.find((artist) =>
        decodeEntities(artist.name || "").localeCompare(name, undefined, { sensitivity: "base" }) === 0
      );
      const match = exact || results[0] || null;
      const profile = match ? {
        name: decodeEntities(match.name || name),
        image: pickImage(match.image),
      } : null;
      if (profile?.image) apiCacheSet(key, profile);
      return profile;
    } catch {
      return cached?.data || null;
    } finally {
      apiRelease();
      apiInflight.delete(key);
    }
  })();
  apiInflight.set(key, request);
  return request;
}

const langPrefix = () => (el.langSelect.value ? `${el.langSelect.value} ` : "");

/* ---------- Mood categories (real category songs, not name matches) ----------
   Instead of searching "sad songs" (which returns tracks literally titled
   "sad"), we look up a matching mood *playlist* and play its curated tracks,
   and push any literal-name matches to the bottom. Falls back to a normal
   song search if playlists aren't available. */
const MOOD_CATEGORIES = {
  "hip hop hits":                 { word: "hip hop",    demote: "hip hop" },
  "chill lofi songs":             { word: "chill lofi", demote: "chill" },
  "party dance hits":             { word: "party",      demote: "party" },
  "workout gym motivation songs": { word: "workout",    demote: "workout" },
  "romantic love songs":          { word: "romantic",   demote: "romantic" },
  "instrumental focus study":     { word: "focus",      demote: "focus" },
  "trending hit songs 2026":      { word: "trending",   demote: "trending" },
  "sad emotional songs":          { word: "sad",        demote: "sad" },
};

// Stable-partition: songs whose title literally contains the mood word go last.
function demoteLiteral(songs, word) {
  if (!word) return songs;
  const w = word.toLowerCase();
  const clean = [], literal = [];
  for (const s of songs) (s.title.toLowerCase().includes(w) ? literal : clean).push(s);
  return clean.concat(literal);
}

async function searchPlaylistId(query) {
  const key = `pl:${query.toLowerCase()}`;
  const cached = apiCacheGet(key);
  if (cached && Date.now() - cached.ts < API_TTL_LONG) return cached.data;
  await apiSlot();
  try {
    const json = await fetchWithRetry(`${API_BASE}/api/search/playlists?query=${encodeURIComponent(query)}&limit=5`);
    const results = json.data?.results || json.results || [];
    const id = results[0]?.id || null;
    if (id) apiCacheSet(key, id);
    return id;
  } finally { apiRelease(); }
}

async function playlistSongs(id) {
  const key = `pls:${id}`;
  const cached = apiCacheGet(key);
  if (cached && Date.now() - cached.ts < API_TTL_LONG) return cached.data;
  await apiSlot();
  try {
    const json = await fetchWithRetry(`${API_BASE}/api/playlists?id=${encodeURIComponent(id)}&limit=40`);
    const raw = json.data?.songs || json.data?.list || json.songs || [];
    const songs = raw.map(normalizeSong).filter((s) => s.streamUrl);
    if (songs.length) apiCacheSet(key, songs);
    return songs;
  } finally { apiRelease(); }
}

// Returns real category songs for a mood, honoring the active language.
async function fetchMoodSongs(dataQ) {
  const cat = MOOD_CATEGORIES[dataQ] || { word: dataQ, demote: "" };
  const lang = langPrefix();
  // 1) Prefer a curated mood playlist for genuine category tracks.
  try {
    const id = await searchPlaylistId(`${lang}${cat.word} songs`.trim());
    if (id) {
      const songs = demoteLiteral(diversifySongs(await playlistSongs(id)), cat.demote);
      if (songs.length >= 5) return songs;
    }
  } catch { /* playlists unavailable — fall through to song search */ }
  // 2) Fall back to a song search (language-scoped, then unscoped).
  let songs = diversifySongs(await searchSongs(`${lang}${dataQ}`.trim()));
  if (!songs.length) songs = diversifySongs(await searchSongs(dataQ));
  return demoteLiteral(songs, cat.demote);
}

// Render a mood category into the list view (with spinner + retry).
async function runMood(dataQ, label) {
  const title = `${label} · ${el.langSelect.value || "All languages"}`;
  el.listTitle.textContent = title;
  showView("list");
  el.results.innerHTML = '<div class="spinner"></div>';
  try {
    const songs = await fetchMoodSongs(dataQ);
    renderList(songs, title);
    if (!songs.length) toast("No songs found for this category");
  } catch (err) {
    console.error(err);
    el.results.innerHTML = "";
    const note = document.createElement("p");
    note.className = "empty-note error";
    note.textContent = "Couldn't load this category right now. ";
    const retry = document.createElement("button");
    retry.className = "pill-btn ghost";
    retry.textContent = "↻ Retry";
    retry.addEventListener("click", () => runMood(dataQ, label));
    note.appendChild(retry);
    el.results.appendChild(note);
  }
}

/* ---------- Views ---------- */

function showView(name) {
  el.viewHome.hidden = name !== "home";
  el.viewList.hidden = name !== "list";
  el.viewQueue.hidden = name !== "queue";
  el.viewPlaylists.hidden = name !== "playlists";
  el.navBtns.forEach((b) => {
    const nav = b.dataset.nav;
    let active = nav === name;
    if (name === "list") active = nav === "home";
    if (name === "queue") active = nav === "queue";
    b.classList.toggle("active", active);
    if (active) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  if (el.contentTitle) {
    const titles = {
      home: "Home",
      list: el.listTitle.textContent || "Music",
      queue: "Playing Next",
      playlists: "Library",
    };
    el.contentTitle.textContent = titles[name] || "Asharas";
  }
}

function toast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.toast.classList.remove("show"), 2400);
}

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

const isFav = (id) => favs.some((s) => s.id === id);

function toggleFav(song) {
  if (isFav(song.id)) {
    favs = favs.filter((s) => s.id !== song.id);
    toast("Removed from favorites");
  } else {
    favs.unshift(song);
    toast("Added to favorites ❤️");
  }
  saveJSON("ash_favs", favs);
  syncFavUI();
}

function syncFavUI() {
  const song = queue[currentIndex];
  el.btnFav.classList.toggle("lit", !!song && isFav(song.id));
  el.results.querySelectorAll(".row-fav").forEach((btn) => {
    const favorite = isFav(btn.dataset.id);
    btn.classList.toggle("lit", favorite);
    const track = btn.closest(".track");
    const title = track ? listSongs[Number(track.dataset.index)]?.title : "song";
    btn.setAttribute("aria-label", `${favorite ? "Remove" : "Add"} ${title || "song"} ${favorite ? "from" : "to"} favorites`);
  });
}

/* ---------- Rendering ---------- */

function coverImg(song, cls) {
  const img = document.createElement("img");
  img.className = cls;
  img.src = song.cover || COVER_FALLBACK;
  img.alt = `${song.title} album artwork`;
  img.loading = "lazy";
  img.onerror = () => { img.onerror = null; img.src = COVER_FALLBACK; };
  return img;
}

function renderList(songs, title) {
  listSongs = songs;
  el.listTitle.textContent = title;
  if (el.contentTitle) el.contentTitle.textContent = title;
  el.results.innerHTML = "";

  if (!songs.length) {
    const empty = document.createElement("p");
    empty.className = "empty-note";
    empty.textContent = "Nothing here yet.";
    el.results.appendChild(empty);
  }

  songs.forEach((song, i) => {
    const li = document.createElement("li");
    li.className = "track";
    li.style.animationDelay = `${Math.min(i * 24, 168)}ms`;
    li.dataset.index = i;

    const playTrack = document.createElement("button");
    playTrack.className = "track-main";
    playTrack.setAttribute("aria-label", `Play ${song.title} by ${song.artist}`);

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

    const favBtn = document.createElement("button");
    favBtn.className = "row-btn row-fav" + (isFav(song.id) ? " lit" : "");
    favBtn.dataset.id = song.id;
    favBtn.title = "Favorite";
    favBtn.setAttribute("aria-label", `${isFav(song.id) ? "Remove" : "Add"} ${song.title} ${isFav(song.id) ? "from" : "to"} favorites`);
    favBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    favBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleFav(song); });

    const addBtn = document.createElement("button");
    addBtn.className = "row-btn";
    addBtn.title = "Add to playlist";
    addBtn.setAttribute("aria-label", `Add ${song.title} to a playlist`);
    addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/><path d="M19 15v6"/><path d="M16 18h6"/></svg>';
    addBtn.addEventListener("click", (e) => { e.stopPropagation(); openAddDialog(song); });

    const queueBtn = document.createElement("button");
    queueBtn.className = "row-btn";
    queueBtn.title = "Play next";
    queueBtn.setAttribute("aria-label", `Play ${song.title} next`);
    queueBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>';
    queueBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      playNextQueue.push(song);
      toast(`Added to queue: ${song.title}`);
      updateQueueUI();
    });

    playTrack.append(coverImg(song, "track-cover"), info, eq, dur);
    playTrack.addEventListener("click", () => {
      queue = listSongs;
      playIndex(i);
    });
    li.append(playTrack, favBtn, addBtn, queueBtn);
    el.results.appendChild(li);
  });
  markActive();
}

// Shared artwork card with an "add to queue" overlay button.
function buildTrendCard(song, getList, i) {
  const card = document.createElement("div");
  card.className = "trend-card glass";
  card.style.animationDelay = `${Math.min(i * 28, 196)}ms`;

  const box = document.createElement("div");
  box.className = "trend-cover-box";
  const q = document.createElement("button");
  q.className = "row-btn card-queue";
  q.title = "Add to queue";
  q.setAttribute("aria-label", `Play ${song.title} next`);
  q.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>';
  q.addEventListener("click", (e) => {
    e.stopPropagation();
    playNextQueue.push(song);
    toast(`Added to queue: ${song.title}`);
    updateQueueUI();
  });
  // Spotify-style floating play button
  const play = document.createElement("button");
  play.className = "card-play";
  play.title = "Play";
  play.setAttribute("aria-label", `Play ${song.title}`);
  play.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  play.addEventListener("click", (e) => { e.stopPropagation(); queue = getList(); playIndex(i); });
  box.append(coverImg(song, "trend-cover"), q, play);

  const name = document.createElement("span");
  name.className = "trend-name";
  name.textContent = song.title;
  const by = document.createElement("span");
  by.className = "trend-by";
  by.textContent = song.artist;

  card.append(box, name, by);
  card.addEventListener("click", () => { queue = getList(); playIndex(i); });
  return card;
}

function renderTrending(songs) {
  trendSongs = songs;
  el.trendingRow.innerHTML = "";
  songs.slice(0, 14).forEach((song, i) =>
    el.trendingRow.appendChild(buildTrendCard(song, () => trendSongs, i)));
}

// Generic horizontal row renderer for language categories
function renderLangRow(rowEl, songs, rowKey) {
  langSongsCache[rowKey] = songs;
  rowEl.innerHTML = "";
  songs.slice(0, 12).forEach((song, i) =>
    rowEl.appendChild(buildTrendCard(song, () => langSongsCache[rowKey], i)));
}

// Recently played — updated whenever a track starts.
function pushRecent(song) {
  recents = [song, ...recents.filter((s) => s.id !== song.id)].slice(0, 20);
  saveJSON("ash_recents", recents);
  renderRecents();
}

function renderRecents() {
  if (!el.recentsSection) return;
  el.recentsSection.hidden = recents.length === 0;
  el.recentsRow.innerHTML = "";
  recents.forEach((song, i) =>
    el.recentsRow.appendChild(buildTrendCard(song, () => recents, i)));
}

function renderPlaylists() {
  el.playlistsList.innerHTML = "";
  if (!playlists.length) {
    const p = document.createElement("p");
    p.className = "empty-note";
    p.textContent = "No playlists yet — create one above, or add songs from any list.";
    el.playlistsList.appendChild(p);
  }
  playlists.forEach((pl, idx) => {
    const row = document.createElement("div");
    row.className = "pl-row glass";

    const meta = document.createElement("button");
    meta.className = "pl-meta";
    meta.innerHTML = `<span class="pl-name">${pl.name.replace(/</g, "&lt;")}</span>
      <span class="pl-count">${pl.songs.length} song${pl.songs.length === 1 ? "" : "s"}</span>`;
    meta.addEventListener("click", () => {
      renderList(pl.songs, pl.name);
      showView("list");
    });

    const play = document.createElement("button");
    play.className = "row-btn";
    play.title = "Play playlist";
    play.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    play.addEventListener("click", () => {
      if (!pl.songs.length) return toast("This playlist is empty");
      queue = pl.songs;
      playIndex(0);
    });

    const del = document.createElement("button");
    del.className = "row-btn danger";
    del.title = "Delete playlist";
    del.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>';
    del.addEventListener("click", () => {
      playlists.splice(idx, 1);
      saveJSON("ash_playlists", playlists);
      renderPlaylists();
      toast("Playlist deleted");
    });

    row.append(meta, play, del);
    el.playlistsList.appendChild(row);
  });
}

/* ---------- Queue rendering ---------- */

function renderQueue() {
  const current = queue[currentIndex];
  el.queueNowPlaying.innerHTML = "";
  el.queueNextUp.innerHTML = "";
  el.queueRemaining.innerHTML = "";

  // Now playing
  if (current) {
    const label = document.createElement("div");
    label.className = "queue-label";
    label.textContent = "Now Playing";
    el.queueNowPlaying.appendChild(label);
    el.queueNowPlaying.appendChild(makeQueueTrack(current, currentIndex, true));
  }

  // Play next queue
  if (playNextQueue.length) {
    const label = document.createElement("div");
    label.className = "queue-label";
    label.textContent = `Next Up (${playNextQueue.length})`;
    el.queueNextUp.appendChild(label);
    playNextQueue.forEach((song, i) => {
      el.queueNextUp.appendChild(makeQueueTrack(song, -1, false, () => {
        playNextQueue.splice(i, 1);
        renderQueue();
        toast("Removed from queue");
      }));
    });
  }

  // Remaining from main queue
  const remaining = queue.slice(currentIndex + 1);
  if (remaining.length) {
    const label = document.createElement("div");
    label.className = "queue-label";
    label.textContent = `Remaining (${remaining.length})`;
    el.queueRemaining.appendChild(label);
    remaining.forEach((song, i) => {
      const globalIdx = currentIndex + 1 + i;
      el.queueRemaining.appendChild(makeQueueTrack(song, globalIdx, false, () => {
        queue.splice(globalIdx, 1);
        if (globalIdx < currentIndex) currentIndex--;
        renderQueue();
        toast("Removed from queue");
      }));
    });
  }

  // Empty state
  if (!current && !playNextQueue.length && !remaining.length) {
    el.queueNowPlaying.innerHTML = '<p class="empty-note">Queue is empty. Play a song or add tracks with the ⏩ button.</p>';
  }

  updateQueueBtn();
}

function makeQueueTrack(song, idx, isCurrent, onRemove) {
  const row = document.createElement("div");
  row.className = "queue-track" + (isCurrent ? " active" : "");

  const num = document.createElement("span");
  num.className = "queue-track-num";
  num.textContent = isCurrent ? "▶" : (idx >= 0 ? idx + 1 : "•");

  const img = coverImg(song, "queue-track-cover");

  const info = document.createElement("div");
  info.className = "queue-track-info";
  const name = document.createElement("div");
  name.className = "queue-track-name";
  name.textContent = song.title;
  const by = document.createElement("div");
  by.className = "queue-track-by";
  by.textContent = song.artist;
  info.append(name, by);

  row.append(num, img, info);

  if (onRemove) {
    const removeBtn = document.createElement("button");
    removeBtn.className = "queue-remove";
    removeBtn.title = "Remove from queue";
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", (e) => { e.stopPropagation(); onRemove(); });
    row.appendChild(removeBtn);
  }

  if (!isCurrent && idx >= 0) {
    row.addEventListener("click", () => { queue = queue; playIndex(idx); renderQueue(); });
  }

  return row;
}

function updateQueueUI() {
  updateQueueBtn();
  if (!el.viewQueue.hidden) renderQueue();
}

function updateQueueBtn() {
  el.btnQueue.classList.toggle("lit", playNextQueue.length > 0);
}

function markActive() {
  const current = queue[currentIndex];
  el.results.querySelectorAll(".track").forEach((li) => {
    const song = listSongs[Number(li.dataset.index)];
    const isActive = !!current && !!song && song.id === current.id;
    li.classList.toggle("active", isActive);
    li.classList.toggle("paused", isActive && el.audio.paused);
  });
}

/* ---------- Playback ---------- */

function playIndex(i) {
  if (i < 0 || i >= queue.length) return;
  currentIndex = i;
  const song = queue[i];

  el.audio.src = song.streamUrl;
  el.audio.play().catch(() => {});

  el.cover.src = song.cover || COVER_FALLBACK;
  el.cover.onerror = () => { el.cover.onerror = null; el.cover.src = COVER_FALLBACK; };
  el.title.textContent = song.title;
  el.artist.textContent = song.artist;
  if (el.sidebarNowPlaying) {
    el.sidebarNowPlaying.hidden = false;
    el.sidebarCover.src = song.cover || COVER_FALLBACK;
    el.sidebarTitle.textContent = song.title;
    el.sidebarArtist.textContent = song.artist;
  }
  document.title = `${song.title} · Asharas`;

  el.player.hidden = false;
  el.player.classList.add("visible");
  el.player.setAttribute("aria-hidden", "false");
  markActive();
  syncFavUI();
  updateQueueUI();
  pushRecent(song);
  if (typeof syncNowPlaying === "function") syncNowPlaying();
  if (lyricsOpen) loadLyricsFor(song);
  else { lyricsSongId = null; lyricsLines = []; }

  // Broadcast song change to session participants
  broadcastHostEvent({ type: "songChange", songId: song.id, currentTime: 0 });

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

function randomIndex() {
  if (queue.length < 2) return currentIndex;
  let i;
  do { i = Math.floor(Math.random() * queue.length); } while (i === currentIndex);
  return i;
}

function playNext() {
  // Play from the play-next queue first
  if (playNextQueue.length) {
    const nextSong = playNextQueue.shift();
    // Insert into main queue right after current position and play it
    queue.splice(currentIndex + 1, 0, nextSong);
    playIndex(currentIndex + 1);
    updateQueueUI();
    return;
  }
  if (!queue.length) return;
  if (shuffleOn && queue.length > 1) return playIndex(randomIndex());
  const nextIdx = currentIndex + 1;
  if (nextIdx < queue.length) return playIndex(nextIdx);
  // Reached the end of the queue.
  if (repeatMode === "all" && queue.length > 1) return playIndex(0);
  // Repeat off (or a single-song queue): pull in related tracks so playback
  // continues with a *different* song instead of stopping or repeating.
  extendQueueAndPlay();
}

// Autoplay "radio": append related songs and advance. Never re-queues the
// song that just finished, and de-dupes against everything already in queue.
let autoplayLoading = false;
async function extendQueueAndPlay() {
  if (autoplayLoading) return;
  const cur = queue[currentIndex];
  if (!cur) return;
  autoplayLoading = true;
  try {
    const primaryArtist = (cur.artist || "").split(",")[0].trim();
    const seeds = [
      primaryArtist ? `${primaryArtist} songs` : "",
      `${langPrefix()}trending hit songs`,
      `${langPrefix()}popular songs`,
      "top hit songs",
    ].filter(Boolean);
    const existing = new Set(queue.map((s) => s.id));
    let added = [];
    for (const q of seeds) {
      let songs = [];
      try { songs = await searchSongs(q, 25); } catch {}
      added = songs.filter((s) => s.id !== cur.id && !existing.has(s.id));
      if (added.length) break;
    }
    if (added.length) {
      queue = queue.concat(added);
      playIndex(currentIndex + 1);
    } else {
      toast("Reached the end — search or pick a mood to keep the music going");
    }
  } finally {
    autoplayLoading = false;
  }
}

function playPrev() {
  if (!queue.length) return;
  playIndex(shuffleOn ? randomIndex() : (currentIndex - 1 + queue.length) % queue.length);
}

function togglePlay() {
  if (currentIndex === -1) {
    if (queue.length) playIndex(0);
    else if (listSongs.length) { queue = listSongs; playIndex(0); }
    return;
  }
  if (el.audio.paused) el.audio.play().catch(() => {});
  else el.audio.pause();
}

function onEnded() {
  // Repeat-one replays the same track by explicit user choice; otherwise a
  // finished song always advances to a different one (playNext handles the
  // user queue, shuffle, wrap-around and autoplay-radio).
  if (repeatMode === "one") { el.audio.currentTime = 0; el.audio.play().catch(() => {}); return; }
  playNext();
}

/* ---------- Search & moods ---------- */

// Search often returns a whole album/movie back-to-back. Drop exact
// duplicates and cap how many tracks any single album may contribute so the
// results feel varied — unless capping would leave too few, then relax.
function diversifySongs(songs, perAlbum = 3, floor = 8) {
  const seen = new Set();
  const deduped = [];
  for (const s of songs) {
    const key = `${s.title}|${s.artist}`.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(s);
  }
  const count = new Map();
  const kept = [];
  const overflow = [];
  for (const s of deduped) {
    const album = (s.album || "").toLowerCase().trim();
    const n = count.get(album) || 0;
    if (!album || n < perAlbum) { count.set(album, n + 1); kept.push(s); }
    else overflow.push(s);
  }
  return kept.length >= floor ? kept : kept.concat(overflow);
}

/* ---------- Asharas Pulse ----------
   A shareable personal mix built from three lightweight signals. Preferences
   stay on-device; only the resulting search query reaches the music API. */
function pulsePreferences() {
  const moodKey = PULSE_MOODS[el.pulseMood?.value] ? el.pulseMood.value : "surprise";
  const energy = Math.max(1, Math.min(3, Number(el.pulseEnergy?.value) || 2));
  return {
    moodKey,
    language: el.pulseLanguage?.value || "",
    energy,
  };
}

function updatePulseEnergy() {
  if (!el.pulseEnergy || !el.pulseEnergyLabel) return;
  const energy = Math.max(1, Math.min(3, Number(el.pulseEnergy.value) || 2));
  el.pulseEnergyLabel.textContent = PULSE_ENERGY[energy].label;
  el.pulseEnergy.style.setProperty("--pulse-energy", `${(energy - 1) * 50}%`);
}

function resetPulsePreview() {
  if (!pulseSongs.length) return;
  pulseSongs = [];
  el.pulseCovers?.replaceChildren();
  el.pulseStage?.classList.remove("has-mix");
  if (el.pulseResultActions) el.pulseResultActions.hidden = true;
  if (el.pulseShare) el.pulseShare.hidden = true;
  if (el.pulseResultTitle) el.pulseResultTitle.textContent = "Your sound, right now.";
  if (el.pulseResultMeta) el.pulseResultMeta.textContent = "Build again to hear these new settings.";
  if (el.pulseStatus) el.pulseStatus.textContent = "Your Pulse settings changed.";
}

function shufflePulse(songs) {
  const copy = [...songs];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderPulseMix(songs, prefs) {
  if (!el.pulseCovers || !el.pulseStage) return;
  const mood = PULSE_MOODS[prefs.moodKey];
  const energy = PULSE_ENERGY[prefs.energy];
  const language = prefs.language
    ? prefs.language.charAt(0).toUpperCase() + prefs.language.slice(1)
    : "All languages";

  pulseSongs = songs;
  pulseMixTitle = `${mood.label} Pulse`;
  el.pulseCovers.replaceChildren();
  songs.slice(0, 4).forEach((song) => {
    const image = coverImg(song, "");
    image.alt = "";
    image.loading = "eager";
    el.pulseCovers.appendChild(image);
  });
  el.pulseResultTitle.textContent = pulseMixTitle;
  el.pulseResultMeta.textContent = `${language} · ${energy.label} · ${songs.length} tracks`;
  el.pulseResultActions.hidden = false;
  el.pulseShare.hidden = false;
  el.pulseStage.classList.add("has-mix");
}

async function generatePulse({ scroll = false } = {}) {
  if (!el.pulseGenerate || el.pulseGenerate.disabled) return [];
  const prefs = pulsePreferences();
  const mood = PULSE_MOODS[prefs.moodKey];
  const energy = PULSE_ENERGY[prefs.energy];
  const language = prefs.language ? `${prefs.language} ` : "";
  const buttonLabel = el.pulseGenerate.querySelector("span");

  el.pulseGenerate.disabled = true;
  el.pulseCard?.classList.add("is-building");
  if (buttonLabel) buttonLabel.textContent = "Tuning your mix…";
  el.pulseStatus.textContent = `Listening for a ${mood.label.toLowerCase()} ${energy.label.toLowerCase()} pulse…`;

  try {
    const primaryQuery = `${language}${mood.query} ${energy.query}`.trim();
    const localPool = prefs.language
      ? (langSongsCache[prefs.language] || [])
      : [...trendSongs, ...Object.values(langSongsCache).flat()];
    const primaryRequest = searchSongs(primaryQuery, 25, API_TTL_LONG);
    let primary = localPool.length >= 8
      ? await Promise.race([primaryRequest, sleep(4500).then(() => [])])
      : await primaryRequest;
    let songs = diversifySongs(primary);
    if (songs.length < 8 && localPool.length) {
      const seen = new Set(songs.map((song) => song.id));
      songs = songs.concat(localPool.filter((song) => !seen.has(song.id)));
    }
    if (songs.length < 8) {
      const fallback = diversifySongs(await searchSongs(`${language}${mood.fallback}`.trim(), 25, API_TTL_LONG));
      const seen = new Set(songs.map((song) => song.id));
      songs = songs.concat(fallback.filter((song) => !seen.has(song.id)));
    }
    const familiar = [...recents, ...favs].filter((song) => {
      if (!prefs.language) return true;
      return (song.language || "").toLowerCase().includes(prefs.language);
    });
    if (familiar.length) {
      const seen = new Set(songs.map((song) => song.id));
      songs = familiar.slice(0, 3).filter((song) => !seen.has(song.id)).concat(songs);
    }
    songs = shufflePulse(diversifySongs(songs)).slice(0, 18);
    if (!songs.length) throw new Error("No playable Pulse tracks found");

    renderPulseMix(songs, prefs);
    saveJSON("ash_pulse", prefs);
    el.pulseStatus.textContent = `${pulseMixTitle} is ready. Press play or share it with someone.`;
    if (buttonLabel) buttonLabel.textContent = "Refresh my Pulse";
    if (scroll) el.pulseCard?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
    return songs;
  } catch (error) {
    console.error(error);
    el.pulseStatus.textContent = "Your Pulse could not connect right now. Try again in a moment.";
    toast("Couldn't build your Pulse right now");
    if (buttonLabel) buttonLabel.textContent = "Try again";
    return [];
  } finally {
    el.pulseGenerate.disabled = false;
    el.pulseCard?.classList.remove("is-building");
  }
}

function pulseShareUrl() {
  const prefs = pulsePreferences();
  const url = new URL(location.origin + location.pathname);
  url.searchParams.set("pulse", prefs.moodKey);
  if (prefs.language) url.searchParams.set("lang", prefs.language);
  url.searchParams.set("energy", String(prefs.energy));
  return url.toString();
}

async function sharePulse() {
  const mood = PULSE_MOODS[pulsePreferences().moodKey];
  const data = {
    title: `${mood.label} Pulse · Asharas`,
    text: `This is my ${mood.label} Pulse on Asharas. What does yours sound like?`,
    url: pulseShareUrl(),
  };
  if (navigator.share) {
    try { await navigator.share(data); }
    catch (error) { if (error?.name !== "AbortError") copyToClipboard(data.url, "Pulse link"); }
  } else {
    copyToClipboard(data.url, "Pulse link");
  }
}

// If the primary query returns nothing (e.g. a language-scoped query the
// API has no matches for), automatically retry with fallbackQuery.
async function runSearch(query, title, fallbackQuery) {
  el.listTitle.textContent = title;
  showView("list");
  el.results.innerHTML = '<div class="spinner"></div>';
  try {
    let songs = await searchSongs(query);
    if (!songs.length && fallbackQuery && fallbackQuery !== query) {
      songs = await searchSongs(fallbackQuery);
    }
    songs = diversifySongs(songs);
    lastQuery = query;
    if (!songs.length) {
      el.results.innerHTML = "";
      renderList([], title);
      toast("No playable songs found");
      return songs;
    }
    renderList(songs, title);
    return songs;
  } catch (err) {
    console.error(err);
    el.results.innerHTML = "";
    const note = document.createElement("p");
    note.className = "empty-note error";
    note.textContent = "Couldn't reach the music API right now. ";
    const retry = document.createElement("button");
    retry.className = "pill-btn ghost";
    retry.textContent = "↻ Retry";
    retry.addEventListener("click", () => runSearch(query, title, fallbackQuery));
    note.appendChild(retry);
    el.results.appendChild(note);
    return [];
  }
}

// Trending — seed with a few curated famous hits, then top up with a
// language-aware trending search. Famous picks are cached for 6 hours so
// page loads don't hammer the API (which rate-limits and empties the UI).
async function loadTrending() {
  try {
    // Curated seeds are individually cached for 6h by the API layer, and the
    // concurrency cap keeps first-load requests to a slow trickle.
    const picks = await Promise.allSettled(
      FAMOUS_HITS.slice(0, 8).map((q) => searchSongs(q, 2, API_TTL_LONG))
    );
    const famous = [];
    for (const p of picks) {
      const first = p.status === "fulfilled" ? p.value[0] : null;
      if (first && !famous.some((s) => s.id === first.id)) famous.push(first);
    }
    const seen = new Set(famous.map((s) => s.id));
    const songs = [...famous];
    const extra = await searchSongs(`${langPrefix()}trending latest hit songs 2026`, 20, API_TTL_LONG);
    for (const s of extra) if (!seen.has(s.id)) { seen.add(s.id); songs.push(s); }
    renderTrending(songs);
  } catch {
    el.trendingRow.innerHTML = '<p class="empty-note">Trending is unavailable right now.</p>';
  }
}

// Language-specific home sections
const LANG_SECTIONS = [
  { key: "telugu", rowEl: "teluguRow", label: "Telugu" },
  { key: "hindi", rowEl: "hindiRow", label: "Hindi" },
  { key: "english", rowEl: "englishRow", label: "English" },
  { key: "tamil", rowEl: "tamilRow", label: "Tamil" },
  { key: "kannada", rowEl: "kannadaRow", label: "Kannada" },
  { key: "malayalam", rowEl: "malayalamRow", label: "Malayalam" },
  { key: "punjabi", rowEl: "punjabiRow", label: "Punjabi" },
];

async function loadLangSection(key, rowEl, label) {
  try {
    const songs = await searchSongs(`${key} latest hit songs 2026`, 12, API_TTL_LONG);
    renderLangRow(rowEl, songs, key);
  } catch {
    rowEl.innerHTML = `<p class="empty-note">${label} hits unavailable right now.</p>`;
  }
}

async function loadAllLangSections() {
  // Sequential on purpose: firing all seven at once (on top of trending)
  // trips the API's rate limiting and every row comes back empty.
  for (const sec of LANG_SECTIONS) {
    await loadLangSection(sec.key, el[sec.rowEl], sec.label);
  }
}

// "See all" for each language section
document.querySelectorAll(".see-all-lang").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;
    const cached = langSongsCache[lang];
    const label = btn.closest(".row-head")?.querySelector(".section-head")?.textContent?.trim() || `${lang} Hits`;
    if (cached && cached.length) {
      renderList(cached, label);
      showView("list");
    } else {
      runSearch(`${lang} latest hit songs 2026`, label);
    }
  });
});

/* ---------- Synced lyrics (LRCLIB — free, no keys) ---------- */

const LYRICS_API = "https://lrclib.net/api";
let lyricsLines = [];     // [{ t: seconds, text }]
let lyricsSongId = null;  // song the panel currently shows
let lyricsActiveIdx = -1;
// Lyrics open with the immersive player on desktop and remain opt-in on mobile.
let lyricsOpen = false;

// Strip parentheticals like (From "Movie") that confuse lyrics lookup.
const cleanTitle = (t) =>
  t.replace(/\s*[\(\[][^\)\]]*[\)\]]/g, " ").replace(/\s+/g, " ").trim();

async function fetchLyrics(song) {
  const cacheKey = "ashlyr:" + song.id;
  try {
    const c = JSON.parse(localStorage.getItem(cacheKey));
    if (c && Date.now() - c.ts < 7 * 864e5) return c;
  } catch {}
  const artist = (song.artist || "").split(",")[0].trim();
  const title = cleanTitle(song.title);
  const urls = [
    `${LYRICS_API}/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}&duration=${song.duration || ""}`,
    `${LYRICS_API}/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`,
    `${LYRICS_API}/search?q=${encodeURIComponent(title)}`,
  ];
  for (const url of urls) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) continue;
      let data = await res.json();
      if (Array.isArray(data)) data = data.find((d) => d.syncedLyrics) || data[0];
      if (!data) continue;
      const out = { ts: Date.now(), synced: data.syncedLyrics || "", plain: data.plainLyrics || "" };
      if (out.synced || out.plain) {
        try { localStorage.setItem(cacheKey, JSON.stringify(out)); } catch {}
        return out;
      }
    } catch {}
  }
  return null;
}

// "[mm:ss.xx] line" → { t, text }, sorted; supports multiple stamps per line.
function parseLRC(lrc) {
  const lines = [];
  for (const raw of lrc.split("\n")) {
    const stamps = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
    if (!stamps.length) continue;
    const text = raw.replace(/\[[^\]]*\]/g, "").trim();
    if (!text) continue;
    for (const m of stamps) lines.push({ t: Number(m[1]) * 60 + parseFloat(m[2]), text });
  }
  return lines.sort((a, b) => a.t - b.t);
}

function renderLyrics(song, data) {
  el.lyricsMeta.textContent = `${song.title} — ${song.artist}`;
  el.lyricsBody.innerHTML = "";
  lyricsLines = [];
  lyricsActiveIdx = -1;
  if (!data || (!data.synced && !data.plain)) {
    el.lyricsBody.innerHTML = '<p class="empty-note">Lyrics not available for this song yet.</p>';
    return;
  }
  if (data.synced) {
    lyricsLines = parseLRC(data.synced);
    lyricsLines.forEach((l, i) => {
      const p = document.createElement("p");
      p.className = "lyric-line";
      p.textContent = l.text;
      p.dataset.i = i;
      p.title = "Jump here";
      p.addEventListener("click", () => { el.audio.currentTime = l.t; });
      el.lyricsBody.appendChild(p);
    });
  }
  if (!lyricsLines.length && data.plain) {
    const note = document.createElement("p");
    note.className = "empty-note";
    note.textContent = "Synced lyrics unavailable — showing full text.";
    el.lyricsBody.appendChild(note);
    data.plain.split("\n").forEach((t) => {
      const p = document.createElement("p");
      p.className = "lyric-line static";
      p.textContent = t || " ";
      el.lyricsBody.appendChild(p);
    });
  }
}

async function loadLyricsFor(song) {
  if (!song) return;
  lyricsSongId = song.id;
  el.lyricsMeta.textContent = `${song.title} — ${song.artist}`;
  el.lyricsBody.innerHTML = '<div class="spinner"></div>';
  const data = await fetchLyrics(song);
  if (lyricsSongId !== song.id) return; // another song started meanwhile
  renderLyrics(song, data);
}

// Highlight the line matching the playback position and keep it centred.
function syncLyrics(cur) {
  if (!lyricsOpen || !lyricsLines.length) return;
  let i = lyricsLines.length - 1;
  for (let k = 0; k < lyricsLines.length; k++) {
    if (lyricsLines[k].t > cur + 0.2) { i = k - 1; break; }
  }
  if (i === lyricsActiveIdx || i < 0) return;
  lyricsActiveIdx = i;
  el.lyricsBody.querySelectorAll(".lyric-line.active").forEach((n) => n.classList.remove("active"));
  const node = el.lyricsBody.querySelector(`.lyric-line[data-i="${i}"]`);
  if (node) {
    node.classList.add("active");
    el.lyricsBody.scrollTo({
      top: node.offsetTop - el.lyricsBody.clientHeight / 2 + node.clientHeight / 2,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }
}

function setLyricsOpen(open) {
  lyricsOpen = open;
  saveJSON("ash_lyrics_open", open);
  el.lyricsPanel.hidden = !open;
  el.btnLyrics.classList.toggle("lit", open);
  const npLyricsToggle = document.getElementById("np-lyrics-toggle");
  npLyricsToggle?.classList.toggle("active", open);
  npLyricsToggle?.setAttribute("aria-pressed", open ? "true" : "false");
  document.body.classList.toggle("lyrics-visible", open);
  const song = queue[currentIndex];
  if (open && song && song.id !== lyricsSongId) loadLyricsFor(song);
}

el.btnLyrics.addEventListener("click", () => setLyricsOpen(!lyricsOpen));
el.lyricsClose.addEventListener("click", () => setLyricsOpen(false));
el.lyricsTranslate?.addEventListener("click", () => {
  const song = queue[currentIndex];
  toast(song?.language ? `Lyrics shown in ${song.language}` : "Lyrics shown in the original language");
});
el.lyricsFocus?.addEventListener("click", () => {
  const focused = document.body.classList.toggle("lyrics-focus-mode");
  el.lyricsFocus.setAttribute("aria-pressed", focused ? "true" : "false");
  toast(focused ? "Focus mode on" : "Focus mode off");
});

/* ---------- Playlist dialog ---------- */

function openAddDialog(song) {
  dialogSong = song;
  el.plList.innerHTML = "";
  if (!playlists.length) {
    const p = document.createElement("p");
    p.className = "empty-note";
    p.textContent = "No playlists yet — create one below.";
    el.plList.appendChild(p);
  }
  playlists.forEach((pl) => {
    const b = document.createElement("button");
    b.className = "pl-option";
    b.textContent = `${pl.name} (${pl.songs.length})`;
    b.addEventListener("click", () => {
      addToPlaylist(pl, dialogSong);
      el.plDialog.close();
    });
    el.plList.appendChild(b);
  });
  el.plNewName.value = "";
  showModalFrom(el.plDialog);
}

function addToPlaylist(pl, song) {
  if (pl.songs.some((s) => s.id === song.id)) { toast(`Already in "${pl.name}"`); return; }
  pl.songs.push(song);
  saveJSON("ash_playlists", playlists);
  toast(`Added to "${pl.name}"`);
}

/* ---------- Events ---------- */

// Navigation
el.navBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    const nav = btn.dataset.nav;
    if (nav === "home") showView("home");
    else if (nav === "search") {
      showView("home");
      if (el.contentTitle) el.contentTitle.textContent = "Search";
      el.navBtns.forEach((item) => {
        item.classList.toggle("active", item === btn);
        if (item === btn) item.setAttribute("aria-current", "page");
        else item.removeAttribute("aria-current");
      });
      el.input.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    else if (nav === "favorites") { activeMoodQuery = null; activeMoodLabel = null; activeSearchQuery = null; renderList(favs, "Favorites"); showView("list"); }
    else if (nav === "queue") { renderQueue(); showView("queue"); }
    else if (nav === "playlists") { activeMoodQuery = null; activeMoodLabel = null; activeSearchQuery = null; renderPlaylists(); showView("playlists"); }
  })
);
el.backHome.addEventListener("click", () => showView("home"));
el.backHome2.addEventListener("click", () => showView("home"));
el.backHome3.addEventListener("click", () => showView("home"));

function librarySongs() {
  const all = [...recents, ...favs, ...playlists.flatMap((playlist) => playlist.songs || [])];
  return [...new Map(all.filter(Boolean).map((song) => [song.id, song])).values()];
}

function activateCustomNav(button) {
  document.querySelectorAll(".nav-btn").forEach((item) => {
    const active = item === button;
    item.classList.toggle("active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
}

function renderArtistsDirectory() {
  listSongs = [];
  el.listTitle.textContent = "Artists";
  if (el.contentTitle) el.contentTitle.textContent = "Artists";
  el.results.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "artist-grid";
  const loadPortrait = async (card, artist) => {
    if (card.dataset.portraitLoaded) return;
    card.dataset.portraitLoaded = "true";
    const image = card.querySelector("img");
    const profile = await artistProfile(artist);
    if (!image || !profile?.image || !card.isConnected) return;
    image.addEventListener("load", () => card.classList.add("has-portrait"), { once: true });
    image.addEventListener("error", () => image.remove(), { once: true });
    image.src = profile.image;
  };

  const portraitObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          loadPortrait(entry.target, entry.target.dataset.artist);
        });
      }, { rootMargin: "320px 0px" })
    : null;

  FAMOUS_ARTISTS.forEach((artist, index) => {
    const card = document.createElement("button");
    card.className = "artist-card";
    card.style.animationDelay = `${Math.min(index * 32, 240)}ms`;
    card.type = "button";
    card.dataset.artist = artist;
    card.innerHTML = '<span class="artist-card-art" aria-hidden="true"><img alt="" width="112" height="112" loading="lazy" decoding="async"></span><span class="artist-card-copy"><strong></strong><small>Popular songs</small></span><span class="artist-card-arrow" aria-hidden="true">›</span>';
    card.querySelector("strong").textContent = artist;
    card.setAttribute("aria-label", `Open top songs by ${artist}`);
    card.addEventListener("click", async () => {
      card.classList.add("is-loading");
      await runSearch(`${artist} top songs`, `${artist} · Top songs`);
      activateCustomNav(el.sideArtists);
    });
    grid.appendChild(card);
    if (portraitObserver) portraitObserver.observe(card);
    else loadPortrait(card, artist);
  });
  el.results.appendChild(grid);
}

el.sideNew?.addEventListener("click", async () => {
  await runSearch(`${el.langSelect.value || "global"} new music 2026`, "New");
  activateCustomNav(el.sideNew);
});
el.sideRecents?.addEventListener("click", () => {
  activateCustomNav(el.sideRecents);
  renderList(recents, "Recently Added");
  showView("list");
  activateCustomNav(el.sideRecents);
});
el.sideArtists?.addEventListener("click", async () => {
  activateCustomNav(el.sideArtists);
  renderArtistsDirectory();
  showView("list");
});
el.sideAlbums?.addEventListener("click", () => {
  const songs = librarySongs().sort((a, b) => (a.album || "").localeCompare(b.album || ""));
  renderList(songs, "Albums");
  showView("list");
  activateCustomNav(el.sideAlbums);
});
el.sideSongs?.addEventListener("click", () => {
  renderList(librarySongs(), "Songs");
  showView("list");
  activateCustomNav(el.sideSongs);
});
el.mobileRecents?.addEventListener("click", () => {
  renderList(recents, "Recently Added");
  showView("list");
  activateCustomNav(document.querySelector('[data-nav="playlists"]'));
});
el.mobileFavorites?.addEventListener("click", () => {
  renderList(favs, "Favourite Songs");
  showView("list");
  activateCustomNav(document.querySelector('[data-nav="playlists"]'));
});
el.mobileSongs?.addEventListener("click", () => {
  renderList(librarySongs(), "Songs");
  showView("list");
  activateCustomNav(document.querySelector('[data-nav="playlists"]'));
});
el.accountButton?.addEventListener("click", () => {
  showView("home");
  requestAnimationFrame(() => document.querySelector(".creator-section")?.scrollIntoView({ behavior: "smooth", block: "center" }));
});
el.sidebarNowPlaying?.addEventListener("click", openNowPlaying);

// Search matrix — mode shapes the query. Song/Artist search exactly what was
// typed (a forced language prefix often returns nothing); the Language pill
// explicitly scopes the query to the selected language.
function buildSearchQuery(raw, mode) {
  const lang = el.langSelect.value;
  if (mode === "language") return `${lang} ${raw}`.trim();
  if (mode === "artist") return `${raw} songs`;
  return raw;
}

el.form.addEventListener("submit", (e) => {
  e.preventDefault();
  hideReco();
  const query = el.input.value.trim();
  if (!query) return;
  activeMoodQuery = null;
  activeMoodLabel = null;
  activeSearchQuery = query; // remember it so a language change can re-filter
  const modeLabel = { song: "Songs", artist: "Artist", language: el.langSelect.value || "Language" }[searchMode];
  runSearch(buildSearchQuery(query, searchMode), `${modeLabel} · "${query}"`);
});

function updateSearchFilter() {
  const selected = el.searchModeSelect?.value || "song";
  const [mode, language = ""] = selected.split(":");
  searchMode = mode;
  if (mode === "language") el.langSelect.value = language;

  const languageLabel = language ? language.charAt(0).toUpperCase() + language.slice(1) : "";
  const label = mode === "artist" ? "artists" : mode === "language" ? `${languageLabel} songs` : "songs, artists, albums";
  el.input.placeholder = `Search ${label}…`;
  if (el.input.value.trim()) updateReco();
}

el.searchModeSelect?.addEventListener("change", updateSearchFilter);
updateSearchFilter();

// Autocomplete "recommended searches"
let recoTimer = 0, recoSeq = 0;
function hideReco() { el.reco.hidden = true; el.input.setAttribute("aria-expanded", "false"); }

async function updateReco() {
  const raw = el.input.value.trim();
  if (raw.length < 2) return hideReco();
  const seq = ++recoSeq;
  try {
    const songs = await searchSongs(buildSearchQuery(raw, searchMode), 8);
    if (seq !== recoSeq) return;
    if (!songs.length) return hideReco();
    el.reco.innerHTML = "";
    const seen = new Set();
    songs.slice(0, 8).forEach((song) => {
      const key = searchMode === "artist" ? song.artist : song.title;
      if (seen.has(key)) return;
      seen.add(key);
      const item = document.createElement("button");
      item.type = "button";
      item.className = "reco-item";
      item.innerHTML = `<img src="${song.cover || COVER_FALLBACK}" alt="" loading="lazy" />
        <span class="reco-text"><span class="reco-title"></span><span class="reco-by"></span></span>`;
      item.querySelector(".reco-title").textContent = key;
      item.querySelector(".reco-by").textContent = searchMode === "artist" ? "Artist" : song.artist;
      item.addEventListener("click", () => {
        el.input.value = key;
        hideReco();
        el.form.requestSubmit();
      });
      el.reco.appendChild(item);
    });
    el.reco.hidden = false;
    el.input.setAttribute("aria-expanded", "true");
  } catch { hideReco(); }
}

el.input.addEventListener("input", () => { clearTimeout(recoTimer); recoTimer = setTimeout(updateReco, 250); });
el.input.addEventListener("blur", () => setTimeout(hideReco, 150));
document.addEventListener("click", (e) => { if (!el.searchWrap.contains(e.target)) hideReco(); });

// Moods
el.moodGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".mood-card");
  if (!card) return;
  const label = [...card.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join("")
    .trim();
  activeMoodQuery = card.dataset.q;
  activeMoodLabel = label;
  activeSearchQuery = null;
  runMood(card.dataset.q, label);
});

// Pulse preferences are private and persist only in this browser.
const savedPulse = loadJSON("ash_pulse", {});
if (el.pulseMood && PULSE_MOODS[savedPulse.moodKey]) el.pulseMood.value = savedPulse.moodKey;
if (el.pulseLanguage && [...el.pulseLanguage.options].some((option) => option.value === savedPulse.language)) {
  el.pulseLanguage.value = savedPulse.language;
}
if (el.pulseEnergy && [1, 2, 3].includes(Number(savedPulse.energy))) el.pulseEnergy.value = String(savedPulse.energy);
updatePulseEnergy();

el.pulseMood?.addEventListener("change", resetPulsePreview);
el.pulseLanguage?.addEventListener("change", resetPulsePreview);
el.pulseEnergy?.addEventListener("input", () => {
  updatePulseEnergy();
  resetPulsePreview();
});
el.pulseGenerate?.addEventListener("click", () => generatePulse());
el.pulseShare?.addEventListener("click", sharePulse);
el.pulsePlay?.addEventListener("click", () => {
  if (!pulseSongs.length) return;
  queue = [...pulseSongs];
  playNextQueue = [];
  currentIndex = -1;
  playIndex(0);
  toast(`${pulseMixTitle} is playing`);
});
el.pulseOpen?.addEventListener("click", () => {
  if (!pulseSongs.length) return;
  renderList(pulseSongs, pulseMixTitle);
  showView("list");
});

// Language — re-filter the open mood OR text search, and reload home sections
el.langSelect.addEventListener("change", () => {
  saveJSON("ash_lang", el.langSelect.value);
  loadTrending();
  loadAllLangSections();
  const langLabel = el.langSelect.value || "All languages";
  if (activeMoodQuery) {
    runMood(activeMoodQuery, activeMoodLabel);
  } else if (activeSearchQuery) {
    // Re-run the last search scoped to the new language; fall back to the raw
    // query if the language-scoped one has no matches, so it never goes empty.
    runSearch(
      `${langPrefix()}${activeSearchQuery}`.trim(),
      `${activeSearchQuery} · ${langLabel}`,
      activeSearchQuery
    );
  }
});

// Trending
el.seeAll.addEventListener("click", () => {
  renderList(trendSongs, "Trending now");
  showView("list");
});

// Listen Together — open choice modal
el.listenTogether.addEventListener("click", (event) => showModalFrom(el.ltDialog, event.currentTarget));

// Choice: Host
el.ltHost.addEventListener("click", () => {
  el.ltDialog.close();
  if (startSession(true)) showModalFrom(el.ltHostDialog, el.listenTogether);
});

// Choice: Join
el.ltJoin.addEventListener("click", () => {
  el.ltDialog.close();
  el.ltCodeInput.value = "";
  showModalFrom(el.ltJoinDialog, el.listenTogether);
  requestAnimationFrame(() => el.ltCodeInput.focus({ preventScroll: true }));
});

// Cancel choice dialog
el.ltCancel.addEventListener("click", () => el.ltDialog.close());

// Host dialog — Copy Code
el.ltCopyCode.addEventListener("click", () => copyToClipboard(sessionCode, "Code"));

// Host dialog — Copy Link
el.ltCopyLink.addEventListener("click", () => copyToClipboard(sessionUrl(), "Link"));

// Host dialog — Transfer Host
el.ltTransferHost.addEventListener("click", () => {
  updateParticipantsUI();
  el.ltHostDialog.close();
  showModalFrom(el.ltTransferDialog, el.ltTransferHost);
});

// Host dialog — Leave
el.ltLeave.addEventListener("click", () => {
  el.ltHostDialog.close();
  endSession();
});

// Host dialog — Close
el.ltHostClose.addEventListener("click", () => el.ltHostDialog.close());

// Join dialog — Join button
el.ltJoinBtn.addEventListener("click", () => {
  const code = el.ltCodeInput.value.trim();
  if (!/^\d{4}$/.test(code)) return toast("Enter a valid 4-digit code");
  el.ltJoinDialog.close();
  startSession(false, code);
});

// Join dialog — Enter key
el.ltCodeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); el.ltJoinBtn.click(); }
});

// Join dialog — Cancel
el.ltJoinCancel.addEventListener("click", () => el.ltJoinDialog.close());

// Transfer dialog — Cancel
el.ltTransferCancel.addEventListener("click", () => {
  el.ltTransferDialog.close();
  if (sessionCode) showModalFrom(el.ltHostDialog, el.ltBarTransfer);
});

// Session bar — Copy Code
el.ltBarCopyCode.addEventListener("click", () => copyToClipboard(sessionCode, "Code"));

// Session bar — Copy Link
el.ltBarCopyLink.addEventListener("click", () => copyToClipboard(sessionUrl(), "Link"));

// Session bar — Transfer Host
el.ltBarTransfer.addEventListener("click", () => {
  updateParticipantsUI();
  showModalFrom(el.ltTransferDialog, el.ltBarTransfer);
});

// Session bar — Leave
el.ltBarLeave.addEventListener("click", () => endSession());

// Close any open Listen Together dialog on backdrop click
document.querySelectorAll(".lt-dialog").forEach((dlg) => {
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });
});

// Player controls
el.btnPlay.addEventListener("click", togglePlay);
el.btnNext.addEventListener("click", playNext);
el.btnPrev.addEventListener("click", playPrev);

el.btnShuffle.addEventListener("click", () => {
  shuffleOn = !shuffleOn;
  el.btnShuffle.classList.toggle("lit", shuffleOn);
  toast(shuffleOn ? "Shuffle on" : "Shuffle off");
});

el.btnRepeat.addEventListener("click", () => {
  repeatMode = repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off";
  el.btnRepeat.classList.toggle("lit", repeatMode !== "off");
  el.btnRepeat.classList.toggle("one", repeatMode === "one");
  toast(`Repeat: ${repeatMode}`);
});

el.btnFav.addEventListener("click", () => {
  const song = queue[currentIndex];
  if (song) toggleFav(song);
});

el.btnDownload.addEventListener("click", async () => {
  const song = queue[currentIndex];
  if (!song) return;
  toast("Downloading…");
  try {
    const res = await fetch(song.streamUrl);
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${song.title} - ${song.artist}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast("Downloaded: " + song.title + " ✓");
  } catch (err) {
    console.error("Download error:", err);
    toast("Download failed — try again");
  }
});

el.btnDim.addEventListener("click", () => {
  const on = document.documentElement.classList.toggle("dim");
  saveJSON("ash_dim", on);
});

// Queue toggle button in player bar
el.btnQueue.addEventListener("click", () => {
  renderQueue();
  showView("queue");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Clear queue
el.clearQueue.addEventListener("click", () => {
  playNextQueue = [];
  renderQueue();
  toast("Queue cleared");
});

// Playlist creation (playlists view + dialog)
function createPlaylist(name) {
  name = name.trim();
  if (!name) return null;
  const pl = { name, songs: [] };
  playlists.push(pl);
  saveJSON("ash_playlists", playlists);
  return pl;
}
el.plMake.addEventListener("click", () => {
  if (createPlaylist(el.plMakeName.value)) {
    el.plMakeName.value = "";
    renderPlaylists();
    toast("Playlist created");
  }
});
el.plCreate.addEventListener("click", () => {
  const pl = createPlaylist(el.plNewName.value);
  if (pl && dialogSong) { addToPlaylist(pl, dialogSong); el.plDialog.close(); }
});
el.plClose.addEventListener("click", () => el.plDialog.close());

// Audio element
el.audio.addEventListener("play", () => {
  el.player.classList.add("playing");
  markActive();
  broadcastHostEvent({ type: "play" });
});
el.audio.addEventListener("pause", () => {
  el.player.classList.remove("playing");
  markActive();
  broadcastHostEvent({ type: "pause" });
});
el.audio.addEventListener("playing", () => { errorStreak = 0; });
el.audio.addEventListener("ended", onEnded);
el.audio.addEventListener("error", () => {
  if (currentIndex === -1) return;
  errorStreak++;
  if (errorStreak >= queue.length) { toast("None of these tracks could be streamed"); return; }
  toast("Track failed to load — skipping");
  playNext();
});

el.audio.addEventListener("loadedmetadata", () => {
  el.timeTotal.textContent = formatTime(el.audio.duration);
  el.seek.max = el.audio.duration || 0;
});

el.audio.addEventListener("timeupdate", () => {
  syncLyrics(el.audio.currentTime);
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
  broadcastHostEvent({ type: "seek", time: el.audio.currentTime });
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

// Keyboard shortcuts (skipped while typing)
document.addEventListener("keydown", (e) => {
  const t = document.activeElement;
  if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA")) return;
  if (e.code === "Space") { e.preventDefault(); togglePlay(); }
  else if (e.key === "n" || e.key === "N") playNext();
  else if (e.key === "p" || e.key === "P") playPrev();
  else if (e.key === "ArrowRight") el.audio.currentTime = Math.min(el.audio.currentTime + 5, el.audio.duration || 0);
  else if (e.key === "ArrowLeft") el.audio.currentTime = Math.max(el.audio.currentTime - 5, 0);
});

/* ---------- 3D tilt (desktop pointers only) ---------- */

// The light redesign uses restrained scale/position feedback, not ornamental 3D tilt.
const canTilt = false;

// Tilts an element toward the cursor by driving the --rx/--ry CSS vars
// its transform reads from. maxDeg caps the rotation at the edges.
function attachTilt(container, selector, maxDeg) {
  let raf = 0;
  container.addEventListener("pointermove", (e) => {
    const target = selector ? e.target.closest(selector) : container;
    if (!target || raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const r = target.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      target.style.setProperty("--ry", `${(px * maxDeg).toFixed(2)}deg`);
      target.style.setProperty("--rx", `${(-py * maxDeg).toFixed(2)}deg`);
    });
  });
  container.addEventListener(
    "pointerout",
    (e) => {
      const target = selector ? e.target.closest(selector) : container;
      if (!target) return;
      target.style.setProperty("--rx", "0deg");
      target.style.setProperty("--ry", "0deg");
    },
    true
  );
}

if (canTilt) {
  attachTilt(el.results, ".track", 5);
  attachTilt(el.moodGrid, ".mood-card", 10);
  attachTilt(el.trendingRow, ".trend-card", 8);
  document.querySelectorAll(".trend-row").forEach((row) => {
    attachTilt(row, ".trend-card", 8);
  });
  attachTilt(document.querySelector(".cover-wrap"), null, 14);

}

/* ---------- Particle-field background (cursor-reactive 3D swarm) ----------
   A few hundred tiny dashes ride a swooping bezier arc across the viewport
   with real depth: near particles are larger, brighter and parallax more.
   The whole field eases toward the cursor; particles slide away from it.
   Colors follow the active theme. Transform-free canvas, DPR-capped,
   disabled entirely under prefers-reduced-motion. */
(() => {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  if (getComputedStyle(canvas).display === "none") return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0, particles = [];
  let colors = ["#4d9fff", "#5ce6c3", "#ffffff"];

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    colors = [
      cs.getPropertyValue("--accent").trim() || "#4d9fff",
      cs.getPropertyValue("--accent-2").trim() || "#5ce6c3",
      "#ffffff",
    ];
  }
  readColors();
  new MutationObserver(readColors)
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });

  // Sweeping cubic bezier from lower-left to upper-right of the viewport
  function bez(t) {
    const p0x = -0.1 * W, p0y = 0.95 * H, p1x = 0.25 * W, p1y = 0.1 * H;
    const p2x = 0.7 * W, p2y = 0.95 * H, p3x = 1.12 * W, p3y = 0.2 * H;
    const u = 1 - t;
    return {
      x: u * u * u * p0x + 3 * u * u * t * p1x + 3 * u * t * t * p2x + t * t * t * p3x,
      y: u * u * u * p0y + 3 * u * u * t * p1y + 3 * u * t * t * p2y + t * t * t * p3y,
    };
  }
  function bezDir(t) {
    const e = 0.004, a = bez(Math.max(0, t - e)), b = bez(Math.min(1, t + e));
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    return { x: dx / l, y: dy / l };
  }
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

  function build() {
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.lineCap = "round";
    const count = reduced ? 0 : Math.min(Math.floor((W * H) / 2400), 850);
    particles = [];
    for (let i = 0; i < count; i++) {
      const onArc = Math.random() < 0.78;
      particles.push({
        onArc,
        t: Math.random(),
        off: gauss() * (0.06 + 0.2 * Math.random()) * Math.min(W, H), // spread from the arc spine
        sx: Math.random() * W, sy: Math.random() * H,                 // scatter home
        z: Math.random() * 2 - 1,                                     // depth: −1 near … 1 far
        drift: 0.000018 + Math.random() * 0.00006,
        len: 2.5 + Math.random() * 6,
        w: 0.7 + Math.random() * 1.5,
        ci: (Math.random() * 3) | 0,
        ph: Math.random() * Math.PI * 2,
      });
    }
    window.__bgParticleCount = particles.length;
  }

  let mx = 0.5, my = 0.5, px = 0.5, py = 0.5;
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced) {
    window.addEventListener("pointermove", (e) => {
      mx = e.clientX / W; my = e.clientY / H;
    }, { passive: true });
  }

  let last = 0;
  function frame(now) {
    const dt = Math.min(now - last, 50) || 16;
    last = now;
    px += (mx - px) * 0.045; // buttery ease toward the cursor
    py += (my - py) * 0.045;
    ctx.clearRect(0, 0, W, H);
    const ox = px - 0.5, oy = py - 0.5;
    const curX = px * W, curY = py * H;

    for (const p of particles) {
      p.ph += 0.0007 * dt;
      let x, y, dir;
      if (p.onArc) {
        p.t += p.drift * dt;
        if (p.t > 1) p.t -= 1;
        const b = bez(p.t);
        dir = bezDir(p.t);
        const wobble = Math.sin(p.ph) * 6;
        x = b.x + -dir.y * (p.off + wobble);
        y = b.y + dir.x * (p.off + wobble);
      } else {
        x = p.sx + Math.sin(p.ph) * 8;
        y = p.sy + Math.cos(p.ph * 0.8) * 6;
        dir = { x: Math.cos(p.ph * 0.3), y: Math.sin(p.ph * 0.3) };
      }

      // depth parallax: near particles (z=−1) shift up to ~2× more
      const par = 1 - p.z;
      x += ox * 52 * par;
      y += oy * 34 * par;

      // gentle repulsion around the cursor
      const dx = x - curX, dy = y - curY;
      const d2 = dx * dx + dy * dy;
      if (d2 < 19600 && d2 > 1) { // within 140px
        const d = Math.sqrt(d2);
        const push = (1 - d / 140) * 26;
        x += (dx / d) * push;
        y += (dy / d) * push;
      }

      const s = 0.55 + par * 0.45;
      ctx.globalAlpha = (0.14 + 0.3 * par) * (0.75 + 0.25 * Math.sin(p.ph * 1.7));
      ctx.strokeStyle = colors[p.ci];
      ctx.lineWidth = p.w * s;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dir.x * p.len * s, y + dir.y * p.len * s);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });

  build();
  if (!reduced && particles.length) requestAnimationFrame(frame);
})();

/* ---------- Boot ---------- */

// Safety net: an unexpected async failure logs quietly instead of surfacing
// as a broken page; at most one toast per 10s so users aren't spammed.
let lastErrToast = 0;
window.addEventListener("unhandledrejection", (e) => {
  console.warn("Recovered from async error:", e.reason);
  e.preventDefault();
  const now = Date.now();
  if (now - lastErrToast > 10000) { lastErrToast = now; toast("Something hiccuped — retrying usually fixes it"); }
});

el.audio.volume = Number(el.volume.value);
paintRange(el.volume);
paintRange(el.seek);
renderRecents();
loadTrending();
loadAllLangSections();

// Deep links: ?session=<CODE> auto-joins a session; ?q=&song= shares a song
(async () => {
  const params = new URLSearchParams(location.search);
  const session = (params.get("session") || "").trim();
  if (/^\d{4}$/.test(session)) {
    startSession(false, session);
  }

  const pulse = params.get("pulse");
  if (PULSE_MOODS[pulse]) {
    const sharedLanguage = params.get("lang") || "";
    const sharedEnergy = Number(params.get("energy"));
    el.pulseMood.value = pulse;
    if ([...el.pulseLanguage.options].some((option) => option.value === sharedLanguage)) {
      el.pulseLanguage.value = sharedLanguage;
    }
    if ([1, 2, 3].includes(sharedEnergy)) el.pulseEnergy.value = String(sharedEnergy);
    updatePulseEnergy();
    showView("home");
    await generatePulse({ scroll: true });
  }

  const q = params.get("q");
  if (!q) return;
  const songs = await runSearch(q, `Shared · "${q}"`);
  const id = params.get("song");
  const i = songs.findIndex((s) => s.id === id);
  if (i !== -1) { queue = songs; playIndex(i); }
})();

/* ---------- PWA: install experience + offline shell ---------- */
const installUi = {
  android: document.getElementById("install-android"),
  ios: document.getElementById("install-ios"),
  status: document.getElementById("install-status"),
  dialog: document.getElementById("install-dialog"),
  kicker: document.getElementById("install-dialog-kicker"),
  title: document.getElementById("install-dialog-title"),
  steps: document.getElementById("install-steps"),
  close: document.getElementById("install-dialog-close"),
  done: document.getElementById("install-dialog-done"),
};
let deferredInstallPrompt = null;

const appIsInstalled = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

function setInstallStatus(message) {
  if (installUi.status) installUi.status.textContent = message;
}

function showInstallHelp(platform) {
  if (!installUi.dialog || !installUi.steps) return;
  const ios = platform === "ios";
  installUi.kicker.textContent = ios ? "iPhone & iPad" : "Android";
  installUi.title.textContent = ios ? "Add Asharas to your Home Screen" : "Install Asharas from your browser";
  const instructions = ios
    ? ["Open Asharas in Safari.", "Tap the Share button in Safari’s toolbar.", "Choose Add to Home Screen, then tap Add."]
    : ["Open Asharas in Chrome.", "Tap the browser menu (⋮).", "Choose Install app or Add to Home screen, then confirm."];
  installUi.steps.replaceChildren(...instructions.map((instruction) => {
    const item = document.createElement("li");
    item.textContent = instruction;
    return item;
  }));
  if (typeof installUi.dialog.showModal === "function") installUi.dialog.showModal();
  else installUi.dialog.setAttribute("open", "");
}

function closeInstallHelp() {
  if (!installUi.dialog) return;
  if (typeof installUi.dialog.close === "function") installUi.dialog.close();
  else installUi.dialog.removeAttribute("open");
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  setInstallStatus("Ready to install on this device.");
});

installUi.android?.addEventListener("click", async () => {
  if (appIsInstalled()) { setInstallStatus("Asharas is already installed on this device."); return; }
  if (!deferredInstallPrompt) { showInstallHelp("android"); return; }
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  setInstallStatus(outcome === "accepted" ? "Asharas is being installed." : "Installation cancelled—you can try again anytime.");
});
installUi.ios?.addEventListener("click", () => {
  if (appIsInstalled()) { setInstallStatus("Asharas is already installed on this device."); return; }
  showInstallHelp("ios");
});
installUi.close?.addEventListener("click", closeInstallHelp);
installUi.done?.addEventListener("click", closeInstallHelp);
installUi.dialog?.addEventListener("click", (event) => {
  if (event.target === installUi.dialog) closeInstallHelp();
});
window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  setInstallStatus("Asharas was installed successfully.");
});
if (appIsInstalled()) setInstallStatus("Asharas is installed on this device.");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

/* ---------- Mobile Now Playing (3D coverflow, Apple glass) ---------- */
const np = {
  root: document.getElementById("now-playing"),
  backdrop: document.getElementById("np-backdrop"),
  flow: document.getElementById("np-flow"),
  title: document.getElementById("np-title"),
  artist: document.getElementById("np-artist"),
  cur: document.getElementById("np-cur"),
  tot: document.getElementById("np-tot"),
  seek: document.getElementById("np-seek"),
  play: document.getElementById("np-play"),
  prev: document.getElementById("np-prev"),
  next: document.getElementById("np-next"),
  shuffle: document.getElementById("np-shuffle"),
  repeat: document.getElementById("np-repeat"),
  volume: document.getElementById("np-volume"),
  fav: document.getElementById("np-fav"),
  more: document.getElementById("np-more"),
  lyricsToggle: document.getElementById("np-lyrics-toggle"),
  outputToggle: document.getElementById("np-output-toggle"),
  queueToggle: document.getElementById("np-queue-toggle"),
  close: document.getElementById("np-close"),
};
const NP_RANGE = 3;
const npCards = new Map(); // song id -> card element (kept stable so covers glide)
const npMobile = () => matchMedia("(max-width: 900px)").matches;
let npSeeking = false;
let npOffset = 0;
let npOffsetAnimation = null;
let npSheetY = 0;
let npSheetAnimation = null;
let npSuppressClickUntil = 0;
let npPreviousFocus = null;
let npOpenedLyrics = false;

function npList() {
  const cur = queue[currentIndex];
  if (queue.length && cur) return { list: queue, idx: currentIndex };
  if (cur) return { list: [cur], idx: 0 };
  return { list: [], idx: -1 };
}

function npCardSpacing() {
  const center = [...npCards.values()].find((card) => card._d === 0);
  return Math.max(112, (center?.offsetWidth || 260) * 0.46);
}

function npPlaceCard(card, d, offset = npOffset) {
  const effectiveD = d + offset / npCardSpacing();
  const abs = Math.abs(effectiveD);
  const tx = -50 + effectiveD * 46;
  const ry = Math.max(-40, Math.min(40, -effectiveD * 35));
  const sc = abs < 0.01 ? 1 : Math.max(0.66, 0.85 - Math.max(0, abs - 1) * 0.08);
  const tz = abs < 0.01 ? 0 : -50 - Math.max(0, abs - 1) * 45;
  card.style.transform = `translate(${tx}%, -50%) translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`;
  card.style.zIndex = String(50 - abs);
  card.style.opacity = abs > NP_RANGE ? "0" : "1";
}

function npRenderPositions() {
  npCards.forEach((card) => npPlaceCard(card, card._d));
}

function npSettle(offset, velocity = 0, momentum = false) {
  npOffsetAnimation?.();
  npOffset = offset;
  npOffsetAnimation = springValue({
    from: offset,
    to: 0,
    velocity,
    response: 0.34,
    damping: momentum ? 0.82 : 1,
    update(value) {
      npOffset = value;
      npRenderPositions();
    },
    complete() {
      npOffset = 0;
      npOffsetAnimation = null;
      npRenderPositions();
    },
  });
}

function buildNPFlow() {
  const { list, idx } = npList();
  if (idx < 0) { np.flow.innerHTML = ""; npCards.clear(); return; }
  const needed = new Map();
  for (let d = -NP_RANGE; d <= NP_RANGE; d++) {
    const i = idx + d;
    if (i >= 0 && i < list.length) needed.set(list[i].id, { d, song: list[i], i, list });
  }
  for (const [id, card] of npCards) if (!needed.has(id)) { card.remove(); npCards.delete(id); }
  for (const [id, info] of needed) {
    let card = npCards.get(id);
    if (!card) {
      card = document.createElement("button");
      card.type = "button";
      card.className = "np-card";
      const img = document.createElement("img");
      img.src = info.song.cover || COVER_FALLBACK;
      img.alt = "";
      img.onerror = () => { img.onerror = null; img.src = COVER_FALLBACK; };
      card.appendChild(img);
      card.addEventListener("click", () => {
        if (performance.now() < npSuppressClickUntil) return;
        if (card._d === 0) el.btnPlay.click();
        else { queue = card._list; playIndex(card._i); }
      });
      np.flow.appendChild(card);
      npCards.set(id, card);
    }
    card._d = info.d; card._i = info.i; card._list = info.list;
    card.setAttribute("aria-label", info.d === 0
      ? `${info.song.title} by ${info.song.artist}. Play or pause.`
      : `Play ${info.song.title} by ${info.song.artist}`);
    card.tabIndex = Math.abs(info.d) <= 1 ? 0 : -1;
    card.classList.toggle("center", info.d === 0);
    npPlaceCard(card, info.d, npOffset);
  }
  npRenderPositions();
}

function npSyncPlayState() {
  np.root.classList.toggle("playing", !el.audio.paused);
  np.shuffle.classList.toggle("lit", shuffleOn);
  np.repeat.classList.toggle("lit", repeatMode !== "off");
}
function npSyncSeek() {
  if (npSeeking) return;
  np.cur.textContent = formatTime(el.audio.currentTime);
  np.tot.textContent = formatTime(el.audio.duration);
  np.seek.max = el.audio.duration || 0;
  np.seek.value = el.audio.currentTime;
  paintRange(np.seek);
  if (np.volume) { np.volume.value = el.volume.value; paintRange(np.volume); }
}
function syncNowPlaying() {
  const song = queue[currentIndex];
  if (!song) return;
  np.title.textContent = song.title;
  np.artist.textContent = song.artist;
  np.backdrop.style.backgroundImage = `url("${(song.cover || COVER_FALLBACK).replace(/"/g, "")}")`;
  np.fav.classList.toggle("lit", isFav(song.id));
  if (!np.root.hidden) { buildNPFlow(); npSyncPlayState(); npSyncSeek(); }
}

function openNowPlaying() {
  if (!queue[currentIndex]) return;
  npSheetAnimation?.();
  npPreviousFocus = document.activeElement;
  np.root.hidden = false;
  np.root.setAttribute("aria-hidden", "false");
  document.body.classList.add("np-open");
  document.body.style.overflow = "hidden";
  syncNowPlaying(); buildNPFlow(); npSyncPlayState(); npSyncSeek();
  if (!npMobile() && !lyricsOpen) {
    npOpenedLyrics = true;
    setLyricsOpen(true);
  }
  requestAnimationFrame(() => np.close.focus({ preventScroll: true }));
  if (prefersReducedMotion()) {
    np.root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
    npSheetY = 0;
    np.root.style.setProperty("--np-sheet-y", "0px");
    np.root.style.setProperty("--np-sheet-opacity", "1");
    return;
  }
  npSheetY = 56;
  np.root.style.setProperty("--np-sheet-y", "56px");
  npSheetAnimation = springValue({
    from: 56,
    to: 0,
    response: 0.38,
    damping: 1,
    update(value) {
      npSheetY = value;
      np.root.style.setProperty("--np-sheet-y", `${value}px`);
      np.root.style.setProperty("--np-sheet-opacity", String(Math.max(0, 1 - value / 96)));
    },
    complete() { npSheetAnimation = null; },
  });
}
function closeNowPlaying() {
  const finish = () => {
    np.root.hidden = true;
    np.root.setAttribute("aria-hidden", "true");
    if (npOpenedLyrics) {
      setLyricsOpen(false);
      npOpenedLyrics = false;
    }
    document.body.classList.remove("np-open");
    document.body.style.overflow = "";
    np.root.style.setProperty("--np-sheet-y", "0px");
    np.root.style.setProperty("--np-sheet-opacity", "1");
    npSheetY = 0;
    npPreviousFocus?.focus?.({ preventScroll: true });
    npPreviousFocus = null;
  };
  npSheetAnimation?.();
  if (prefersReducedMotion()) {
    const fade = np.root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-out" });
    fade.addEventListener("finish", finish, { once: true });
    return;
  }
  npSheetAnimation = springValue({
    from: npSheetY,
    to: 72,
    response: 0.3,
    damping: 1,
    update(value) {
      npSheetY = value;
      np.root.style.setProperty("--np-sheet-y", `${value}px`);
      np.root.style.setProperty("--np-sheet-opacity", String(Math.max(0, 1 - value / 88)));
    },
    complete() {
      npSheetAnimation = null;
      finish();
    },
  });
}

// Wire controls (reuse the main player's logic so behaviour stays in sync)
np.play.addEventListener("click", () => el.btnPlay.click());
np.prev.addEventListener("click", () => el.btnPrev.click());
np.next.addEventListener("click", () => el.btnNext.click());
np.shuffle.addEventListener("click", () => { el.btnShuffle.click(); npSyncPlayState(); });
np.repeat.addEventListener("click", () => { el.btnRepeat.click(); npSyncPlayState(); });
np.fav.addEventListener("click", () => {
  el.btnFav.click();
  const s = queue[currentIndex];
  if (s) np.fav.classList.toggle("lit", isFav(s.id));
});
np.close.addEventListener("click", () => closeNowPlaying());
np.lyricsToggle.addEventListener("click", () => setLyricsOpen(!lyricsOpen));
np.outputToggle?.addEventListener("click", () => {
  if (typeof el.audio.webkitShowPlaybackTargetPicker === "function") {
    el.audio.webkitShowPlaybackTargetPicker();
  } else {
    toast("Choose an audio output from your device controls");
  }
});
np.queueToggle.addEventListener("click", () => {
  renderQueue();
  showView("queue");
  closeNowPlaying();
});
np.more.addEventListener("click", () => {
  const song = queue[currentIndex];
  if (song) openAddDialog(song);
});
np.root.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeNowPlaying();
  }
});
np.seek.addEventListener("input", () => { npSeeking = true; np.cur.textContent = formatTime(Number(np.seek.value)); paintRange(np.seek); });
np.seek.addEventListener("change", () => { el.audio.currentTime = Number(np.seek.value); npSeeking = false; });
np.volume?.addEventListener("input", () => {
  el.volume.value = np.volume.value;
  el.audio.volume = Number(np.volume.value);
  paintRange(el.volume);
  paintRange(np.volume);
});

// Open the immersive player from the compact player on every viewport.
const playerTrackEl = document.querySelector(".player-track");
if (playerTrackEl) playerTrackEl.addEventListener("click", openNowPlaying);

// Coverflow drag: 1:1 pointer tracking, rubber-banded edges, momentum
// projection and velocity handoff into an interruptible spring.
const npGesture = { pointerId: null, startX: 0, baseOffset: 0, dragging: false, samples: [] };

np.flow.addEventListener("pointerdown", (e) => {
  if (e.button !== 0 && e.pointerType === "mouse") return;
  npOffsetAnimation?.();
  npOffsetAnimation = null;
  npGesture.pointerId = e.pointerId;
  npGesture.startX = e.clientX;
  npGesture.baseOffset = npOffset;
  npGesture.dragging = false;
  npGesture.samples = [{ x: e.clientX, t: performance.now() }];
  np.flow.setPointerCapture(e.pointerId);
});

np.flow.addEventListener("pointermove", (e) => {
  if (e.pointerId !== npGesture.pointerId) return;
  const rawDistance = e.clientX - npGesture.startX;
  if (!npGesture.dragging && Math.abs(rawDistance) < 10) return;
  npGesture.dragging = true;
  np.flow.classList.add("is-dragging");

  const { list, idx } = npList();
  let distance = npGesture.baseOffset + rawDistance;
  const width = Math.max(np.flow.clientWidth, 1);
  if ((idx <= 0 && distance > 0) || (idx >= list.length - 1 && distance < 0)) {
    distance = rubberband(distance, width);
  }
  npOffset = distance;
  npRenderPositions();

  const now = performance.now();
  npGesture.samples.push({ x: e.clientX, t: now });
  npGesture.samples = npGesture.samples.filter((sample) => now - sample.t <= 100);
});

function finishNPDrag(e, cancelled = false) {
  if (e.pointerId !== npGesture.pointerId) return;
  const wasDragging = npGesture.dragging;
  np.flow.classList.remove("is-dragging");
  npGesture.pointerId = null;

  if (!wasDragging) return;
  npSuppressClickUntil = performance.now() + 300;
  const samples = npGesture.samples;
  const first = samples[0];
  const last = samples[samples.length - 1];
  const velocity = !cancelled && last && first && last.t > first.t
    ? ((last.x - first.x) / (last.t - first.t)) * 1000
    : 0;
  const spacing = npCardSpacing();
  const projected = npOffset + projectMomentum(velocity);
  const { list, idx } = npList();
  let direction = 0;
  if (!cancelled && projected < -spacing * 0.5 && idx < list.length - 1) direction = 1;
  if (!cancelled && projected > spacing * 0.5 && idx > 0) direction = -1;

  if (direction === 1) {
    el.btnNext.click();
    npOffset += spacing;
  } else if (direction === -1) {
    el.btnPrev.click();
    npOffset -= spacing;
  }
  npRenderPositions();
  npSettle(npOffset, velocity, direction !== 0);
}

np.flow.addEventListener("pointerup", (e) => finishNPDrag(e));
np.flow.addEventListener("pointercancel", (e) => finishNPDrag(e, true));

// Keep the presentation in sync across viewport changes.
el.audio.addEventListener("play", npSyncPlayState);
el.audio.addEventListener("pause", npSyncPlayState);
el.audio.addEventListener("timeupdate", () => { if (!np.root.hidden) npSyncSeek(); });
el.audio.addEventListener("loadedmetadata", () => { if (!np.root.hidden) npSyncSeek(); });
window.addEventListener("resize", () => { if (!np.root.hidden) npRenderPositions(); });
