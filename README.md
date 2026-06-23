# Lipi Anniversary — Part IV (Release Gate)

This version shows only the Mr Bean waiting screen and a live countdown until **24 June 2026, 12:00 AM IST**.

At the release time, the page automatically reloads and launches the full Part IV experience.

## Upload
Upload all contents of this folder to your GitHub Pages / Netlify / Cloudflare Pages deployment.

## Important
This is a client-side release gate because it is a static website. It creates the intended experience for visitors, but static hosting cannot fully prevent someone from viewing source files or changing their device clock.

## Test before launch
To preview the full website before the release time, temporarily change this line near the top of `script.js`:

```js
const RELEASE_AT = Date.UTC(2026, 5, 23, 18, 30, 0);
```

Set it to any time in the past, test locally, then restore the original value before deploying.


## Release gate media
The pre-release gate uses the supplied Mr Bean MP4 video, displayed with `object-fit: contain` so the full video remains visible without cropping.
