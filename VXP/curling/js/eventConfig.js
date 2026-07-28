// Pirates of the Curl-Ribbean event configuration.
// Curling-only configuration: the engine automatically selects the overlay
// matching the generated image orientation.
export const EventConfig = Object.freeze({
  id: 'curling-pirates-2026',
  name: 'Pirates of the Curl-Ribbean',
  organization: 'Orlando Curling Club',
  dates: 'July 31 – August 2, 2026',
  overlays: Object.freeze({
    portrait: './assets/pirates-overlay-portrait.png',
    landscape: './assets/pirates-overlay-landscape.png',
  }),
  branding: {
    fit: 'cover',
    outputType: 'image/png',
    outputQuality: 0.95,
    fileName: 'pirates-of-the-curl-ribbean.png',
  },
});
