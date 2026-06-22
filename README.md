# Lipi Anniversary — Part II (Alignment-Refined)

This version rebuilds the visual layout around responsive CSS Grid instead of relying on fragile absolute positioning for story content. It keeps the same narrative and moments, while fixing the main alignment issues:

- The Bhubaneswar phone, heading, and realization cards now sit in a stable two-column layout.
- The scrapbook gift scene and the photo gallery no longer collide or drift outside the viewport.
- The distance and Holi scenes use responsive grids, so the text, suitcase, phone, candle, and cards do not overlap.
- The countdown is structurally separated from the footer and uses a responsive flex grid.
- Tilt interactions now retain each card's intended rotation instead of replacing it.

## Files

- `index.html` — structure and content
- `style.css` — visual design and responsive alignment
- `script.js` — countdown, ambience toggle, tilt, progress bar, and reveal effects

## Run locally

Open `index.html` directly, or start a local server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Hosting

Upload the three files to GitHub Pages, Netlify, Cloudflare Pages, or any standard static host. The external images, fonts, and GSAP resources need internet access when the page runs.
