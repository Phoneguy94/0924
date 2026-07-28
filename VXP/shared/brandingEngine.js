// VXP Branding Engine
// Composites a source image and transparent PNG branding layer into one canvas.
// Consumers receive only the branded canvas/export, never a raw-image element.

export class VXPBrandingEngine {
  constructor(config = {}) {
    this.config = {
      overlay: '',
      outputType: 'image/png',
      outputQuality: 0.95,
      fit: 'cover',
      fileName: 'vxp-branded-image.png',
      ...config,
    };
  }

  async render({ source, canvas }) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new TypeError('A canvas element is required.');
    }
    if (!source) throw new Error('A source image URL is required.');
    if (!this.config.overlay) throw new Error('No overlay is configured.');

    // Both images must be CORS-readable for canvas export.
    const [photo, overlay] = await Promise.all([
      this.#loadImage(source),
      this.#loadImage(this.config.overlay),
    ]);

    const width = overlay.naturalWidth || photo.naturalWidth;
    const height = overlay.naturalHeight || photo.naturalHeight;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d', { alpha: true });
    context.clearRect(0, 0, width, height);
    this.#drawFitted(context, photo, width, height, this.config.fit);
    context.drawImage(overlay, 0, 0, width, height);

    return canvas;
  }

  async toBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed. Check image CORS settings.'))),
        this.config.outputType,
        this.config.outputQuality,
      );
    });
  }

  async download(canvas, fileName = this.config.fileName) {
    const blob = await this.toBlob(canvas);
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  async share(canvas, shareData = {}) {
    const blob = await this.toBlob(canvas);
    const file = new File([blob], shareData.fileName || this.config.fileName, { type: blob.type });
    if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
      await this.download(canvas, file.name);
      return false;
    }
    await navigator.share({
      title: shareData.title || document.title,
      text: shareData.text || '',
      files: [file],
    });
    return true;
  }

  #loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Unable to load image: ${url}`));
      image.src = url;
    });
  }

  #drawFitted(context, image, targetWidth, targetHeight, fit) {
    if (fit === 'contain') {
      const scale = Math.min(targetWidth / image.naturalWidth, targetHeight / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      context.drawImage(image, (targetWidth - width) / 2, (targetHeight - height) / 2, width, height);
      return;
    }

    const scale = Math.max(targetWidth / image.naturalWidth, targetHeight / image.naturalHeight);
    const sourceWidth = targetWidth / scale;
    const sourceHeight = targetHeight / scale;
    const sourceX = (image.naturalWidth - sourceWidth) / 2;
    const sourceY = (image.naturalHeight - sourceHeight) / 2;
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
  }
}
