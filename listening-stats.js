(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.AsharasListeningStats = factory();
})(typeof self !== "undefined" ? self : globalThis, function () {
  const KEY = "ash_listening_stats_v1";
  const blank = () => ({ version: 1, totalMs: 0, sessions: 0, lastPlayedAt: 0, days: {}, tracks: {} });
  const clean = (raw) => {
    const s = raw && typeof raw === "object" ? raw : blank();
    return { ...blank(), ...s, days: { ...(s.days || {}) }, tracks: { ...(s.tracks || {}) } };
  };
  const dayKey = (date = new Date()) => {
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const formatDuration = (ms = 0) => {
    const minutes = Math.max(0, Math.round(ms / 60000));
    if (minutes < 1) return "0 min";
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };
  function createTracker({ audio, storage = globalThis.localStorage, clock = () => Date.now(), getTrackId = () => null, onChange } = {}) {
    let state;
    try { state = clean(JSON.parse(storage?.getItem(KEY) || "null")); } catch { state = blank(); }
    let active = false, lastWall = 0, lastMedia = 0, trackId = null, interval = null;
    const save = () => { try { storage?.setItem(KEY, JSON.stringify(state)); } catch {} onChange?.(state); };
    const sample = () => {
      const now = clock();
      if (!active || audio?.paused) { lastWall = now; lastMedia = Number(audio?.currentTime) || 0; return 0; }
      const media = Number(audio.currentTime);
      const mediaDelta = media - lastMedia;
      const wallDelta = now - lastWall;
      let delta = mediaDelta >= 0 && mediaDelta <= Math.max(2, wallDelta / 1000 + 1) ? mediaDelta * 1000 : 0;
      if (delta > 0 && trackId) {
        const key = dayKey(new Date(now));
        state.totalMs += delta;
        state.days[key] = (state.days[key] || 0) + delta;
        state.tracks[trackId] = (state.tracks[trackId] || 0) + delta;
        state.lastPlayedAt = now;
      }
      lastWall = now; lastMedia = Number.isFinite(media) ? media : lastMedia;
      return delta;
    };
    const start = () => { if (active) return; active = true; state.sessions += 1; lastWall = clock(); lastMedia = Number(audio?.currentTime) || 0; interval = setInterval(sample, 1000); interval?.unref?.(); save(); };
    const pause = () => { sample(); active = false; clearInterval(interval); interval = null; save(); };
    const setTrack = (id) => { sample(); trackId = id || null; lastWall = clock(); lastMedia = Number(audio?.currentTime) || 0; };
    const reset = () => { state = blank(); save(); };
    const snapshot = () => JSON.parse(JSON.stringify(state));
    const onSeek = () => { sample(); lastWall = clock(); lastMedia = Number(audio?.currentTime) || 0; };
    audio?.addEventListener("play", start); audio?.addEventListener("playing", start);
    audio?.addEventListener("pause", pause); audio?.addEventListener("ended", pause);
    audio?.addEventListener("seeking", onSeek); audio?.addEventListener("seeked", onSeek);
    globalThis.addEventListener?.("pagehide", () => { sample(); save(); });
    globalThis.addEventListener?.("beforeunload", () => { sample(); save(); });
    return { start, pause, sample, setTrack, reset, snapshot, key: KEY };
  }
  return { createTracker, formatDuration, getDayKey: dayKey };
});
