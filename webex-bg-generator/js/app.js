/**
 * App controller — ties uploads to imaging.js output to the preview grid.
 */

const state = {
  wallpaperImg: null,
  logoImg: null,
  theme: "dark",
  offsets: {}
};

DEVICES.forEach((d) => (state.offsets[d.id] = { x: 0.5, y: 0.5 }));

const grid = document.getElementById("device-grid");
const wallpaperInput = document.getElementById("wallpaper-input");
const logoInput = document.getElementById("logo-input");
const baseUrlInput = document.getElementById("base-url");
const downloadAllBtn = document.getElementById("download-all");
const emptyState = document.getElementById("empty-state");
const logoRow = document.getElementById("logo-row");

wallpaperInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  state.wallpaperImg = await loadImage(file);
  emptyState.classList.add("hidden");
  grid.classList.remove("hidden");
  downloadAllBtn.classList.remove("hidden");
  renderGrid();
});

logoInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  state.logoImg = await loadImage(file);
  logoRow.classList.remove("hidden");
  renderGrid();
});

baseUrlInput.addEventListener("input", renderGrid);

document.querySelectorAll('input[name="theme"]').forEach((r) => {
  r.addEventListener("change", (e) => {
    state.theme = e.target.value;
    renderGrid();
  });
});

downloadAllBtn.addEventListener("click", async () => {
  const assets = [];
  for (const device of DEVICES) {
    const off = state.offsets[device.id];
    const wpCanvas = drawCover(state.wallpaperImg, device.wallpaper.w, device.wallpaper.h, off.x, off.y);
    const { blob: wpBlob } = await canvasToLimitedBlob(wpCanvas, device.maxFileSizeKB);
    assets.push({ filename: filenameFor(device, "wallpaper"), blob: wpBlob });

    if (device.thumbnail) {
      const thumbCanvas = drawCover(state.wallpaperImg, device.thumbnail.w, device.thumbnail.h, off.x, off.y);
      const { blob: thumbBlob } = await canvasToLimitedBlob(thumbCanvas, device.maxFileSizeKB);
      assets.push({ filename: filenameFor(device, "thumbnail"), blob: thumbBlob });
    }

    if (device.logo && state.logoImg) {
      const logoCanvas = drawContain(state.logoImg, device.logo.w, device.logo.h);
      const { blob: logoBlob } = await canvasToLimitedBlob(logoCanvas, device.maxFileSizeKB, "image/png");
      assets.push({ filename: filenameFor(device, "logo").replace(".jpg", ".png"), blob: logoBlob });
    }
  }
  downloadZip(assets);
});

function renderGrid() {
  if (!state.wallpaperImg) return;
  grid.innerHTML = "";
  DEVICES.forEach((device) => grid.appendChild(buildCard(device)));
}

