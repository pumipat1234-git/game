/* Placeholder environment art: town ground, buildings, battle arenas, world map. */
E.TOWN_POS = { // display coords (1280x720) of each clickable building (centre-bottom)
  command:  { x: 640, y: 300, name: 'Command Hall',     panel: 'Command',    desc: 'Quests, taxes & Bastion upgrades' },
  barracks: { x: 290, y: 330, name: 'Barracks',         panel: 'Barracks',   desc: 'Heroes, skills, equipment & promotion' },
  recruit:  { x: 990, y: 330, name: 'Recruitment Hall', panel: 'Recruit',    desc: 'Hire new heroes' },
  smith:    { x: 330, y: 560, name: 'Blacksmith',       panel: 'Blacksmith', desc: 'Craft & upgrade equipment' },
  training: { x: 640, y: 580, name: 'Training Ground',  panel: 'Training',   desc: 'Heroes gain experience over time' },
  gate:     { x: 970, y: 570, name: 'Expedition Gate',  panel: 'Expedition', desc: 'Enter dungeons, farm resources' }
};

E.TownSprites = {
  build(scene) {
    this.ground(scene);
    this.buildings(scene);
    for (const pal in E.PALS) this.arena(scene, pal);
    this.worldMap(scene);
    E.PG.glow(scene, 'glow_orange', 96, '255,160,60'); E.PG.glow(scene, 'glow_white', 64, '255,240,200');
    E.PG.glow(scene, 'glow_purple', 128, '170,100,255');
  },
  noise(rnd, w, h, scale) { // value noise grid
    const gw = Math.ceil(w / scale) + 2, gh = Math.ceil(h / scale) + 2, g = [];
    for (let i = 0; i < gw * gh; i++) g.push(rnd());
    return (x, y) => {
      const gx = x / scale, gy = y / scale, ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy;
      const a = g[iy * gw + ix], b = g[iy * gw + ix + 1], c = g[(iy + 1) * gw + ix], d = g[(iy + 1) * gw + ix + 1];
      return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
    };
  },
  tree(P, x, y, s, dark) { // small pixel pine/dead tree, base at (x,y)
    P(x - 1, y - 6 * s, 2 * s, 6 * s, '#2a1d18');
    const g = dark ? ['#16301f', '#1d3d29', '#265235'] : ['#1f4a2e', '#28603a', '#337a48'];
    for (let i = 0; i < 4; i++) { const w = (3 + i * 2) * s; P(x - w / 2, y - (14 - i * 3) * s, w, 3 * s, g[i % 3]); }
    P(x - 1 * s, y - 16 * s, 2 * s, 2 * s, g[2]);
  },
  ground(scene) {
    const W = 640, H = 360, [c, ctx] = E.PG.canvas(W, H), P = E.PG.pen(ctx), rnd = E.U.rng(77), nz = this.noise(rnd, W, H, 18);
    const grass = ['#1c3a33', '#21443a', '#28503f', '#183228'];
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
      const n = nz(x, y) + (rnd() - 0.5) * 0.25; P(x, y, 2, 2, grass[Math.min(3, Math.max(0, Math.floor(n * 4)))]);
    }
    for (let i = 0; i < 700; i++) { const x = Math.floor(rnd() * W), y = Math.floor(rnd() * H); P(x, y, 1, 2, rnd() < 0.5 ? '#35684f' : '#102a20'); }
    // cobbled paths between buildings
    const pts = Object.values(E.TOWN_POS).map(b => ({ x: b.x / 2, y: b.y / 2 }));
    const hub = { x: 320, y: 215 };
    const path = (a, b2) => {
      const n = 60; for (let i = 0; i <= n; i++) {
        const t = i / n, x = a.x + (b2.x - a.x) * t, y = a.y + (b2.y - a.y) * t;
        for (let k = 0; k < 9; k++) { const dx = (rnd() - 0.5) * 12, dy = (rnd() - 0.5) * 12; P(x + dx, y + dy, 3, 2, ['#4a4a5e', '#3a3a4c', '#55556a', '#2e2e3e'][Math.floor(rnd() * 4)]); }
      }
    };
    pts.forEach(p => path(hub, p));
    // plaza
    for (let i = 0; i < 160; i++) { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 34; P(hub.x + Math.cos(a) * r, hub.y + Math.sin(a) * r * 0.6, 4, 3, ['#4a4a5e', '#5c5c72', '#3a3a4c'][Math.floor(rnd() * 3)]); }
    // fountain-like crystal obelisk at hub
    P(hub.x - 4, hub.y - 12, 8, 14, '#2c3870'); P(hub.x - 2, hub.y - 18, 4, 8, '#8a4be8'); P(hub.x - 1, hub.y - 20, 2, 3, '#c49bff'); P(hub.x - 6, hub.y + 2, 12, 3, '#1f2850');
    // ruined wall segments
    const wall = (x, y, w, h) => { P(x, y, w, h, '#3a3a4c'); P(x, y, w, 2, '#5a5a70'); for (let i = 0; i < w; i += 6) P(x + i, y + 3, 5, 1, '#2a2a38'); if (w > 20) P(x + w * 0.4, y - 4, 8, 4, '#3a3a4c'); };
    wall(20, 68, 60, 9); wall(560, 70, 55, 9); wall(10, 330, 80, 9); wall(540, 328, 90, 9); wall(8, 150, 8, 40); wall(626, 140, 8, 50);
    // trees on edges + scatter
    for (let i = 0; i < 70; i++) {
      const x = rnd() * W, y = rnd() * H;
      const edge = x < 36 || x > W - 36 || y < 70 || y > H - 22;
      if (!edge && rnd() < 0.85) continue;
      if (pts.some(p => Math.hypot(p.x - x, p.y - y) < 55) || Math.hypot(hub.x - x, hub.y - y) < 60) continue;
      this.tree(P, x, y, 1 + (rnd() < 0.3 ? 1 : 0), true);
    }
    // purple crystal shards & flowers
    for (let i = 0; i < 26; i++) { const x = rnd() * W, y = 75 + rnd() * 270; if (pts.some(p => Math.hypot(p.x - x, p.y - y) < 40)) continue; P(x, y - 5, 2, 5, '#8a4be8'); P(x - 1, y - 3, 1, 3, '#5b2fb0'); P(x + 2, y - 3, 1, 3, '#c49bff'); }
    E.PG.register(scene, 'town_ground', c);
  },
  /* ---- Buildings. Each is drawn at ~1x then displayed at 2x. ---- */
  buildings(scene) {
    const mk = (key, w, h, fn) => { const [c, ctx] = E.PG.canvas(w, h), P = E.PG.pen(ctx); fn(P, w, h); E.PG.outline(ctx, 0, 0, w, h); E.PG.register(scene, key, c); };
    const S = E.PG.sh;
    const stone = (P, x, y, w, h, base = '#4a4e66') => { P(x, y, w, h, base); P(x, y, w, 2, S(base, 1.35)); P(x + w - 3, y + 2, 3, h - 2, S(base, 0.7)); for (let j = 4; j < h; j += 6) for (let i = (j / 6) % 2 ? 0 : 4; i < w; i += 8) P(x + i, y + j, 6, 1, S(base, 0.75)); };
    const win = (P, x, y, w = 5, h = 7) => { P(x - 1, y - 1, w + 2, h + 2, '#1a1a28'); P(x, y, w, h, '#f2b84a'); P(x, y, w, 2, '#fff0b0'); P(x + w / 2 | 0, y, 1, h, '#8a5a1a'); };
    const roof = (P, x, y, w, h, col) => { for (let i = 0; i < h; i++) { const inset = Math.floor(i * (w / 2 - 3) / h); P(x + inset, y + i, w - inset * 2, 1, i % 3 === 0 ? S(col, 1.25) : col); } P(x + w / 2 - 1, y - 2, 2, 3, '#d4a84a'); };
    const flag = (P, x, y, col) => { P(x, y, 1, 14, '#6a5a3a'); P(x + 1, y + 1, 8, 6, col); P(x + 1, y + 1, 8, 1, S(col, 1.3)); P(x + 7, y + 3, 2, 2, S(col, 0.7)); };
    // Command Hall (keep with 2 towers)
    mk('b_command', 120, 100, (P, w, h) => {
      stone(P, 30, 40, 60, 56, '#4d5273'); roof(P, 24, 18, 72, 24, '#2a2f66');
      stone(P, 6, 30, 26, 66, '#434868'); stone(P, 88, 30, 26, 66, '#434868'); roof(P, 2, 8, 34, 24, '#3b2a8a'); roof(P, 84, 8, 34, 24, '#3b2a8a');
      win(P, 14, 46); win(P, 98, 46); win(P, 40, 52); win(P, 76, 52); P(52, 70, 16, 26, '#1a1220'); P(54, 72, 12, 24, '#3a2418'); P(59, 72, 2, 24, '#d4a84a'); P(55, 66, 10, 4, '#d4a84a');
      flag(P, 58, 0, '#8a4be8'); flag(P, 18, -2 + 4, '#c0392b'); P(40, 36, 40, 4, '#d4a84a');
    });
    mk('b_barracks', 112, 80, (P, w, h) => {
      stone(P, 10, 34, 92, 44, '#454a60'); roof(P, 4, 12, 104, 24, '#2b3a58');
      for (let i = 0; i < 4; i++) win(P, 20 + i * 22, 44); P(46, 58, 20, 20, '#1a1220'); P(48, 60, 16, 18, '#4a2f1d'); P(55, 60, 2, 18, '#b0873a');
      flag(P, 16, 0, '#c0392b'); flag(P, 88, 0, '#c0392b'); P(30, 70, 10, 8, '#6a4a2a'); P(32, 66, 2, 5, '#cfd5e6'); P(36, 66, 2, 5, '#cfd5e6'); // weapon crate
    });
    mk('b_training', 120, 80, (P, w, h) => {
      P(4, 20, 112, 56, '#6a5a44'); for (let i = 0; i < 120; i++) P(6 + (i * 37) % 108, 22 + (i * 17) % 52, 2, 1, i % 2 ? '#7a6a52' : '#54463a');
      for (let i = 0; i < 12; i++) { P(4 + i * 10, 14, 2, 14, '#4a3422'); P(4 + i * 10, 70, 2, 12, '#4a3422'); } P(4, 18, 112, 2, '#5a4430'); P(4, 74, 112, 2, '#5a4430');
      const dummy = x => { P(x + 5, 30, 2, 28, '#5a4430'); P(x, 36, 12, 3, '#5a4430'); P(x + 2, 26, 8, 8, '#c8b078'); P(x + 3, 40, 6, 12, '#b09860'); P(x + 4, 30, 1, 1, '#222'); P(x + 7, 30, 1, 1, '#222'); P(x, 48, 12, 2, '#8a2a2a'); };
      dummy(24); dummy(78); // rack
      P(52, 32, 18, 3, '#4a3422'); P(52, 45, 18, 3, '#4a3422'); for (let i = 0; i < 4; i++) { P(54 + i * 4, 22, 1, 20, '#cfd5e6'); P(53 + i * 4, 38, 3, 2, '#8a6a2a'); }
      flag(P, 100, 4, '#c0392b');
    });
    mk('b_smith', 100, 84, (P, w, h) => {
      stone(P, 10, 34, 76, 46, '#4a4448'); roof(P, 4, 16, 88, 20, '#3a2a30'); stone(P, 68, 10, 14, 34, '#3a3438'); P(70, 6, 10, 6, '#2a2428'); P(72, 2, 6, 5, '#ff7a2a'); P(74, 0, 2, 3, '#ffd080');
      win(P, 20, 44); P(40, 52, 24, 28, '#1a0e0a'); P(42, 56, 20, 22, '#ff7a2a'); P(46, 60, 12, 16, '#ffb02a'); P(50, 66, 4, 10, '#ffe080');
      P(78, 66, 16, 4, '#2a2a34'); P(80, 62, 12, 4, '#5a5a6a'); P(84, 70, 4, 10, '#2a2a34'); P(76, 60, 6, 2, '#5a5a6a'); // anvil
      P(14, 68, 3, 12, '#6a4a2a'); P(12, 66, 7, 3, '#5a5a6a');
    });
    mk('b_recruit', 108, 84, (P, w, h) => {
      P(10, 36, 88, 46, '#5a4030'); for (let i = 0; i < 88; i += 8) P(10 + i, 36, 2, 46, '#3a2820'); P(10, 54, 88, 2, '#3a2820');
      roof(P, 4, 10, 100, 28, '#5a2a6a'); win(P, 22, 44, 7, 8); win(P, 78, 44, 7, 8);
      P(44, 56, 20, 26, '#1a1220'); P(46, 58, 16, 24, '#4a2f1d'); P(52, 58, 2, 24, '#b0873a'); P(48, 52, 12, 4, '#d4a84a');
      P(96, 40, 2, 20, '#4a3422'); P(98, 44, 8, 10, '#2a2f66'); P(100, 46, 4, 4, '#d4a84a'); P(8, 74, 8, 8, '#6a4a2a'); P(10, 72, 4, 3, '#8a6a3a'); // sign + barrel
      flag(P, 52, 0, '#d4a84a');
    });
    mk('b_gate', 120, 100, (P, w, h) => {
      stone(P, 4, 30, 30, 66, '#444862'); stone(P, 86, 30, 30, 66, '#444862'); roof(P, 0, 8, 38, 24, '#2a2548'); roof(P, 82, 8, 38, 24, '#2a2548');
      stone(P, 30, 26, 60, 14, '#4d5273'); for (let i = 0; i < 6; i++) P(32 + i * 10, 22, 6, 5, '#4d5273');
      // portal
      for (let r = 28; r > 0; r -= 3) { const col = ['#2a0f5a', '#4a1f9a', '#6a2fd0', '#8a4be8', '#b78bff', '#e0c8ff'][Math.floor((28 - r) / 5)] || '#fff'; P(60 - r * 0.7, 94 - r * 2.1, r * 1.4, r * 2.1, col); }
      P(36, 40, 48, 56, 'rgba(0,0,0,0)'); P(34, 40, 4, 56, '#3a3e58'); P(82, 40, 4, 56, '#3a3e58');
      P(12, 40, 4, 8, '#8a4be8'); P(104, 40, 4, 8, '#8a4be8'); P(13, 41, 2, 4, '#e0c8ff'); P(105, 41, 2, 4, '#e0c8ff');
      flag(P, 56, 0, '#8a4be8');
    });
  },
  /* ---- Arena floors for each region ---- */
  arena(scene, pal) {
    const W = 640, H = 360, [c, ctx] = E.PG.canvas(W, H), P = E.PG.pen(ctx), seed = { forest: 5, frost: 6, ash: 7, abyss: 8, capital: 9 }[pal], rnd = E.U.rng(seed), nz = this.noise(rnd, W, H, 22);
    const base = { forest: ['#1a2c24', '#203a2e', '#27463a', '#142219'], frost: ['#2a3c58', '#34496a', '#42597d', '#1f2d46'], ash: ['#251614', '#32201c', '#40281f', '#190e0c'], abyss: ['#150f2a', '#1e1540', '#291d58', '#0e0a1e'], capital: ['#2a2430', '#363040', '#443d52', '#1d1822'] }[pal];
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) { const n = nz(x, y) + (rnd() - 0.5) * 0.22; P(x, y, 2, 2, base[Math.min(3, Math.max(0, Math.floor(n * 4)))]); }
    const accent = E.PALS[pal];
    if (pal === 'capital') for (let y = 0; y < H; y += 24) for (let x = 0; x < W; x += 24) { P(x, y, 24, 1, '#17131c'); P(x, y, 1, 24, '#17131c'); if (rnd() < 0.15) P(x + 2, y + 2, 20, 20, '#4a4258'); }
    for (let i = 0; i < 90; i++) {
      const x = rnd() * W, y = 40 + rnd() * 300;
      if (pal === 'forest') { P(x, y, 1, 3, '#35684f'); P(x + 1, y + 1, 1, 2, '#102a20'); if (rnd() < 0.2) P(x, y, 3, 2, '#3a3a48'); }
      else if (pal === 'frost') { if (rnd() < 0.6) P(x, y, 2, 1, '#e8f4ff'); else { P(x, y, 2, 4, '#8cc4ff'); P(x + 1, y + 1, 1, 3, '#c6e3ff'); } }
      else if (pal === 'ash') { if (rnd() < 0.5) { P(x, y, 5, 1, '#ff7a2a'); P(x + 2, y + 1, 1, 3, '#ff7a2a'); P(x, y, 5, 1, '#ffb02a'); } else P(x, y, 4, 3, '#5a3a30'); }
      else if (pal === 'abyss') { P(x, y, 1, 4, '#c43dff'); P(x + 1, y + 3, 3, 1, '#ff4dd2'); if (rnd() < 0.3) P(x, y, 3, 3, '#3a2870'); }
      else { P(x, y, 3, 1, '#f2d98a'); if (rnd() < 0.3) P(x, y, 2, 6, '#2a2430'); }
    }
    // distant trees / pillars along the north and south edge, then vignette
    for (let i = 0; i < 26; i++) {
      const x = 8 + i * 25 + rnd() * 10;
      for (const y of [48, 346]) {
        if (pal === 'forest') this.tree(P, x, y + rnd() * 4, 2, true);
        else if (pal === 'frost') { P(x, y - 14, 5, 14, '#8cc4ff'); P(x + 1, y - 18, 3, 5, '#c6e3ff'); }
        else if (pal === 'ash') { P(x, y - 12, 7, 12, '#2a1a16'); P(x + 1, y - 16, 4, 5, '#3a2420'); P(x + 2, y - 10, 2, 8, '#ff7a2a'); }
        else if (pal === 'abyss') { P(x, y - 16, 4, 16, '#3a1f7a'); P(x + 1, y - 22, 2, 7, '#c43dff'); }
        else { P(x, y - 22, 8, 22, '#4a4258'); P(x - 1, y - 24, 10, 3, '#6a6278'); P(x + 1, y - 16, 2, 8, '#2a2430'); }
      }
    }
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(3,3,12,0.7)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    E.PG.register(scene, 'arena_' + pal, c);
  },
  worldMap(scene) {
    const W = 380, H = 220, [c, ctx] = E.PG.canvas(W, H), P = E.PG.pen(ctx), rnd = E.U.rng(1234), nz = this.noise(rnd, W, H, 14);
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) P(x, y, 2, 2, nz(x, y) > 0.55 ? '#13203c' : '#0f1a32');
    const blobs = [[0.14, 0.42, 38], [0.30, 0.62, 52], [0.45, 0.38, 46], [0.62, 0.2, 42], [0.80, 0.55, 46], [0.86, 0.82, 36], [0.6, 0.5, 40], [0.5, 0.65, 30], [0.22, 0.5, 34], [0.7, 0.35, 34]];
    const land = (x, y) => { let v = 0; for (const [bx, by, r] of blobs) { const d = Math.hypot(x - bx * W, (y - by * H) * 1.2); v = Math.max(v, 1 - d / r); } return v + (nz(x, y) - 0.5) * 0.5; };
    const cols = { forest: ['#1f4a2e', '#2a603a'], frost: ['#7aa0c8', '#b8d8f0'], ash: ['#4a2a22', '#6a3a28'], abyss: ['#2a1a50', '#4a2a90'], capital: ['#5a4a30', '#8a7240'] };
    const regs = E.DUNGEONS.map(d => ({ pal: d.pal, x: d.mapPos[0] * W, y: d.mapPos[1] * H }));
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
      const l = land(x, y); if (l < 0.18) continue;
      let col = l < 0.26 ? '#a89a70' : l < 0.4 ? '#2c4a34' : '#355a3c', best = 1e9;
      for (const r of regs) { const d = Math.hypot(x - r.x, y - r.y); if (d < 50 && d < best) { best = d; col = cols[r.pal][d < 26 ? 1 : 0]; } }
      P(x, y, 2, 2, col);
    }
    for (let i = 0; i < 300; i++) { const x = rnd() * W, y = rnd() * H; if (land(x, y) > 0.3) P(x, y, 1, 1, 'rgba(255,255,255,0.08)'); }
    // grid lines like an old chart
    ctx.strokeStyle = 'rgba(212,168,74,0.12)'; ctx.lineWidth = 1; for (let i = 0; i < W; i += 38) { ctx.beginPath(); ctx.moveTo(i + .5, 0); ctx.lineTo(i + .5, H); ctx.stroke(); } for (let j = 0; j < H; j += 36) { ctx.beginPath(); ctx.moveTo(0, j + .5); ctx.lineTo(W, j + .5); ctx.stroke(); }
    ctx.strokeStyle = '#d4a84a'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, W - 2, H - 2);
    E.PG.register(scene, 'worldmap', c);
  }
};
