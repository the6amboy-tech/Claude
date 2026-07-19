/* ============ Asharas music player ============ */
const API_BASE = "https://jiosaavn-api-one-rho.vercel.app";
const FACTS_API = "https://uselessfacts.jsph.pl/api/v2/facts/random";

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
  welcome: $("welcome"),
  cardMood: $("card-mood"),
  cardNormal: $("card-normal"),
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
  langSelect: $("lang-select"),
  themeSelect: $("theme-select"),
  searchWrap: document.querySelector(".search-wrap"),
  reco: $("reco"),
  filterPills: [...document.querySelectorAll(".filter-pill")],
  recentsSection: $("recents-section"),
  recentsRow: $("recents-row"),
  factText: $("fact-text"),
  factRefresh: $("fact-refresh"),
  listenTogether: $("listen-together"),
  navBtns: [...document.querySelectorAll("[data-nav]")],
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
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
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

el.langSelect.value = loadJSON("ash_lang", "telugu");
if (loadJSON("ash_dim", false)) document.documentElement.classList.add("dim");

// Themes: "aurora" is the original look (no data-theme); others override.
function applyTheme(name) {
  if (name === "aurora") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", name);
  if (el.themeSelect) el.themeSelect.value = name;
  saveJSON("ash_theme", name);
}
applyTheme(loadJSON("ash_theme", "aurora"));

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

const langPrefix = () => (el.langSelect.value ? `${el.langSelect.value} ` : "");

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
  });
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
    btn.classList.toggle("lit", isFav(btn.dataset.id));
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
    li.style.animationDelay = `${Math.min(i * 45, 450)}ms`;
    li.dataset.index = i;

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
    favBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.6-9.5-8.5C.6 9 2.6 5.5 6 5.5c2 0 3.4 1.1 4 2.2.6-1.1 2-2.2 4-2.2 3.4 0 5.4 3.5 3.5 7C19 16.4 12 21 12 21z"/></svg>';
    favBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleFav(song); });

    const addBtn = document.createElement("button");
    addBtn.className = "row-btn";
    addBtn.title = "Add to playlist";
    addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/><path d="M19 15v6"/><path d="M16 18h6"/></svg>';
    addBtn.addEventListener("click", (e) => { e.stopPropagation(); openAddDialog(song); });

    const queueBtn = document.createElement("button");
    queueBtn.className = "row-btn";
    queueBtn.title = "Play next";
    queueBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>';
    queueBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      playNextQueue.push(song);
      toast(`Added to queue: ${song.title}`);
      updateQueueUI();
    });

    li.append(coverImg(song, "track-cover"), info, eq, dur, favBtn, addBtn, queueBtn);
    li.addEventListener("click", () => { queue = listSongs; playIndex(i); });
    el.results.appendChild(li);
  });
  markActive();
}

// Shared artwork card with an "add to queue" overlay button.
function buildTrendCard(song, getList, i) {
  const card = document.createElement("div");
  card.className = "trend-card glass";
  card.style.animationDelay = `${Math.min(i * 60, 500)}ms`;

  const box = document.createElement("div");
  box.className = "trend-cover-box";
  const q = document.createElement("button");
  q.className = "row-btn card-queue";
  q.title = "Add to queue";
  q.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>';
  q.addEventListener("click", (e) => {
    e.stopPropagation();
    playNextQueue.push(song);
    toast(`Added to queue: ${song.title}`);
    updateQueueUI();
  });
  box.append(coverImg(song, "trend-cover"), q);

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
  document.title = `${song.title} · Asharas`;

  el.player.classList.add("visible");
  el.player.setAttribute("aria-hidden", "false");
  markActive();
  syncFavUI();
  updateQueueUI();
  pushRecent(song);

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
  playIndex(shuffleOn ? randomIndex() : (currentIndex + 1) % queue.length);
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
  if (repeatMode === "one") { el.audio.currentTime = 0; el.audio.play().catch(() => {}); return; }
  if (shuffleOn) return playIndex(randomIndex());
  const last = currentIndex === queue.length - 1;
  if (last && repeatMode === "off") return; // stop at end of queue
  playNext();
}

/* ---------- Search & moods ---------- */