function buildCard(device) {
  const off = state.offsets[device.id];
  const card = document.createElement("div");
  card.className = "card";

  const showLogo = Boolean(state.logoImg && device.logo);
  const logoHidden = device.logoHiddenOnMultiline && showLogo ? true : false;

  card.innerHTML = `
    <div class="card-head">
      <span class="tag">${device.tag}</span>
      <span class="model">${device.label}</span>
    </div>
    <div class="device-wrap">
      <div class="phone-shell phone-${device.id}">
        <div class="earpiece"></div>
        <div class="frame frame-${device.frame}">
          <div class="screen" data-screen></div>
          ${device.frame === "video" ? '<div class="camera-bar"></div>' : ""}
        </div>
        ${device.frame !== "kem" ? phoneHardware(device.id) : kemHardware()}
      </div>
    </div>
    <div class="card-meta">
      <span>${device.wallpaper.w}×${device.wallpaper.h}px</span>
      <span class="dot">·</span>
      <span>${device.maxFileSizeKB}KB cap</span>
    </div>
    ${device.logo
      ? `<label class="overlay-toggle">
           <input type="checkbox" data-toggle-logo ${showLogo ? "checked" : ""} ${!state.logoImg ? "disabled" : ""}/>
           <span>Show logo preview</span>
         </label>
         ${logoHidden ? `<p class="note">${MULTILINE_LOGO_NOTE}</p>` : ""}`
      : device.note ? `<p class="note">${device.note}</p>` : ""}
    <div class="chstring">
      <code data-chstring></code>
      <button class="copy-btn" data-copy>Copy</button>
    </div>
  `;

  const screenEl = card.querySelector("[data-screen]");
  renderScreen(screenEl, device, off, showLogo && !logoHidden);

  let dragging = false;
  screenEl.addEventListener("pointerdown", (e) => {
    dragging = true;
    screenEl.setPointerCapture(e.pointerId);
  });
  screenEl.addEventListener("pointerup", () => (dragging = false));
  screenEl.addEventListener("pointerleave", () => (dragging = false));
  screenEl.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const rect = screenEl.getBoundingClientRect();
    const nx = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const ny = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    state.offsets[device.id] = { x: nx, y: ny };
    renderScreen(screenEl, device, state.offsets[device.id], showLogo && !logoHidden);
  });

  const logoToggle = card.querySelector("[data-toggle-logo]");
  if (logoToggle) logoToggle.addEventListener("change", (e) => renderScreen(screenEl, device, off, e.target.checked));

  const chstringEl = card.querySelector("[data-chstring]");
  const baseUrl = baseUrlInput.value.trim() || "https://yourusername.github.io/repo-name";
  chstringEl.textContent = buildControlHubString(device, baseUrl, state.theme);
  card.querySelector("[data-copy]").addEventListener("click", (e) => copyToClipboard(chstringEl.textContent, e.target));

  return card;
}

function phoneHardware(id) {
  if (id === "8875") return '<div class="video-home"></div>';
  if (id === "9871") return '<div class="touch-dock"><span></span><span></span><span></span><span></span></div>';
  return '<div class="desk-buttons"><span></span><span></span><span></span><span></span></div><div class="stand"></div>';
}

function kemHardware() {
  return '<div class="kem-lines"><i></i><i></i><i></i><i></i><i></i><i></i></div>';
}

function renderScreen(screenEl, device, offset, withLogo) {
  screenEl.innerHTML = "";
  const canvas = drawCover(state.wallpaperImg, device.wallpaper.w, device.wallpaper.h, offset.x, offset.y);
  canvas.className = "screen-canvas";
  screenEl.appendChild(canvas);

  const overlay = document.createElement("div");
  overlay.className = `ui-overlay ui-${device.id} theme-${state.theme}`;

  if (withLogo && state.logoImg) {
    const logoCanvas = drawContain(state.logoImg, device.logo.w, device.logo.h);
    logoCanvas.className = "logo-canvas";
    overlay.appendChild(logoCanvas);
  } else if (device.frame !== "kem") {
    overlay.appendChild(buildIdleUi(device.id));
  } else {
    overlay.appendChild(buildKemUi());
  }

  screenEl.appendChild(overlay);
}

function buildIdleUi(id) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const box = document.createElement("div");
  box.className = "idle-ui";

  if (id === "9851" || id === "9861") {
    box.innerHTML = `
      <div class="statusbar">Webex Calling <span>${time}</span></div>
      <div class="left-clock"><b>${time}</b><small>${date}</small></div>
      <div class="line-stack"><span>Line 1</span><span>Shared</span><span>Voicemail</span></div>
      <div class="softbar"><span>Recents</span><span>Directory</span><span>More</span></div>`;
  } else if (id === "9871") {
    box.innerHTML = `
      <div class="statusbar">Webex <span>1001</span></div>
      <div class="giant-clock"><b>${time}</b><small>${date}</small></div>
      <div class="touch-icons"><span>Recents</span><span>Messages</span><span>Meetings</span></div>`;
  } else {
    box.innerHTML = `
      <div class="video-status">Webex Calling</div>
      <div class="giant-clock video-clock"><b>${time}</b><small>${date}</small></div>
      <div class="video-dock"><span>Call</span><span>Meetings</span><span>Settings</span></div>`;
  }
  return box;
}

function buildKemUi() {
  const box = document.createElement("div");
  box.className = "kem-ui";
  box.innerHTML = '<span>BLF 1</span><span>BLF 2</span><span>Park</span><span>Reception</span>';
  return box;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
