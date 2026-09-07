import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
const { createTracker, formatDuration } = createRequire(import.meta.url)("../listening-stats.js");
class Audio { constructor() { this.paused = true; this.currentTime = 0; this.listeners = {}; } addEventListener(k, f) { (this.listeners[k] ||= []).push(f); } emit(k) { for (const f of this.listeners[k] || []) f(); } }
const setup = () => { let now = 0; const audio = new Audio(); const map = new Map(); const storage = { getItem: k => map.get(k) || null, setItem: (k, v) => map.set(k, v) }; const tracker = createTracker({ audio, storage, clock: () => now, getTrackId: () => "song-1" }); tracker.setTrack("song-1"); return { audio, tracker, tick(ms, sec) { now += ms; audio.currentTime += sec; tracker.sample(); }, map }; };
test("counts real playback time and ignores pause", () => { const x = setup(); x.audio.emit("play"); x.audio.paused = false; x.tick(1000, 1); x.audio.paused = true; x.tick(10000, 0); assert.equal(x.tracker.snapshot().totalMs, 1000); });
test("does not count a seek jump as listening", () => { const x = setup(); x.audio.paused = false; x.audio.emit("play"); x.tick(2000, 2); x.audio.currentTime = 80; x.audio.emit("seeking"); x.audio.emit("seeked"); x.tick(1000, 1); assert.equal(x.tracker.snapshot().totalMs, 3000); });
test("persists and formats believable totals", () => { const x = setup(); x.audio.paused = false; x.audio.emit("play"); x.tick(65000, 65); x.audio.emit("pause"); const saved = JSON.parse(x.map.values().next().value); assert.equal(saved.totalMs, 65000); assert.equal(formatDuration(3660000), "1h 1m"); });
