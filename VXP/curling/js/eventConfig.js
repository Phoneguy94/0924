// Pirates of the Curl-Ribbean event configuration.
// Curling-only configuration: the engine automatically selects the overlay
// matching the generated image orientation.

// Resolve assets relative to this module so the same configuration works from
// /VXP/curling/, /VXP/curling/wall/, and any future nested page.
const portraitOverlay = new URL('../assets/pirates-overlay-portrait.png', import.meta.url).href;
const landscapeOverlay = new URL('../assets/pirates-overlay-landscape.png', import.meta.url).href;

export const EventConfig = Object.freeze({
  id: 'curling-pirates-2026',
  name: 'Pirates of the Curl-Ribbean',
  organization: 'Orlando Curling Club',
  dates: 'July 31 – August 2, 2026',
  overlays: Object.freeze({
    portrait: portraitOverlay,
    landscape: landscapeOverlay,
  }),
  branding: {
    fit: 'cover',
    outputType: 'image/png',
    outputQuality: 0.95,
    fileName: 'pirates-of-the-curl-ribbean.png',
  },
});