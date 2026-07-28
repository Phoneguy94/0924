# VXP Branding Engine — Curling Implementation

This folder is an isolated first implementation of a generic VXP Branding Engine. No existing MLB, NBA, FLGISA, USA250, launcher, camera, wall, photo, claim, Airtable, or SMS files are changed.

## Architecture

- `VXP/shared/brandingEngine.js` — reusable engine that loads a source image and transparent PNG overlay, composites them with Canvas, and exports/shares only the finished image.
- `VXP/curling/js/eventConfig.js` — event-specific configuration. The overlay path and export settings live here, not in the engine.
- `VXP/curling/js/photoPage.js` — Curling page controller that connects the event configuration to the shared engine.
- `VXP/curling/photo.html` — branded-image display and save/share page.
- `VXP/curling/index.html` — isolated Curling landing page.
- `VXP/curling/wall.html` — safe test/integration information page; it does not replace the existing VXP wall.
- `VXP/curling/assets/` — event branding files.

## How overlays work

1. The page receives the generated image URL through `?image=...` or `?src=...`.
2. JavaScript loads the source image directly into memory. It is never added to the page as a raw `<img>` element.
3. The engine loads the configured transparent PNG overlay.
4. Canvas scales/crops the generated image to the overlay dimensions.
5. Canvas paints the overlay on top.
6. The page displays only the composite canvas.
7. Save and share actions export only the composite canvas.

The remote image host must allow anonymous CORS access or browsers will block Canvas export.

## Pirates configuration

`VXP/curling/js/eventConfig.js` points to:

`./assets/pirates-overlay.png`

Upload the approved PNG to:

`VXP/curling/assets/pirates-overlay.png`

## Add a future overlay/event

1. Create a new event folder, for example `VXP/halloween/`.
2. Copy the Curling HTML, CSS, and controller structure.
3. Create an event configuration that points to the new overlay:

```js
export const EventConfig = Object.freeze({
  id: 'halloween-2026',
  name: 'Halloween',
  overlay: './assets/halloween-overlay.png',
  branding: {
    fit: 'cover',
    outputType: 'image/png',
    fileName: 'halloween-vxp.png',
  },
});
```

4. Keep importing the same shared engine from `VXP/shared/brandingEngine.js`.
5. Drop the new PNG into the event assets folder. No engine changes are required.

## Enable branding inside another existing experience later

When ready to integrate an existing experience, import `VXPBrandingEngine`, pass its generated image URL to `render()`, and replace its raw-image display/download path with the returned canvas. Do this one experience at a time so existing production flows remain unchanged until tested.

## Test URL

After uploading the PNG:

`https://phoneguy94.github.io/0924/VXP/curling/photo.html?image=PUBLIC_IMAGE_URL`
