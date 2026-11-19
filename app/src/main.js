// Vice City Cover Studio — editor wiring.
// Owns the page state, photo loading (picker, drag & drop, samples),
// per-panel zoom/focal controls, caption controls, layout/size pickers and
// PNG export. The drawing itself lives in cover.js; shot scenes in shots.js.
import { renderCover, SIZES, LAYOUTS } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('preview');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const statusEl = document.getElementById('status');
const thumbsEl = document.getElementById('thumbs');

const state = {
  photos: [],
  layout: 'classic',
  sizeKey: 'square',
  halftone: false,
  panels: {},
  caption: {
    title: 'Sunset Heist',
    subtitle: 'Vice City • 2026',
    style: 'sunset',
    position: 'bottom',
    size: 150,
    spacing: 4,
  },
};
let activePanel = 0;

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function panelOf(photoIndex) {
  if (!state.panels[photoIndex]) state.panels[photoIndex] = { zoom: 1, fx: 0.5, fy: 0.5 };
  return state.panels[photoIndex];
}

function redraw() {
  renderCover(canvas, state);
  syncThumbs();
}

function syncThumbs() {
  thumbsEl.innerHTML = '';
  state.photos.forEach((photo, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb' + (i === activePanel ? ' active' : '');
    btn.textContent = `Photo ${i + 1}`;
    btn.title = 'Click to edit this photo’s crop';
    btn.addEventListener('click', () => { activePanel = i; syncControls(); redraw(); });
    thumbsEl.appendChild(btn);
  });
  const hint = document.createElement('span');
  hint.className = 'thumb-hint';
  hint.textContent = state.photos.length ? `${state.photos.length} photo(s) loaded` : 'No photo yet — pick one or try a sample';
  thumbsEl.appendChild(hint);
}

function syncControls() {
  const p = panelOf(activePanel);
  document.getElementById('zoom').value = p.zoom;
  document.getElementById('zoomVal').textContent = `${p.zoom.toFixed(2)}x`;
}

async function addFiles(files) {
  const list = [...files].filter((f) => f.type.startsWith('image/')).slice(0, 3 - state.photos.length);
  for (const file of list) {
    const img = await loadImage(URL.createObjectURL(file));
    state.photos.push(img);
  }
  if (list.length) { activePanel = state.photos.length - 1; syncControls(); redraw(); status('Photo loaded — drag it on the preview to reposition.'); }
}

async function loadSample(name, captionText) {
  const img = await loadImage(`samples/${name}.png`);
  state.photos = [img];
  activePanel = 0;
  if (captionText) { state.caption.title = captionText; titleInput.value = captionText; }
  syncControls();
  redraw();
}

function status(text) { statusEl.textContent = text; }

function downloadBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function exportOne(sizeKey) {
  const size = SIZES[sizeKey];
  const off = document.createElement('canvas');
  renderCover(off, { ...state, sizeKey });
  off.toBlob((blob) => {
    if (!blob) { status('Export failed — try again.'); return; }
    downloadBlob(blob, `vice-city-cover-${size.w}x${size.h}.png`);
    status(`Saved vice-city-cover-${size.w}x${size.h}.png (${Math.round(blob.size / 1024)} KB).`);
  }, 'image/png');
}

// --- controls -------------------------------------------------------------
document.getElementById('photo').addEventListener('change', (e) => addFiles(e.target.files));

document.getElementById('sampleBoulevard').addEventListener('click', () => loadSample('boulevard'));
document.getElementById('samplePier').addEventListener('click', () => loadSample('pier'));

const layoutSel = document.getElementById('layout');
for (const [key, label] of Object.entries(LAYOUTS)) {
  const opt = document.createElement('option');
  opt.value = key;
  opt.textContent = label;
  layoutSel.appendChild(opt);
}
layoutSel.addEventListener('change', () => { state.layout = layoutSel.value; redraw(); });

const sizeSel = document.getElementById('size');
for (const [key, size] of Object.entries(SIZES)) {
  const opt = document.createElement('option');
  opt.value = key;
  opt.textContent = size.label;
  sizeSel.appendChild(opt);
}
sizeSel.addEventListener('change', () => { state.sizeKey = sizeSel.value; redraw(); });

titleInput.addEventListener('input', () => { state.caption.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.caption.subtitle = subtitleInput.value; redraw(); });

document.getElementById('style').addEventListener('change', (e) => { state.caption.style = e.target.value; redraw(); });
document.getElementById('position').addEventListener('change', (e) => { state.caption.position = e.target.value; redraw(); });
document.getElementById('capSize').addEventListener('input', (e) => {
  state.caption.size = Number(e.target.value);
  document.getElementById('capSizeVal').textContent = `${state.caption.size}px`;
  redraw();
});
document.getElementById('spacing').addEventListener('input', (e) => {
  state.caption.spacing = Number(e.target.value);
  document.getElementById('spacingVal').textContent = `${state.caption.spacing}px`;
  redraw();
});
document.getElementById('halftone').addEventListener('change', (e) => { state.halftone = e.target.checked; redraw(); });

document.getElementById('zoom').addEventListener('input', (e) => {
  panelOf(activePanel).zoom = Number(e.target.value);
  document.getElementById('zoomVal').textContent = `${panelOf(activePanel).zoom.toFixed(2)}x`;
  redraw();
});

// Drag on the preview repositions the active photo; click sets focal point.
let dragging = false;
function pointToFocal(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
}
canvas.addEventListener('pointerdown', (e) => { dragging = true; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const p = pointToFocal(e);
  panelOf(activePanel).fx = p.x;
  panelOf(activePanel).fy = p.y;
  redraw();
});
canvas.addEventListener('pointerup', (e) => {
  dragging = false;
  const p = pointToFocal(e);
  panelOf(activePanel).fx = p.x;
  panelOf(activePanel).fy = p.y;
  redraw();
});

// Drop photos straight onto a panel.
canvas.addEventListener('dragover', (e) => e.preventDefault());
canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
});

document.getElementById('export').addEventListener('click', () => exportOne(state.sizeKey));
document.getElementById('exportAll').addEventListener('click', () => {
  for (const key of Object.keys(SIZES)) exportOne(key);
  status('Exporting all three sizes…');
});

// --- shot mode / first paint ----------------------------------------------
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, loadSample, state, redraw);
} else {
  loadSample('pier').catch(() => redraw());
  redraw();
}
