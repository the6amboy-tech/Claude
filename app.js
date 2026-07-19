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
};

/* ---------- Persistent state ---------- */

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
const saveJSON = (key, val) => localStorage.setItem(key, JSON.stringify(val));

let favs = loadJSON("ash_favs", []);
let playlists = loadJSON("ash_playlists", []);

let queue = [];        // songs the player advances through
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

// Simulated participants for Listen Together
let sessionParticipants = [];
const FAKE_NAMES = ["Alex", "Jordan", "Sam", "Riley", "Morgan", "Taylor", "Casey", "Quinn"];

function generateSessionCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function simulateParticipantJoin() {
  if (!sessionCode) return;
  const name = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
  if (sessionParticipants.includes(name)) return;
  sessionParticipants.push(name);
  updateParticipantsUI();
  toast(`${name} joined the session 🎧`);
}

function removeParticipant(name) {
  sessionParticipants = sessionParticipants.filter((p) => p !== name);
  updateParticipantsUI();
}

function updateParticipantsUI() {
  if (!el.ltParticipantsList || !el.ltEmptyMsg) return;
  el.ltParticipantsList.innerHTML = "";
  if (sessionParticipants.length === 0) {
    el.ltEmptyMsg.style.display = "block";
    return;
  }
  el.ltEmptyMsg.style.display = "none";
  sessionParticipants.forEach((name) => {
    const row = document.createElement("div");
    row.className = "lt-participant glass";
    row.innerHTML = `
      <span class="lt-participant-avatar">${name[0]}</span>
      <span class="lt-participant-name">${name}</span>
      <button class="pill-btn glass lt-transfer-btn" data-who="${name}">Transfer</button>
      <button class="pill-btn ghost lt-kick-btn" data-who="${name}" title="Remove">✕</button>
    `;
    el.ltParticipantsList.appendChild(row);
  });
  // Wire transfer buttons
  el.ltParticipantsList.querySelectorAll(".lt-transfer-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      toast(`Host transferred to ${btn.dataset.who} 👑`);
      sessionParticipants = sessionParticipants.filter((p) => p !== btn.dataset.who);
      updateParticipantsUI();
      el.ltTransferDialog.close();
    });
  });
  // Wire kick buttons
  el.ltParticipantsList.querySelectorAll(".lt-kick-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeParticipant(btn.dataset.who);
      toast(`${btn.dataset.who} removed from session`);
    });
  });
}

function startSession(host) {
  isHost = host;
  sessionCode = generateSessionCode();
  sessionParticipants = [];
  el.ltSessionCode.textContent = sessionCode;
  el.ltBarCode.textContent = sessionCode;
  el.ltSessionBar.hidden = false;
  el.listenTogether.hidden = true;
  updateParticipantsUI();
  // Simulate a participant joining after a few seconds
  setTimeout(() => simulateParticipantJoin(), 2500);
  setTimeout(() => simulateParticipantJoin(), 5000);
}

