import { VXPBrandingEngine } from '../../shared/brandingEngine.js';
import { EventConfig } from './eventConfig.js';

const canvas = document.querySelector('#brandedImage');
const status = document.querySelector('#status');
const downloadButton = document.querySelector('#downloadButton');
const shareButton = document.querySelector('#shareButton');
const params = new URLSearchParams(window.location.search);
const source = params.get('image') || params.get('src');

const engine = new VXPBrandingEngine({
  overlays: EventConfig.overlays,
  ...EventConfig.branding,
});

async function initialize() {
  document.querySelector('[data-event-name]').textContent = EventConfig.name;
  document.querySelector('[data-event-meta]').textContent = `${EventConfig.organization} • ${EventConfig.dates}`;

  if (!source) {
    showError('No generated image was supplied. Add ?image=IMAGE_URL to this page URL.');
    return;
  }

  try {
    status.textContent = 'Applying event branding…';
    await engine.render({ source, canvas });
    canvas.hidden = false;
    downloadButton.disabled = false;
    shareButton.disabled = false;
    status.textContent = `Your ${canvas.dataset.orientation} branded image is ready.`;
  } catch (error) {
    console.error(error);
    showError(error.message);
  }
}

function showError(message) {
  status.textContent = message;
  status.dataset.state = 'error';
}

downloadButton.addEventListener('click', () => engine.download(canvas));
shareButton.addEventListener('click', () => engine.share(canvas, {
  title: EventConfig.name,
  text: `${EventConfig.organization} — ${EventConfig.dates}`,
}));

initialize();
