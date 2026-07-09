/**
 * Export — Control Hub string builder + zip bundling.
 *
 * Control Hub "Custom Wallpaper Download URL" format:
 *   serv=<URL>;image=<filename>;thumbnail=<filename>;kem=<filename>;theme=<light/dark>;
 * Built from the article's field list. `serv` is the base URL where the
 * files are hosted (e.g. a GitHub Pages path) — the user fills that in
 * once, since it's their own hosting location, not something we can know.
 */

function filenameFor(device, kind) {
  // kind: "wallpaper" | "thumbnail" | "logo"
  return `${device.id}-${kind}.jpg`;
}

function buildControlHubString(device, baseUrl, theme = "dark") {
  const serv = baseUrl.replace(/\/$/, "");
  const image = filenameFor(device, "wallpaper");
  const parts = [`serv=${serv}/`, `image=${image}`];

  if (device.thumbnail) {
    parts.push(`thumbnail=${filenameFor(device, "thumbnail")}`);
  }
  if (device.id === "kem") {
    parts.push(`kem=${image}`);
  }
  parts.push(`theme=${theme}`);

  return parts.join(";") + ";";
}

/**
 * Bundle every generated blob into a single zip for download.
 * `assets` is an array of { filename, blob }.
 */
async function downloadZip(assets, zipName = "webex-wallpapers.zip") {
  const zip = new JSZip();
  assets.forEach(({ filename, blob }) => zip.file(filename, blob));

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function copyToClipboard(text, buttonEl) {
  navigator.clipboard.writeText(text).then(() => {
    const original = buttonEl.textContent;
    buttonEl.textContent = "Copied";
    buttonEl.classList.add("copied");
    setTimeout(() => {
      buttonEl.textContent = original;
      buttonEl.classList.remove("copied");
    }, 1400);
  });
}