function endSession() {
  sessionCode = null;
  isHost = false;
  sessionParticipants = [];
  el.ltSessionBar.hidden = true;
  el.listenTogether.hidden = false;
  toast("Session ended");
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
  const url = `${API_BASE}/api/search/songs?query=${encodeURIComponent(query)}&limit=30`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API responded with ${res.status}`);
  const json = await res.json();
  const results = json.data?.results || json.results || [];
  return results.map(normalizeSong).filter((s) => s.streamUrl);
}

const langPrefix = () => (el.langSelect.value ? `${el.langSelect.value} ` : "");

/* ---------- Views ---------- */

function showView(name) {
  el.viewHome.hidden = name !== "home";
  el.viewList.hidden = name !== "list";
  el.viewPlaylists.hidden = name !== "playlists";
  el.navBtns.forEach((b) => b.classList.toggle("active", b.dataset.nav === name || (name === "list" && b.dataset.nav === "home")));
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

    li.append(coverImg(song, "track-cover"), info, eq, dur, favBtn, addBtn);
    li.addEventListener("click", () => { queue = listSongs; playIndex(i); });
    el.results.appendChild(li);
  });
  markActive();
}

function renderTrending(songs) {
  trendSongs = songs;
  el.trendingRow.innerHTML = "";
  songs.slice(0, 12).forEach((song, i) => {
    const card = document.createElement("button");
    card.className = "trend-card glass";
    card.style.animationDelay = `${Math.min(i * 60, 500)}ms`;
    const name = document.createElement("span");
    name.className = "trend-name";
    name.textContent = song.title;
    const by = document.createElement("span");
    by.className = "trend-by";
    by.textContent = song.artist;
    card.append(coverImg(song, "trend-cover"), name, by);
    card.addEventListener("click", () => { queue = trendSongs; playIndex(i); });
    el.trendingRow.appendChild(card);
  });
}

// Generic horizontal row renderer for language categories
function renderLangRow(rowEl, songs, rowKey) {
  langSongsCache[rowKey] = songs;
  rowEl.innerHTML = "";
  songs.slice(0, 12).forEach((song, i) => {
    const card = document.createElement("button");
    card.className = "trend-card glass";
    card.style.animationDelay = `${Math.min(i * 60, 500)}ms`;
    const name = document.createElement("span");
    name.className = "trend-name";
    name.textContent = song.title;
    const by = document.createElement("span");
    by.className = "trend-by";
    by.textContent = song.artist;
    card.append(coverImg(song, "trend-cover"), name, by);
    card.addEventListener("click", () => { queue = langSongsCache[rowKey]; playIndex(i); });
    rowEl.appendChild(card);
  });
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

async function runSearch(query, title) {
  showView("list");
  el.listTitle.textContent = title;
  el.results.innerHTML = '<div class="spinner"></div>';
  try {
    const songs = await searchSongs(query);
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
    el.results.innerHTML = `<p class="empty-note error">Couldn't reach the music API. ${err.message}</p>`;
    return [];
  }
}

// Trending — search for latest songs
async function loadTrending() {
  try {
    const songs = await searchSongs(`${langPrefix()}trending latest hit songs 2026`);
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
    const songs = await searchSongs(`${key} latest hit songs 2026`);
    renderLangRow(rowEl, songs, key);
  } catch {
    rowEl.innerHTML = `<p class="empty-note">${label} hits unavailable right now.</p>`;
  }
}

async function loadAllLangSections() {
  for (const sec of LANG_SECTIONS) {
    loadLangSection(sec.key, el[sec.rowEl], sec.label);
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
    else if (nav === "playlists") { activeMoodQuery = null; activeMoodLabel = null; renderPlaylists(); showView("playlists"); }
  })
);
el.backHome.addEventListener("click", () => showView("home"));
el.backHome2.addEventListener("click", () => showView("home"));

// Search
el.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = el.input.value.trim();
  if (!query) return;
  activeMoodQuery = null;
  activeMoodLabel = null;
  runSearch(query, `Results for "${query}"`);
});

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
  runSearch(`${langPrefix()}${card.dataset.q}`, `${label} · ${el.langSelect.value || "All languages"}`);
});

// Language — re-filter active mood if one is selected + reload home sections
el.langSelect.addEventListener("change", () => {
  saveJSON("ash_lang", el.langSelect.value);
  loadTrending();
  loadAllLangSections();
  if (activeMoodQuery) {
    runSearch(`${langPrefix()}${activeMoodQuery}`, `${activeMoodLabel} · ${el.langSelect.value || "All languages"}`);
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
  startSession(true);
  el.ltHostDialog.showModal();
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
  startSession(false);
  el.ltBarCode.textContent = code;
  sessionCode = code;
  toast("Joined session " + code + " 🎧");
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
el.audio.addEventListener("play", () => { el.player.classList.add("playing"); markActive(); });
el.audio.addEventListener("pause", () => { el.player.classList.remove("playing"); markActive(); });
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

el.audio.volume = Number(el.volume.value);
paintRange(el.volume);
paintRange(el.seek);
loadFact();
loadTrending();
loadAllLangSections();

// Shared "listen together" links: ?q=<query>&song=<id>
(async () => {
  const params = new URLSearchParams(location.search);
  const q = params.get("q");
  if (!q) return;
  const songs = await runSearch(q, `Shared · "${q}"`);
  const id = params.get("song");
  const i = songs.findIndex((s) => s.id === id);
  if (i !== -1) { queue = songs; playIndex(i); }
})();
