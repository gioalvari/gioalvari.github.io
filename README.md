# gioalvari.github.io

Personal site. No framework and no build step.

- `index.html`
- `style.css`
- `site.js`
- `assets/projects/*.svg`
- `_og.html` — 1200×630 source for the social preview
- `og-2026-09.png` — versioned social-preview image used by metadata

Edit and push — GitHub Pages serves `main` directly.

## Local preview

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Social preview

After editing `_og.html`, regenerate the versioned image with Chromium:

```bash
npx playwright screenshot \
  --browser=chromium \
  --viewport-size="1200,630" \
  --wait-for-timeout=1000 \
  http://127.0.0.1:8000/_og.html \
  og-YYYY-MM.png
```

Update both `og:image` and `twitter:image` in `index.html` when the filename changes.
