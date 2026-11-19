// Deterministic scenes for screenshots: ?shot=cover shows only the cover
// canvas; ?shot=editor shows the full editor with a sample photo loaded.
// `layout`, `photo` and `caption` come from the query string. After the
// paint settles, window.__shotReady is set; in shot mode an offscreen
// 1080x1080 export is also rendered and window.__exportOk is set with the
// byte count in document.title, so headless verification can confirm export.
import { renderCover } from './cover.js';

export async function runShot(shot, query, load, state, draw) {
  const layout = query.get('layout') || 'classic';
  const photoName = query.get('photo') || 'pier';
  const caption = query.get('caption') || 'Sunset Heist';
  const sizeKey = query.get('size');
  if (sizeKey === 'square' || sizeKey === 'portrait' || sizeKey === 'wide') state.sizeKey = sizeKey;
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'cover2' || shot === 'story') document.body.classList.add('shot-cover');
  state.layout = layout;
  state.caption.title = caption;
  await load(photoName, caption);
  draw();
  // Wait for the Anton font (or its fallback) before the final paint.
  try { await document.fonts.ready; } catch { /* font API unavailable */ }
  draw();
  // Offscreen export check: render the same cover at 1080x1080 and blob it.
  const off = document.createElement('canvas');
  const exportState = { ...state, sizeKey: 'square' };
  renderCover(off, exportState);
  await new Promise((resolve) => {
    off.toBlob((blob) => {
      if (blob && blob.size > 10000) {
        window.__exportOk = true;
        document.title = `export:${blob.size}`;
      }
      resolve();
    }, 'image/png');
  });
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
