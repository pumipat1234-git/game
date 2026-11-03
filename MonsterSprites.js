/* Placeholder monster sprites. 5 archetypes + boss, each re-coloured per region palette. */
E.PALS = {
  forest:  { body: '#5b4636', dark: '#2d2118', light: '#8a6a4c', accent: '#5da34a', glow: '#b36bff', bone: '#d8d2bd', fur: '#3a3a48' },
  frost:   { body: '#6f8fb0', dark: '#2c3e5a', light: '#c6e3ff', accent: '#8cc4ff', glow: '#7fe8ff', bone: '#e8f4ff', fur: '#9fb7cf' },
  ash:     { body: '#4a2f2a', dark: '#1d1210', light: '#7a4a3a', accent: '#ff7a2a', glow: '#ffb02a', bone: '#c9b8a8', fur: '#3b2420' },
  abyss:   { body: '#2a1f4a', dark: '#0e0a1f', light: '#5a3f9a', accent: '#c43dff', glow: '#ff4dd2', bone: '#b9a8d8', fur: '#241a3f' },
  capital: { body: '#5a4a2e', dark: '#1c1608', light: '#a88a45', accent: '#f2d98a', glow: '#fff2b0', bone: '#e8dcc0', fur: '#4a3c24' }
};

E.MonsterSprites = {
  build(scene) {
    for (const pal in E.PALS) {
      const c = E.PALS[pal];
      for (const shape of ['wolf', 'thorn', 'skel', 'knight', 'shaman'])
        E.PG.sheet(scene, `mon_${shape}_${pal}`, 32, 32, (P, st) => this['draw_' + shape](P, st, c));
      E.PG.sheet(scene, `mon_boss_${pal}`, 64, 64, (P, st) => this.draw_boss(P, st, c));
    }
  },
  wolf(P, st, c) { return this.draw_wolf(P, st, c); },
  draw_wolf(P, st, c) {
    const S = E.PG.sh, b = st.b, a = st.atk, ox = st.hurt ? -2 : 0, Q = (x, y, w, h, col) => P(x + ox, y, w, h, col);
    const lunge = a === 1 ? 4 : a === 0 ? -2 : a === 2 ? 2 : 0;
    const ph = st.ph, o1 = ph < 0 ? 0 : [2, 0, -2, 0][ph], o2 = -o1;
    // legs
    Q(8 + o1, 22, 3, 7, S(c.fur, 0.8)); Q(12 + o2, 22, 3, 7, S(c.fur, 0.7)); Q(19 + o2, 22, 3, 7, S(c.fur, 0.8)); Q(22 + o1, 22, 3, 7, c.fur);
    Q(8 + o1, 28, 4, 1, c.dark); Q(12 + o2, 28, 4, 1, c.dark); Q(19 + o2, 28, 4, 1, c.dark); Q(22 + o1, 28, 4, 1, c.dark);
    // tail
    Q(2, 12 + b, 3, 3, c.fur); Q(4, 14 + b, 4, 3, c.fur); Q(1, 10 + b, 2, 3, S(c.fur, 1.3));
    // body
    Q(6 + lunge * 0.5, 14 + b, 18, 9, c.fur); Q(6 + lunge * 0.5, 14 + b, 18, 2, S(c.fur, 1.3)); Q(6 + lunge * 0.5, 21 + b, 18, 2, S(c.fur, 0.7));
    for (let i = 0; i < 5; i++) Q(8 + i * 3 + lunge * 0.5, 11 + b + (i % 2), 2, 4, c.accent); // spikes
    // head
    const hx = 22 + lunge;
    Q(hx, 11 + b, 8, 8, c.fur); Q(hx, 11 + b, 8, 2, S(c.fur, 1.3)); Q(hx + 6, 14 + b, 4, 4, S(c.fur, 0.85)); Q(hx + 9, 14 + b, 1, 2, '#111');
    Q(hx + 1, 8 + b, 2, 4, c.fur); Q(hx + 4, 8 + b, 2, 3, c.fur); Q(hx + 1, 8 + b, 1, 2, c.accent);
    Q(hx + 4, 13 + b, 2, 2, c.glow);
    if (a === 1) { Q(hx + 4, 17 + b, 6, 3, '#2a0a0a'); Q(hx + 5, 17 + b, 1, 2, '#fff'); Q(hx + 8, 17 + b, 1, 2, '#fff'); } else Q(hx + 6, 17 + b, 1, 2, '#fff');
  },
  draw_thorn(P, st, c) {
    const S = E.PG.sh, b = st.b, a = st.atk, ox = st.hurt ? -2 : 0, Q = (x, y, w, h, col) => P(x + ox, y, w, h, col);
    const ph = st.ph, sw = ph < 0 ? 0 : [1, 0, -1, 0][ph];
    // root legs
    Q(10 + sw, 23, 3, 6, S(c.body, 0.8)); Q(18 - sw, 23, 3, 6, S(c.body, 0.8)); Q(8 + sw, 28, 4, 2, c.dark); Q(18 - sw, 28, 5, 2, c.dark);
    // body bulb
    Q(9, 14 + b, 14, 10, c.accent); Q(9, 14 + b, 14, 2, S(c.accent, 1.3)); Q(9, 22 + b, 14, 2, S(c.accent, 0.6)); Q(11, 16 + b, 10, 6, S(c.accent, 0.8));
    // thorns
    for (let i = 0; i < 4; i++) { Q(7, 15 + b + i * 2, 2, 1, c.bone); Q(23, 16 + b + i * 2, 2, 1, c.bone); }
    Q(12, 12 + b, 1, 2, c.bone); Q(19, 12 + b, 1, 2, c.bone);
    // head / maw
    Q(10, 4 + b, 12, 11, S(c.accent, 0.9)); Q(10, 4 + b, 12, 2, S(c.accent, 1.35));
    Q(9, 3 + b, 3, 3, c.glow); Q(20, 3 + b, 3, 3, c.glow); // petals/horns glow
    Q(12, 8 + b, 2, 2, c.glow); Q(18, 8 + b, 2, 2, c.glow);
    Q(12, 11 + b, 8, 4, '#220a18'); for (let i = 0; i < 4; i++) Q(12 + i * 2, 11 + b, 1, 2, '#fff');
    // vine arms
    const ext = a === 1 ? 7 : a === 0 ? -2 : a === 2 ? 3 : 0;
    E.PG.line(Q, 22, 17 + b, 26 + ext, 17 + b + (a === 0 ? -4 : 2), 2, S(c.accent, 0.8)); Q(26 + ext, 15 + b + (a === 0 ? -4 : 2), 2, 4, c.bone);
    E.PG.line(Q, 9, 18 + b, 5, 22 + b, 2, S(c.accent, 0.8));
  },
  draw_skel(P, st, c) {
    const S = E.PG.sh, b = st.b, a = st.atk, ox = st.hurt ? -2 : 0, Q = (x, y, w, h, col) => P(x + ox, y, w, h, col);
    const ph = st.ph, o1 = ph < 0 ? 0 : [1, 0, -1, 0][ph];
    Q(8, 14 + b, 4, 13, S(c.dark, 1.4)); Q(7, 20 + b, 4, 8, c.dark); // tattered cloak
    Q(12 + o1, 23, 2, 6, c.bone); Q(18 - o1, 23, 2, 6, S(c.bone, 0.8)); Q(11 + o1, 28, 4, 1, c.bone); Q(18 - o1, 28, 4, 1, c.bone);
    Q(15, 14 + b, 2, 9, c.bone); for (let i = 0; i < 3; i++) Q(12, 15 + b + i * 2, 8, 1, c.bone); Q(13, 21 + b, 6, 2, S(c.bone, 0.8)); // spine + ribs
    Q(12, 5 + b, 8, 8, c.bone); Q(12, 5 + b, 8, 2, S(c.bone, 1.1)); Q(14, 9 + b, 2, 2, '#0b0b14'); Q(18, 9 + b, 2, 2, '#0b0b14'); Q(14, 9 + b, 1, 1, c.glow); Q(18, 9 + b, 1, 1, c.glow);
    Q(13, 12 + b, 6, 1, S(c.bone, 0.7)); Q(11, 4 + b, 10, 3, c.dark); Q(10, 6 + b, 3, 6, c.dark); // hood
    Q(20, 15 + b, 2, 7, c.bone);
    const bx = 23 + (a === 0 ? 1 : 0);
    [[0, 8], [1, 10], [2, 13], [2, 17], [2, 21], [1, 24]].forEach(([dx, y]) => Q(bx + dx, y + b, 2, 3, c.body));
    const sx = a === 0 ? bx - 4 : bx;
    E.PG.line(Q, bx, 9 + b, sx, 18 + b, 1, c.bone); E.PG.line(Q, sx, 18 + b, bx, 26 + b, 1, c.bone);
    if (a === 0) Q(sx, 18 + b, 9, 1, c.glow); if (a === 1) { Q(bx + 2, 18 + b, 8, 1, c.glow); Q(bx + 10, 17 + b, 2, 3, c.glow); }
  },
  draw_knight(P, st, c) {
    const S = E.PG.sh, b = st.b, a = st.atk, ox = st.hurt ? -2 : 0, Q = (x, y, w, h, col) => P(x + ox, y, w, h, col);
    const ph = st.ph, o1 = ph < 0 ? 0 : [1, 0, -1, 0][ph];
    Q(7, 14 + b, 5, 14, c.dark); Q(6, 22 + b, 3, 7, S(c.dark, 0.8)); // cape
    Q(12 + o1, 22, 4, 7, S(c.body, 0.8)); Q(17 - o1, 22, 4, 7, S(c.body, 0.7)); Q(11 + o1, 27, 6, 3, c.dark); Q(17 - o1, 27, 6, 3, c.dark);
    Q(10, 13 + b, 13, 10, c.body); Q(10, 13 + b, 13, 2, c.light); Q(20, 15 + b, 3, 8, S(c.body, 0.6)); Q(10, 21 + b, 13, 2, c.dark); Q(15, 15 + b, 3, 4, c.accent); // glowing core
    Q(8, 12 + b, 5, 5, c.light); Q(20, 12 + b, 5, 5, c.light); Q(8, 12 + b, 5, 1, S(c.light, 1.3)); // pauldrons
    Q(12, 4 + b, 9, 9, c.body); Q(12, 4 + b, 9, 2, c.light); Q(14, 8 + b, 7, 2, '#05050a'); Q(16, 8 + b, 4, 1, c.glow); // helm + slit
    Q(10, 1 + b, 2, 6, c.bone); Q(21, 1 + b, 2, 6, c.bone); Q(9, 0 + b, 2, 2, c.bone); Q(22, 0 + b, 2, 2, c.bone); // horns
    const hx = 23, rise = a === 0 ? -9 : a === 1 ? 4 : a === 2 ? 6 : 0;
    Q(21 + (a === 1 ? 3 : 0), 15 + b, 3, 7, c.body);
    if (a === 1) { Q(24, 19, 8, 3, S(c.bone, 1)); Q(26, 20, 6, 1, '#fff'); Q(24, 17, 2, 7, c.accent); }
    else if (a === 2) { E.PG.line(Q, 24, 21, 30, 28, 3, c.bone); }
    else { Q(hx, 4 + b + rise, 3, 19, c.bone); Q(hx, 4 + b + rise, 1, 19, '#fff'); Q(hx - 2, 22 + b + (a === 0 ? -6 : 0), 7, 2, c.accent); }
  },
  draw_shaman(P, st, c) {
    const S = E.PG.sh, b = st.b, a = st.atk, ox = st.hurt ? -2 : 0, Q = (x, y, w, h, col) => P(x + ox, y, w, h, col);
    const hov = st.ph >= 0 ? [0, 1, 0, 1][st.ph] : 0;
    // floating robe, ragged hem
    Q(9, 13 + b, 14, 14 - hov, c.dark); Q(9, 13 + b, 14, 2, c.body); Q(10, 22 + b, 12, 2, S(c.dark, 0.7));
    for (let i = 0; i < 6; i++) Q(9 + i * 2 + (i % 2), 26 - hov + b, 2, 2 + (i % 2) , S(c.dark, 0.8));
    Q(14, 14 + b, 2, 11, c.accent); Q(11, 16 + b, 10, 1, c.accent);
    // hood + face
    Q(11, 3 + b, 10, 10, c.dark); Q(11, 3 + b, 10, 2, c.body); Q(13, 7 + b, 7, 5, '#05050a');
    Q(14, 8 + b, 2, 2, c.glow); Q(18, 8 + b, 2, 2, c.glow);
    // arms + skull staff
    Q(20, 15 + b, 3, 6, c.dark); Q(20, 20 + b, 3, 2, c.bone);
    const sx = 24 + (a === 1 ? 3 : 0), top = a === 0 ? 0 : 3;
    Q(sx, top + 4, 2, 24 - top, '#3a2a22'); Q(sx - 2, top, 6, 5, c.bone); Q(sx - 1, top + 2, 1, 1, '#000'); Q(sx + 2, top + 2, 1, 1, '#000');
    Q(sx - 1, top - 3, 4, 3, c.glow); Q(sx, top - 2, 2, 1, '#fff');
    if (a === 1) { Q(sx - 4, top - 1, 1, 1, c.glow); Q(sx + 5, top - 1, 1, 1, c.glow); Q(sx + 1, top - 6, 1, 2, c.glow); }
  },
  /* 64x64 colossus used as every boss (recoloured per region). */
  draw_boss(P, st, c) {
    const S = E.PG.sh, b = st.b, a = st.atk, ox = st.hurt ? -2 : 0, Q = (x, y, w, h, col) => P(x + ox, y, w, h, col);
    const ph = st.ph, o1 = ph < 0 ? 0 : [2, 0, -2, 0][ph];
    // trunk legs
    Q(18 + o1, 44, 10, 18, S(c.body, 0.8)); Q(36 - o1, 44, 10, 18, S(c.body, 0.7)); Q(15 + o1, 59, 15, 4, c.dark); Q(34 - o1, 59, 15, 4, c.dark);
    // torso
    Q(14, 20 + b, 36, 28, c.body); Q(14, 20 + b, 36, 4, c.light); Q(44, 24 + b, 6, 24, S(c.body, 0.65));
    for (let i = 0; i < 6; i++) Q(18 + i * 5, 26 + b + (i % 2) * 4, 1, 14, c.dark); // bark grooves
    Q(26, 28 + b, 12, 12, c.dark); Q(28, 30 + b, 8, 8, c.accent); Q(30, 32 + b, 4, 4, c.glow); // rune core
    // mossy shoulders
    Q(10, 16 + b, 14, 8, c.accent); Q(40, 16 + b, 14, 8, c.accent); Q(10, 16 + b, 14, 2, S(c.accent, 1.3)); Q(40, 16 + b, 14, 2, S(c.accent, 1.3));
    // head
    Q(24, 6 + b, 16, 16, S(c.body, 1.1)); Q(24, 6 + b, 16, 3, c.light); Q(27, 12 + b, 4, 3, c.glow); Q(34, 12 + b, 4, 3, c.glow); Q(28, 18 + b, 9, 2, c.dark);
    // antlers
    [[22, 4, 18, 0], [20, 8, 14, 3], [42, 4, 46, 0], [44, 8, 50, 3]].forEach(([x, y, x2, y2]) => E.PG.line(Q, x, y + b, x2, y2 + b, 2, c.bone));
    Q(18, 0, 2, 4, c.bone); Q(46, 0, 2, 4, c.bone);
    // arms
    const up = a === 0, slam = a === 1, aft = a === 2;
    const ay = up ? -14 : slam ? 12 : aft ? 6 : 0;
    Q(2, 22 + b + (up ? -10 : 0), 12, 26 + ay * 0.6, S(c.body, 0.9)); Q(2, 44 + b + ay, 14, 10, c.dark); Q(4, 50 + b + ay, 2, 5, c.bone); Q(8, 50 + b + ay, 2, 5, c.bone); Q(12, 50 + b + ay, 2, 5, c.bone);
    Q(50, 22 + b + (up ? -10 : 0), 12, 26 + ay * 0.6, S(c.body, 0.8)); Q(48, 44 + b + ay, 14, 10, c.dark); Q(50, 50 + b + ay, 2, 5, c.bone); Q(54, 50 + b + ay, 2, 5, c.bone); Q(58, 50 + b + ay, 2, 5, c.bone);
  }
};
