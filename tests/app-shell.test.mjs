import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const worker = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");

test("the live app shell uses one release version", () => {
  for (const asset of ["style.css", "apple-player.css", "app.js", "motion.js", "manifest.webmanifest"]) {
    assert.match(index, new RegExp(`${asset.replace(".", "\\.")}\\?v=24`));
    assert.match(worker, new RegExp(`${asset.replace(".", "\\.")}\\?v=24`));
  }
  assert.match(worker, /const CACHE = "asharas-v24"/);
  assert.match(worker, /listening-stats\.js\?v=1/);
});

test("mobile startup uses the lean loading path", () => {
  assert.match(index, /classList\.add\("mobile-performance"\)/);
  assert.match(app, /API_MAX_CONCURRENT = MOBILE_PERF \? 2 : 4/);
  assert.match(app, /if \(MOBILE_PERF\) loadLangSectionsLazily\(\)/);
});

test("web updates wait for active playback to pause", () => {
  assert.match(app, /Update ready — it will apply when playback pauses/);
  assert.match(app, /addEventListener\("pause", reloadWhenSafe, \{ once: true \}\)/);
  assert.match(app, /registration\.update\(\)/);
});
