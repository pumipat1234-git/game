/* Procedural pixel-art toolkit. All art in /assets is PLACEHOLDER art generated in code,
   structured as frame sheets so real art can replace it (see README). */
E.FRAMES = ['idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'walk3', 'atk0', 'atk1', 'atk2', 'hurt', 'dead'];

E.PG = {
  canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; },
  css(n) { return typeof n === 'string' ? n : '#' + n.toString(16).padStart(6, '0'); },
  /* Brighten (f>1) or darken (f<1) a css/int colour. */
  sh(col, f) {
    const n = typeof col === 'string' ? parseInt(col.slice(1), 16) : col;
    const r = Math.min(255, (n >> 16 & 255) * f), g = Math.min(255, (n >> 8 & 255) * f), b = Math.min(255, (n & 255) * f);
    return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  },
  /* Returns a rect-draw function bound to ctx with optional x/y offset. */
  pen(ctx, ox = 0, oy = 0) {
    return (x, y, w, h, c) => { ctx.fillStyle = this.css(c); ctx.fillRect(Math.round(x + ox), Math.round(y + oy), w, h); };
  },
  /* Pixel line with square brush. */
  line(P, x0, y0, x1, y1, w, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx + dy;
    for (let i = 0; i < 200; i++) {
      P(x0, y0, w, w, c); if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; }
    }
  },
  /* 1px dark outline around opaque pixels inside a rectangle of the canvas. */
  outline(ctx, x, y, w, h, col = '#0a0a18') {
    const id = ctx.getImageData(x, y, w, h), d = id.data, out = new Uint8ClampedArray(d);
    const n = parseInt(col.slice(1), 16), R = n >> 16 & 255, G = n >> 8 & 255, B = n & 255;
    const a = (i, j) => (i < 0 || j < 0 || i >= w || j >= h) ? 0 : d[(j * w + i) * 4 + 3];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      if (a(i, j) > 20) continue;
      if (a(i - 1, j) > 20 || a(i + 1, j) > 20 || a(i, j - 1) > 20 || a(i, j + 1) > 20) { const k = (j * w + i) * 4; out[k] = R; out[k + 1] = G; out[k + 2] = B; out[k + 3] = 255; }
    }
    id.data.set(out); ctx.putImageData(id, x, y);
  },
  /* Register a canvas as a texture with NEAREST filtering. frames: array of names laid out in a row. */
  register(scene, key, canvas, frames, fw, fh) {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const tex = scene.textures.addCanvas(key, canvas);
    tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
    if (frames) frames.forEach((n, i) => tex.add(n, 0, i * fw, 0, fw, fh));
    return tex;
  },
  /* Build an 11-frame character sheet. draw(P, state) paints one frame on a fw x fh cell. */
  sheet(scene, key, fw, fh, draw) {
    const [c, ctx] = this.canvas(fw * E.FRAMES.length, fh);
    const states = {
      idle0: { b: 0, ph: -1, atk: -1 }, idle1: { b: 1, ph: -1, atk: -1 },
      walk0: { b: 0, ph: 0, atk: -1 }, walk1: { b: 1, ph: 1, atk: -1 }, walk2: { b: 0, ph: 2, atk: -1 }, walk3: { b: 1, ph: 3, atk: -1 },
      atk0: { b: 0, ph: -1, atk: 0 }, atk1: { b: 0, ph: -1, atk: 1 }, atk2: { b: 0, ph: -1, atk: 2 }, hurt: { b: 0, ph: -1, atk: -1, hurt: true }
    };
    const cells = {};
    E.FRAMES.forEach((name, i) => {
      if (name === 'dead') return;
      draw(this.pen(ctx, i * fw, 0), states[name], fw, fh);
      this.outline(ctx, i * fw, 0, fw, fh);
      cells[name] = i;
    });
    // dead: idle frame rotated to lie on the ground, darkened
    const di = E.FRAMES.indexOf('dead'), [tc, tx] = this.canvas(fw, fh);
    tx.drawImage(c, 0, 0, fw, fh, 0, 0, fw, fh);
    ctx.save(); ctx.translate(di * fw + fw / 2, fh - fw / 2 + 2); ctx.rotate(Math.PI / 2); ctx.globalAlpha = 0.85;
    ctx.drawImage(tc, -fw / 2, -fh / 2 - 2); ctx.restore();
    ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(10,8,20,0.45)'; ctx.fillRect(di * fw, 0, fw, fh); ctx.globalCompositeOperation = 'source-over';
    return this.register(scene, key, c, E.FRAMES, fw, fh);
  },
  /* radial glow texture */
  glow(scene, key, size, rgb) {
    const [c, x] = this.canvas(size, size), g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, `rgba(${rgb},0.95)`); g.addColorStop(0.35, `rgba(${rgb},0.4)`); g.addColorStop(1, `rgba(${rgb},0)`);
    x.fillStyle = g; x.fillRect(0, 0, size, size);
    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.textures.addCanvas(key, c);
  }
};
