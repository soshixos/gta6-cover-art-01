// Vice City Cover Studio — cover renderer.
// Draws a multi-panel GTA-style poster on any canvas: photo panels with a
// warm sunset grade, procedural palms and sun, neon panel seams, halftone
// dots, and big condensed caption lettering. No external assets, no network.

export const SIZES = {
  square: { w: 1080, h: 1080, label: '1080 x 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 x 1350' },
  wide: { w: 1920, h: 1080, label: '1920 x 1080' },
};

export const LAYOUTS = {
  classic: 'Classic — hero + two small panels',
  triptych: 'Triptych — three vertical panels',
  duo: 'Duo — two panels',
  solo: 'Solo — full-bleed single photo',
};

// One panel: where it sits on the cover (fractions of width/height) and
// which photo feeds it (index into the photos array, wrapped).
export function panelRects(layout, w, h) {
  const band = layout === 'solo' ? 0 : Math.round(h * 0.02);
  const gap = Math.max(6, Math.round(w * 0.008));
  if (layout === 'classic') {
    const heroW = Math.round(w * 0.62);
    const smallW = w - heroW - gap;
    const smallH = Math.round((h - gap) / 2);
    return [
      { x: 0, y: 0, w: heroW, h, photo: 0, hero: true },
      { x: heroW + gap, y: 0, w: smallW, h: smallH, photo: 1 },
      { x: heroW + gap, y: smallH + gap, w: smallW, h: h - smallH - gap, photo: 2 },
    ];
  }
  if (layout === 'triptych') {
    const pw = Math.round((w - gap * 2) / 3);
    return [0, 1, 2].map((i) => ({
      x: i * (pw + gap), y: 0, w: pw, h, photo: i, hero: i === 1,
    }));
  }
  if (layout === 'duo') {
    const pw = Math.round((w - gap) / 2);
    return [
      { x: 0, y: 0, w: pw, h, photo: 0, hero: true },
      { x: pw + gap, y: 0, w: w - pw - gap, h, photo: 1 },
    ];
  }
  return [{ x: 0, y: 0, w, h, photo: 0, hero: true }];
}

// Cover-fit draw of one photo into a rect, honouring zoom and focal point.
export function drawPhotoInto(ctx, img, rect, zoom, fx, fy) {
  if (!img) return false;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const cx = fx * dw;
  const cy = fy * dh;
  const dx = rect.x + rect.w / 2 - cx;
  const dy = rect.y + rect.h / 2 - cy;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
  return true;
}

// Warm sunset wash: magenta top, orange middle, teal shadows at the bottom.
export function sunsetWash(ctx, rect, strength) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  g.addColorStop(0, `rgba(255, 45, 149, ${0.22 * strength})`);
  g.addColorStop(0.45, `rgba(255, 120, 40, ${0.16 * strength})`);
  g.addColorStop(0.8, `rgba(0, 190, 190, ${0.10 * strength})`);
  g.addColorStop(1, `rgba(20, 0, 60, ${0.28 * strength})`);
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

