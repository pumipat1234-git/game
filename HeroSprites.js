/* Placeholder hero sprites: 32x32 cells, 11 frames each, drawn procedurally. Faces right. */
E.HeroSprites = {
  build(scene) {
    const PG = E.PG;
    for (const cls of E.CLASS_ORDER) {
      PG.sheet(scene, 'hero_' + cls, 32, 32, (P, st) => this['draw_' + cls](P, st));
      // portrait: head crop of idle0 scaled 4x
      const src = scene.textures.get('hero_' + cls).getSourceImage();
      const [pc, px] = PG.canvas(64, 64); px.drawImage(src, 6, 0, 20, 20, 0, 0, 64, 64);
      // draw crop slightly larger by scaling 20->64 (nearest)
      PG.register(scene, 'port_' + cls, pc);
    }
  },
  /* ---- shared body parts ---- */
  base(P, st, o) {
    const b = st.b, hurt = st.hurt, ox = hurt ? -2 : 0;
    const Q = (x, y, w, h, c) => P(x + ox, y, w, h, c);
    // legs
    const lx = [0, 1, 0, -1][Math.max(0, st.ph)] , lift = [0, 1, 0, 0][Math.max(0, st.ph)], rl = [0, 0, 0, 1][Math.max(0, st.ph)];
    if (!o.robe) {
      Q(12 - lx * (st.ph >= 0 ? 1 : 0), 23 - lift, 3, 6 + lift, o.pants); Q(17 + lx * (st.ph >= 0 ? 1 : 0), 23 - rl, 3, 6 + rl, E.PG.sh(o.pants, 0.8));
      Q(11 - lx * (st.ph >= 0 ? 1 : 0), 28 - lift, 5, 2, o.boots); Q(17 + lx * (st.ph >= 0 ? 1 : 0), 28 - rl, 5, 2, E.PG.sh(o.boots, 0.85));
    } else {
      Q(11, 26 + (st.ph === 1 || st.ph === 3 ? -1 : 0), 4, 3, o.boots); Q(17, 26 + (st.ph === 0 || st.ph === 2 ? -1 : 0), 4, 3, o.boots);
    }
    return { Q, b };
  },
  torso(Q, b, o, wide) {
    const x = wide ? 10 : 11, w = wide ? 12 : 10, S = E.PG.sh;
    const bot = o.robe ? 26 : 23;
    Q(x, 14 + b, w, bot - 14 - b + (o.robe ? 0 : 0), o.tunic);
    Q(x, 14 + b, w, 2, S(o.tunic, 1.25));              // shoulder light
    Q(x + w - 2, 16 + b, 2, bot - 16 - b, S(o.tunic, 0.7)); // shade side
    if (!o.robe) Q(x, 21 + b, w, 2, o.belt);
    if (o.robe) { Q(x - 1, 22, w + 2, 5, o.tunic); Q(x - 1, 25, w + 2, 2, S(o.tunic, 0.75)); Q(x + 4, 16 + b, 2, 10, o.trim || S(o.tunic, 1.3)); }
  },
  head(Q, b, o) {
    const S = E.PG.sh;
    Q(12, 5 + b, 8, 8, o.skin); Q(12, 11 + b, 8, 2, S(o.skin, 0.85));
    Q(16, 9 + b, 1, 2, '#0b0b14'); Q(19, 9 + b, 1, 2, '#0b0b14');
    if (o.hurt) { Q(16, 9 + b, 1, 1, o.skin); Q(19, 9 + b, 1, 1, o.skin); Q(16, 10 + b, 1, 1, '#0b0b14'); }
  },
  arm(Q, b, o, front, ex) {
    const S = E.PG.sh; const x = front ? 20 : 9;
    Q(x + (ex || 0), 15 + b, 3, 6, front ? o.tunic : S(o.tunic, 0.8)); Q(x + (ex || 0), 21 + b, 3, 2, o.skin);
  },
  /* ---------- WARRIOR (the prince) ---------- */
  draw_warrior(P, st) {
    const o = { skin: '#e8b890', pants: '#2a2f45', boots: '#3a2a22', tunic: '#454c66', belt: '#8a6a2a', hair: '#2a1a14', hurt: st.hurt };
    const { Q, b } = this.base(P, st, o), S = E.PG.sh, fl = st.ph >= 0 ? (st.ph % 2) : 0;
    // cape (behind)
    Q(8 - fl, 14 + b, 4, 12 + fl, '#a02a2a'); Q(7 - fl, 18 + b, 2, 9 + fl, '#7a1d1d'); Q(9, 14 + b, 2, 3, '#c0392b');
    this.torso(Q, b, o); Q(11, 14 + b, 10, 2, '#c0392b'); // red scarf
    this.arm(Q, b, o, false); this.head(Q, b, o);
    Q(11, 4 + b, 9, 3, o.hair); Q(10, 6 + b, 3, 6, o.hair); Q(14, 2 + b, 2, 3, o.hair); Q(17, 3 + b, 2, 2, o.hair); // spiky hair
    Q(20, 14 + b, 4, 3, '#9aa3b8'); Q(20, 14 + b, 4, 1, '#d5dbe8'); // pauldron
    // front arm + sword
    const a = st.atk, hx = 22, hy = 21 + b;
    if (a === 0) { this.arm(Q, b, o, true, -1); E.PG.line(Q, 21, 19, 15, 6, 2, '#cfd5e6'); Q(19, 18, 4, 2, '#d4a84a'); }
    else if (a === 1) { this.arm(Q, b, o, true, 3); E.PG.line(Q, 25, 20, 31, 20, 2, '#e8edf8'); Q(24, 18, 2, 5, '#d4a84a'); Q(26, 19, 5, 1, '#fff'); }
    else if (a === 2) { this.arm(Q, b, o, true, 2); E.PG.line(Q, 24, 22, 29, 28, 2, '#cfd5e6'); Q(23, 21, 4, 2, '#d4a84a'); }
    else { this.arm(Q, b, o, true); Q(hx, hy - 12, 2, 12, '#cfd5e6'); Q(hx, hy - 12, 1, 12, '#fff'); Q(hx - 2, hy - 1, 6, 2, '#d4a84a'); Q(hx, hy + 1, 2, 2, '#5a3a22'); }
  },
  /* ---------- GUARDIAN ---------- */
  draw_guardian(P, st) {
    const o = { skin: '#d9a47e', pants: '#2b3a45', boots: '#262c34', tunic: '#7c8aa0', belt: '#5a4a2a', hurt: st.hurt };
    const { Q, b } = this.base(P, st, o), S = E.PG.sh, a = st.atk;
    this.torso(Q, b, o, true); Q(13, 15 + b, 6, 8, '#2f7f7b'); Q(15, 16 + b, 2, 6, '#d4a84a'); // teal tabard
    this.arm(Q, b, o, false);
    // full helm
    Q(11, 4 + b, 10, 9, '#9aa6bc'); Q(11, 4 + b, 10, 2, '#d3dbea'); Q(11, 11 + b, 10, 2, '#6e7a90');
    Q(15, 8 + b, 6, 2, '#0b0b14'); Q(14, 8 + b, 1, 2, '#6e7a90'); // visor slit
    Q(15, 1 + b, 3, 4, '#2f9f9a'); Q(14, 2 + b, 2, 3, '#1f6f6b'); // plume
    Q(20, 13 + b, 4, 4, '#b4bfd2'); // pauldron
    const sx = a === 1 ? 4 : a === 0 ? -1 : a === 2 ? 2 : 0;
    // kite shield
    const X = 21 + sx;
    Q(X, 13 + b, 8, 12, '#2f7f7b'); Q(X, 13 + b, 8, 2, '#4fc1bb'); Q(X + 1, 24 + b, 6, 2, '#2f7f7b'); Q(X + 2, 26 + b, 4, 1, '#1f5f5b');
    Q(X, 13 + b, 1, 12, '#d4a84a'); Q(X + 7, 13 + b, 1, 12, '#d4a84a'); Q(X + 3, 17 + b, 2, 4, '#d4a84a'); Q(X + 2, 18 + b, 4, 2, '#f2d98a');
  },
  /* ---------- MAGE ---------- */
  draw_mage(P, st) {
    const o = { skin: '#e4b896', pants: '#2a2050', boots: '#2a1d40', tunic: '#5a2db0', trim: '#d4a84a', robe: true, hurt: st.hurt };
    const { Q, b } = this.base(P, st, o), a = st.atk;
    Q(10, 12 + b, 4, 12, '#d8d8ee'); // long silver hair
    this.torso(Q, b, o); this.arm(Q, b, o, false); this.head(Q, b, o);
    Q(11, 5 + b, 9, 2, '#d8d8ee'); Q(11, 7 + b, 2, 5, '#d8d8ee');
    // pointed hat
    Q(9, 5 + b, 14, 2, '#3a1d7a'); Q(11, 3 + b, 9, 2, '#4a25a0'); Q(13, 1 + b, 6, 2, '#4a25a0'); Q(15, 0 + b, 3, 1, '#4a25a0'); Q(11, 4 + b, 9, 1, '#d4a84a');
    this.arm(Q, b, o, true, a === 1 ? 2 : 0);
    // staff + orb
    const sx = 23 + (a === 1 ? 3 : 0), top = a === 0 ? 2 : 4;
    Q(sx, top + 3, 2, 26 - top, '#6a4a2a'); Q(sx - 1, top + 3, 4, 1, '#d4a84a');
    const gl = a === 1 ? '#f0d8ff' : '#c49bff';
    Q(sx - 1, top - 1, 4, 4, '#8a4be8'); Q(sx, top, 2, 2, gl);
    if (a === 1) { Q(sx - 3, top + 1, 1, 1, gl); Q(sx + 4, top + 1, 1, 1, gl); Q(sx + 1, top - 3, 1, 1, gl); }
    if (a === 0) { Q(sx - 2, top - 2, 1, 1, '#c49bff'); Q(sx + 3, top - 2, 1, 1, '#c49bff'); }
  },
  /* ---------- ARCHER ---------- */
  draw_archer(P, st) {
    const o = { skin: '#e0b08a', pants: '#3a2f22', boots: '#2a2018', tunic: '#5a7a3a', belt: '#4a3a22', hurt: st.hurt };
    const { Q, b } = this.base(P, st, o), a = st.atk;
    Q(8, 13 + b, 4, 10, '#6a4a2a'); Q(8, 11 + b, 1, 3, '#e8e0c0'); Q(10, 11 + b, 1, 3, '#e8e0c0'); // quiver + fletching
    this.torso(Q, b, o); Q(11, 16 + b, 10, 1, '#8a6a3a'); this.arm(Q, b, o, false);
    this.head(Q, b, o);
    // green hood
    Q(11, 3 + b, 10, 4, '#3f8f3f'); Q(10, 5 + b, 3, 8, '#2f6f2f'); Q(13, 2 + b, 5, 2, '#4faf4f'); Q(11, 6 + b, 2, 1, '#2f6f2f');
    this.arm(Q, b, o, true, a === 0 ? 2 : 1);
    // bow
    const bx = 23 + (a === 0 ? 1 : 0), PG = E.PG;
    [[0, 7], [1, 9], [2, 12], [2, 16], [2, 20], [1, 23], [0, 25]].forEach(([dx, y]) => Q(bx + dx, y + b, 2, 3, '#7a4a22'));
    const sxs = a === 0 ? bx - 4 : bx;
    PG.line(Q, bx, 8 + b, sxs, 17 + b, 1, '#e8e0c0'); PG.line(Q, sxs, 17 + b, bx, 26 + b, 1, '#e8e0c0');
    if (a === 0) { Q(sxs, 17 + b, 10, 1, '#cfd5e6'); Q(sxs - 1, 16 + b, 2, 3, '#e8e0c0'); }
    if (a === 1) { Q(bx + 2, 17 + b, 8, 1, '#cfd5e6'); Q(bx + 10, 16 + b, 2, 3, '#cfd5e6'); }
  },
  /* ---------- CLERIC ---------- */
  draw_cleric(P, st) {
    const o = { skin: '#efc4a0', pants: '#d8d0b8', boots: '#8a6a3a', tunic: '#e8e0cc', trim: '#d4a84a', robe: true, hurt: st.hurt };
    const { Q, b } = this.base(P, st, o), a = st.atk;
    this.torso(Q, b, o); Q(11, 22, 10, 1, '#d4a84a'); Q(15, 14 + b, 2, 3, '#d4a84a');
    this.arm(Q, b, o, false); this.head(Q, b, o);
    Q(11, 4 + b, 9, 3, '#e8c860'); Q(10, 5 + b, 3, 8, '#e8c860'); // blond hair
    // white hood
    Q(10, 3 + b, 11, 3, '#f4f0e0'); Q(9, 5 + b, 3, 9, '#d8d0b8'); Q(12, 2 + b, 6, 2, '#fff'); Q(10, 3 + b, 11, 1, '#d4a84a');
    const hx = 22, sw = a === 1 ? 3 : 0, up = a === 0 ? -4 : 0;
    this.arm(Q, b, o, true, a === 1 ? 2 : 0);
    // mace with holy head
    Q(hx + sw, 8 + b + up, 2, 16, '#7a5a32');
    Q(hx - 1 + sw, 5 + b + up, 4, 4, '#d4a84a'); Q(hx + sw, 3 + b + up, 2, 8, '#f2d98a'); Q(hx - 2 + sw, 6 + b + up, 6, 2, '#f2d98a');
    if (a === 1) { Q(hx - 4 + sw, 4 + b, 1, 1, '#fff6c0'); Q(hx + 5 + sw, 4 + b, 1, 1, '#fff6c0'); Q(hx + 1 + sw, 0, 1, 2, '#fff6c0'); }
  }
};