// If the primary query returns nothing (e.g. a language-scoped query the
// API has no matches for), automatically retry with fallbackQuery.
async function runSearch(query, title, fallbackQuery) {
  showView("list");
  el.listTitle.textContent = title;
  el.results.innerHTML = '<div class="spinner"></div>';
  try {
    let songs = await searchSongs(query);
    if (!songs.length && fallbackQuery && fallbackQuery !== query) {
      songs = await searchSongs(fallbackQuery);
    }
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

async function loadFact() {
  el.factText.textContent = "Loading fun fact…";
  try {
    const res = await fetch(FACTS_API);
    const json = await res.json();
    el.factText.textContent = json.text;
  } catch {
    el.factText.textContent = "Fun facts are taking a break — try a refresh.";
  }
}

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
  el.plDialog.showModal();
}

function addToPlaylist(pl, song) {
  if (pl.songs.some((s) => s.id === song.id)) { toast(`Already in "${pl.name}"`); return; }
  pl.songs.push(song);
  saveJSON("ash_playlists", playlists);
  toast(`Added to "${pl.name}"`);
}

/* ---------- Events ---------- */

// Welcome screen
function dismissWelcome(then) {
  el.welcome.classList.add("leave");
  setTimeout(() => { el.welcome.remove(); then?.(); }, 550);
}
el.cardNormal.addEventListener("click", () => dismissWelcome(() => el.input.focus()));
el.cardMood.addEventListener("click", () =>
  dismissWelcome(() => el.moodGrid.scrollIntoView({ behavior: "smooth", block: "center" }))
);

// Navigation
el.navBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    const nav = btn.dataset.nav;
    if (nav === "home") showView("home");
    else if (nav === "search") { showView("home"); el.input.focus(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else if (nav === "favorites") { activeMoodQuery = null; activeMoodLabel = null; renderList(favs, "Favorites"); showView("list"); }
    else if (nav === "queue") { renderQueue(); showView("queue"); }
    else if (nav === "playlists") { activeMoodQuery = null; activeMoodLabel = null; renderPlaylists(); showView("playlists"); }
  })
);
el.backHome.addEventListener("click", () => showView("home"));
el.backHome2.addEventListener("click", () => showView("home"));
el.backHome3.addEventListener("click", () => showView("home"));

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
  const modeLabel = { song: "Songs", artist: "Artist", language: el.langSelect.value || "Language" }[searchMode];
  runSearch(buildSearchQuery(query, searchMode), `${modeLabel} · "${query}"`);
});

// Filter pills
el.filterPills.forEach((pill) =>
  pill.addEventListener("click", () => {
    searchMode = pill.dataset.mode;
    el.filterPills.forEach((p) => {
      const on = p === pill;
      p.classList.toggle("active", on);
      p.setAttribute("aria-checked", on ? "true" : "false");
    });
    if (el.input.value.trim()) updateReco();
  })
);

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

// Theme selector
el.themeSelect.addEventListener("change", () => applyTheme(el.themeSelect.value));

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
  runSearch(
    `${langPrefix()}${card.dataset.q}`,
    `${label} · ${el.langSelect.value || "All languages"}`,
    card.dataset.q // fall back to the unscoped genre query, never an empty list
  );
});

// Language — re-filter active mood if one is selected + reload home sections
el.langSelect.addEventListener("change", () => {
  saveJSON("ash_lang", el.langSelect.value);
  loadTrending();
  loadAllLangSections();
  if (activeMoodQuery) {
    runSearch(
      `${langPrefix()}${activeMoodQuery}`,
      `${activeMoodLabel} · ${el.langSelect.value || "All languages"}`,
      activeMoodQuery
    );
  }
});

// Trending
el.seeAll.addEventListener("click", () => {
  renderList(trendSongs, "Trending now");
  showView("list");
});

// Fun facts
el.factRefresh.addEventListener("click", loadFact);

// Listen Together — open choice modal
el.listenTogether.addEventListener("click", () => el.ltDialog.showModal());

// Choice: Host
el.ltHost.addEventListener("click", () => {
  el.ltDialog.close();
  if (startSession(true)) el.ltHostDialog.showModal();
});

// Choice: Join
el.ltJoin.addEventListener("click", () => {
  el.ltDialog.close();
  el.ltCodeInput.value = "";
  el.ltJoinDialog.showModal();
  setTimeout(() => el.ltCodeInput.focus(), 100);
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
  el.ltTransferDialog.showModal();
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
  const code = el.ltCodeInput.value.trim().toUpperCase();
  if (code.length !== 6) return toast("Enter a valid 6-character code");
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
  if (sessionCode) el.ltHostDialog.showModal();
});

// Session bar — Copy Code
el.ltBarCopyCode.addEventListener("click", () => copyToClipboard(sessionCode, "Code"));

// Session bar — Copy Link
el.ltBarCopyLink.addEventListener("click", () => copyToClipboard(sessionUrl(), "Link"));

// Session bar — Transfer Host
el.ltBarTransfer.addEventListener("click", () => {
  updateParticipantsUI();
  el.ltTransferDialog.showModal();
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

const canTilt =
  matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !matchMedia("(prefers-reduced-motion: reduce)").matches;

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
loadFact();
loadTrending();
loadAllLangSections();

// Deep links: ?session=<CODE> auto-joins a session; ?q=&song= shares a song
(async () => {
  const params = new URLSearchParams(location.search);
  const session = (params.get("session") || "").trim().toUpperCase();
  if (session.length === 6) {
    if (el.welcome) dismissWelcome();
    startSession(false, session);
  }
  const q = params.get("q");
  if (!q) return;
  const songs = await runSearch(q, `Shared · "${q}"`);
  const id = params.get("song");
  const i = songs.findIndex((s) => s.id === id);
  if (i !== -1) { queue = songs; playIndex(i); }
})();
