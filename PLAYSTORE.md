# Publishing Asharas to the Google Play Store

Asharas is already an **installable app**. On Android Chrome, open
<https://the6amboy-tech.github.io/Claude/> → menu (⋮) → **Add to Home screen /
Install app**. It launches full-screen with its own icon, works offline for the
shell, and behaves like a native app. On iOS use Safari → Share → **Add to Home
Screen**. That covers most "make it an app" needs with zero cost.

To get it into the **Play Store** specifically, we wrap the PWA in a **Trusted
Web Activity (TWA)** and upload the resulting Android App Bundle (`.aab`). The
scaffold (`twa-manifest.json`) and icons are already in this repo. The steps
below need **your** accounts/keys, so they can't be automated for you.

## What only you can do
- **Google Play Developer account** — one-time **$25** at
  <https://play.google.com/console/signup>.
- **App signing** — Bubblewrap creates a keystore; keep it safe (losing it means
  you can never update the app).
- **Store submission** — uploading, the listing, and hitting *Publish* happen in
  Play Console under your account.

## 1. Build the `.aab` with Bubblewrap
```bash
# Needs Node 18+ and a JDK 17. Bubblewrap downloads the Android SDK itself.
npm install -g @bubblewrap/cli

# From an empty folder, point it at the live manifest:
bubblewrap init --manifest https://the6amboy-tech.github.io/Claude/manifest.webmanifest
#   • accept the defaults from twa-manifest.json in this repo
#   • package id suggestion: io.github.the6amboy.asharas
#   • let it create a NEW signing key and SAVE the keystore + passwords

bubblewrap build      # produces app-release-bundle.aab + app-release-signed.apk
```

## 2. Verify domain ownership (removes the browser address bar)
Bubblewrap prints an `assetlinks.json` (it contains your key's SHA-256). That
file must be served at the **origin root**:

```
https://the6amboy-tech.github.io/.well-known/assetlinks.json
```

⚠️ **Important:** this site lives at a *project* path (`/Claude/`), but asset
links must sit at the *domain* root. GitHub Pages serves the domain root from a
repo named exactly **`the6amboy-tech.github.io`**. So either:
- create that repo and put the file at `/.well-known/assetlinks.json`, **or**
- point a **custom domain** (e.g. `asharas.app`) at this site and host
  `/.well-known/assetlinks.json` there (then update `host`/URLs in
  `twa-manifest.json`).

Without verified asset links the app still works but shows a thin URL bar.

## 3. Upload & publish in Play Console
1. Create the app → upload `app-release-bundle.aab` to **Internal testing** first.
2. Fill the listing: title *Asharas*, short + full description, the 512×512 icon
   (`icons/icon-512.png`), a feature graphic (1024×500), and 2–8 phone
   screenshots (grab them from the running app).
3. Complete the required forms: Privacy Policy URL, Data safety, Content rating,
   Target audience, Ads declaration.
4. Roll from Internal testing → Production and submit for review (first review is
   typically 1–7 days).

## Heads-up on store policy
Asharas streams from a third-party (JioSaavn) API. Google (and rights holders)
can reject or take down music apps that redistribute copyrighted audio without a
license. For a **personal/portfolio** build this is usually fine for internal
testing; for a **public production** listing, be prepared to show you have the
right to stream the content, or point the player at royalty-free/self-owned
audio. I flag this so it isn't a surprise during review — happy to help adapt
the player to a licensed or royalty-free source if you want to go fully public.

## Build the `.aab` in CI (no local Android setup needed)

A workflow at `.github/workflows/build-android.yml` builds the signed bundle for
you on GitHub's runners. One-time setup:

1. **Create a signing keystore** (once — keep it forever, private):
   ```bash
   keytool -genkeypair -v -keystore android.keystore -alias asharas \
     -keyalg RSA -keysize 2048 -validity 9125
   base64 -w0 android.keystore   # macOS: base64 -i android.keystore
   ```
2. **Add repo secrets** (Settings → Secrets and variables → Actions):
   - `ANDROID_KEYSTORE_BASE64` — the base64 string from step 1
   - `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_PASSWORD` — your passwords
   - `ANDROID_KEY_ALIAS` — `asharas`
3. **Run it:** Actions tab → *Build Android App Bundle (TWA)* → *Run workflow*
   (set version name/code). When it finishes, download the **asharas-android**
   artifact — it contains `app-release-bundle.aab` (upload this to Play Console),
   the signed `.apk` (for sideload testing), and `assetlinks.json` (host at your
   domain root per step 2 above). Bump the version **code** for every new release.

> Note: this workflow is a solid starting point but hasn't been run against a
> real keystore yet — the first run may need a small tweak (Bubblewrap version or
> a prompt). Ping me with the run log and I'll fix it fast.
