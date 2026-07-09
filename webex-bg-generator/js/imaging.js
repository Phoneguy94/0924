/**
 * Imaging — canvas-based resize/crop/compress helpers.
 *
 * Two fit strategies are used deliberately:
 *  - COVER (crop-to-fill): wallpapers + thumbnails. No distortion,
 *    fills the whole target, crops overflow. Cisco warns that
 *    mismatched wallpaper dimensions "may be scaled to fit ... which
 *    may cause the image to become distorted" — cover avoids that.
 *  - CONTAIN (proportional fit): logos. Cisco already scales logos
 *    proportionally on its end, so we shouldn't crop them — just fit
 *    them inside the box and pad with transparency.
 */

/**
 * Draw `img` into a new canvas at (targetW x targetH) using cover-fit.
 * `offsetX`/`offsetY` are normalized 0..1 crop-position knobs
 * (0.5, 0.5 = centered) so the UI can support optional repositioning.
 */
function drawCover(img, targetW, targetH, offsetX = 0.5, offsetY = 0.5) {
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");

  const scale = Math.max(targetW / img.width, targetH / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;

  const maxX = drawW - targetW;
  const maxY = drawH - targetH;
  const x = -maxX * offsetX;
  const y = -maxY * offsetY;

  ctx.drawImage(img, x, y, drawW, drawH);
  return canvas;
}

/** Draw `img` into a new canvas at (targetW x targetH) using contain-fit. */
function drawContain(img, targetW, targetH) {
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");

  const scale = Math.min(targetW / img.width, targetH / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const x = (targetW - drawW) / 2;
  const y = (targetH - drawH) / 2;

  ctx.drawImage(img, x, y, drawW, drawH);
  return canvas;
}

/** Convert a canvas to a Blob, stepping JPEG quality down until under maxKB. */
async function canvasToLimitedBlob(canvas, maxKB, mime = "image/jpeg") {
  let quality = 0.92;
  let blob = await canvasToBlob(canvas, mime, quality);

  while (blob.size / 1024 > maxKB && quality > 0.35) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, mime, quality);
  }
  return { blob, quality, underLimit: blob.size / 1024 <= maxKB };
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
}

/** Load a File/Blob into an HTMLImageElement. */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