export function vignette(ctx, rect) {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const r = Math.max(rect.w, rect.h) * 0.75;
  const g = ctx.createRadialGradient(cx, cy, r * 0.45, cx, cy, r);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(10,0,30,0.42)');
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

// A glowing sun disc with horizontal slats, drawn procedurally.
export function drawSunDisc(ctx, cx, cy, r) {
  const g = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  g.addColorStop(0, '#ffe95e');
  g.addColorStop(0.55, '#ff9a3d');
  g.addColorStop(1, '#ff2d95');
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.fillStyle = 'rgba(20,0,40,0.85)';
  for (let i = 0; i < 4; i += 1) {
    const y = cy + r * (0.05 + i * 0.22);
    ctx.fillRect(cx - r, y, r * 2, r * (0.03 + i * 0.02));
  }
  ctx.restore();
  ctx.save();
  ctx.shadowColor = '#ff2d95';
  ctx.shadowBlur = r * 0.35;
  ctx.strokeStyle = 'rgba(255,45,149,0.9)';
  ctx.lineWidth = Math.max(2, r * 0.03);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// One palm silhouette: curved trunk plus drooping fronds.
export function drawPalm(ctx, x, y, size, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.scale(size, size);
  ctx.strokeStyle = 'rgba(8,2,20,0.92)';
  ctx.fillStyle = 'rgba(8,2,20,0.92)';
  ctx.lineWidth = 0.09;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(0.12, -0.9, 0.05, -1.7);
  ctx.stroke();
  ctx.translate(0.05, -1.7);
  for (let i = 0; i < 7; i += 1) {
    const a = -Math.PI * 0.08 - (i * Math.PI) / 7.2;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(0.55, -0.18, 1.05, 0.28);
    ctx.quadraticCurveTo(0.5, 0.12, 0, 0);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

export function drawHalftone(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  const step = 26;
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      const d = 2 + 2.4 * Math.abs(Math.sin((x + y) * 0.004));
      ctx.beginPath();
      ctx.arc(x, y, d, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Neon seam strokes between panels plus a white outer frame.
export function drawSeams(ctx, rects, w, h) {
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(4, w * 0.006);
  ctx.strokeRect(2, 2, w - 4, h - 4);
  ctx.shadowColor = '#ff2d95';
  ctx.shadowBlur = 18;
  ctx.strokeStyle = '#ff5ec4';
  ctx.lineWidth = Math.max(3, w * 0.004);
  for (const r of rects) {
    if (r.x > 0) { ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x, r.y + r.h); ctx.stroke(); }
    if (r.y > 0) { ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x + r.w, r.y); ctx.stroke(); }
  }
  ctx.restore();
}

function captionFont(size, spacing) {
  // Anton when loaded, bold condensed system sans as the fallback.
  return `${size}px Anton, 'Arial Narrow', 'Helvetica Neue Condensed Bold', Impact, sans-serif`;
}

export function drawCaption(ctx, opts, w, h) {
  const { title, subtitle, style, position, size, spacing } = opts;
  const bandH = Math.round(h * (subtitle ? 0.24 : 0.19));
  const bandY = position === 'top' ? 0 : h - bandH;
  const g = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  if (position === 'top') {
    g.addColorStop(0, 'rgba(10,0,35,0.88)');
    g.addColorStop(1, 'rgba(10,0,35,0)');
  } else {
    g.addColorStop(0, 'rgba(10,0,35,0)');
    g.addColorStop(1, 'rgba(10,0,35,0.88)');
  }
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, bandY, w, bandH);
  const cx = w / 2;
  const titleSize = Math.round(size * (w / 1080));
  // Title sits in the upper half of the caption band, subtitle in the lower
  // half, so both stay inside the canvas at every export size.
  const baseY = position === 'top' ? bandH * 0.44 : h - bandH * 0.52;
  const subY = position === 'top' ? bandH * 0.84 : h - bandH * 0.14;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = captionFont(titleSize, spacing);
  // Letter-spacing is emulated by drawing with manual gaps via canvas
  // letterSpacing where supported, else plain fill.
  try { ctx.letterSpacing = `${Math.round(spacing * (w / 1080))}px`; } catch { /* older canvas */ }
  const titleText = (title || 'SUNSET HEIST').toUpperCase();
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(4, titleSize * 0.09);
  ctx.strokeStyle = 'rgba(10,0,35,0.95)';
  if (style === 'neon') {
    ctx.shadowColor = '#ff2d95';
    ctx.shadowBlur = titleSize * 0.45;
    ctx.fillStyle = '#ffffff';
  } else if (style === 'chrome') {
    const cg = ctx.createLinearGradient(0, baseY - titleSize * 0.55, 0, baseY + titleSize * 0.55);
    cg.addColorStop(0, '#ffffff');
    cg.addColorStop(0.45, '#c8d6ff');
    cg.addColorStop(0.55, '#5a6b9e');
    cg.addColorStop(1, '#f2f6ff');
    ctx.fillStyle = cg;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
  } else {
    const sg = ctx.createLinearGradient(0, baseY - titleSize * 0.55, 0, baseY + titleSize * 0.55);
    sg.addColorStop(0, '#ffe95e');
    sg.addColorStop(0.5, '#ff7a3d');
    sg.addColorStop(1, '#ff2d95');
    ctx.fillStyle = sg;
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
  }
  ctx.strokeText(titleText, cx, baseY);
  ctx.fillText(titleText, cx, baseY);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  if (subtitle) {
    const subSize = Math.round(titleSize * 0.30);
    ctx.font = `700 ${subSize}px 'Arial Narrow', Arial, sans-serif`;
    try { ctx.letterSpacing = `${Math.round(subSize * 0.35)}px`; } catch { /* noop */ }
    ctx.fillStyle = '#ffe9f5';
    ctx.strokeStyle = 'rgba(10,0,35,0.9)';
    ctx.lineWidth = Math.max(2, subSize * 0.12);
    ctx.strokeText(subtitle.toUpperCase(), cx, subY);
    ctx.fillText(subtitle.toUpperCase(), cx, subY);
  }
  ctx.restore();
}

// Full render. `state` holds photos, layout, caption options and per-panel
// zoom/focal settings. Returns true when at least one photo was drawn.
export function renderCover(canvas, state) {
  const size = SIZES[state.sizeKey] || SIZES.square;
  const w = size.w;
  const h = size.h;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#2b0a4e');
  sky.addColorStop(0.45, '#c22a7a');
  sky.addColorStop(0.75, '#ff7a3d');
  sky.addColorStop(1, '#ffb347');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const rects = panelRects(state.layout, w, h);
  let drew = false;
  for (const r of rects) {
    const photo = state.photos[r.photo % Math.max(1, state.photos.length)] || null;
    const panel = state.panels[r.photo] || { zoom: 1, fx: 0.5, fy: 0.5 };
    if (photo) drew = drawPhotoInto(ctx, photo, r, panel.zoom, panel.fx, panel.fy) || drew;
    sunsetWash(ctx, r, 0.9);
    vignette(ctx, r);
  }
  // Procedural sky dressing on the hero panel: a small slatted sun tucked
  // into the hero's top corner, clear of the photo's own sun, plus palms.
  const hero = rects.find((r) => r.hero) || rects[0];
  if (hero) {
    const sunR = Math.round(Math.min(hero.w, hero.h) * 0.085);
    drawSunDisc(ctx, hero.x + hero.w * 0.88, hero.y + hero.h * 0.12, sunR);
    drawPalm(ctx, hero.x + hero.w * 0.08, hero.y + hero.h * 0.98, hero.h * 0.16, 0.10);
    drawPalm(ctx, hero.x + hero.w * 0.94, hero.y + hero.h * 0.98, hero.h * 0.13, -0.12);
  }
  if (state.halftone) drawHalftone(ctx, w, h);
  drawSeams(ctx, rects, w, h);
  drawCaption(ctx, state.caption, w, h);
  return drew;
}
