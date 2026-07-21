# Getting Asharas onto Google

The site now ships everything Google needs to index and rank it:

- A descriptive `<title>` and meta description targeting **"Asharas music"**
- Open Graph + Twitter cards with a branded `og-image.png` (rich link previews)
- `WebApplication` structured data (JSON-LD) naming the app **Asharas / Asharas Music**
- `robots.txt` (allows crawling) and `sitemap.xml`
- A canonical URL and indexable static text (brand name, tagline, sections)

That's the on-page work done. **Getting actually indexed still needs two things
only you can do**, because they require your Google account — and indexing takes
time (usually a few days to a few weeks after you submit).

## Do this to get indexed (~10 minutes)
1. Go to **Google Search Console** → <https://search.google.com/search-console>.
2. Add a property for the URL **`https://the6amboy-tech.github.io/Claude/`**
   (choose the "URL prefix" option) and verify it — the easiest method for
   GitHub Pages is the **HTML tag** method: Google gives you a
   `<meta name="google-site-verification" ...>` tag. You already have one such
   tag in `index.html`; if Google issues a different one, send it to me and I'll
   swap it in, then you click Verify.
3. In Search Console → **Sitemaps**, submit: `sitemap.xml`
4. Use **URL Inspection** → paste the site URL → **Request indexing**.

Then search `site:the6amboy-tech.github.io/Claude` in a few days to confirm it's
in the index, and `asharas music` a bit later to see where it ranks.

## Honest expectations about ranking
- **Indexing ≠ ranking.** Being in Google is quick; ranking #1 for "asharas
  music" depends on competition and how strong the site's signals are.
- **The URL matters a lot.** A project sub-path
  (`the6amboy-tech.github.io/Claude/`) ranks weaker and looks less official than
  a real domain. For "Asharas" to own the search result, a **custom domain**
  like `asharas.app` or `asharasmusic.com` (~₹800–1500/yr) pointed at this site
  is by far the biggest lever. I can wire up the custom-domain config
  (`CNAME` + updated URLs) whenever you have one.
- **Backlinks & time** help: link the site from your GitHub profile, socials,
  and any bios. Fresh sites climb over weeks, not hours.

Tell me if you register a domain and I'll switch everything over to it.
