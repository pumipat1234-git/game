/* Real-time battle simulation. Driven in "simulation time" so pause and 2x speed are exact. */
E.Battle = class {
  constructor(scene, dungeon, stageIdx) {
    this.scene = scene; this.d = dungeon; this.idx = stageIdx;
    this.heroes = []; this.enemies = []; this.proj = []; this.parts = []; this.rings = []; this.beams = []; this.tele = []; this.meteors = []; this.timers = []; this.texts = [];
    this.t = 0; this.cmd = 'advance'; this.focus = null; this.autoSkills = false; this.over = null; this.afterOver = 0;
    this.bounds = { x0: 50, x1: 1230, y0: 120, y1: 580 };
    this.groundGfx = scene.add.graphics().setDepth(2);
    this.barGfx = scene.add.graphics().setDepth(99998);
    this.fxGfx = scene.add.graphics().setDepth(99999);
    this.spawn();
  }
  spawn() {
    const s = E.G.s, B = this.bounds;
    s.party.map(id => E.G.hero(id)).filter(Boolean).forEach(h => {
      const p = s.formation.pos[h.id] || { x: 200, y: 340 };
      const u = new E.Unit(this, { side: 'hero', hero: h, name: h.name, stats: E.Hero.stats(h), x: p.x, y: E.U.clamp(p.y, B.y0, B.y1), scale: 3, radius: 20, tex: 'hero_' + h.cls });
      u.projCol = h.cls === 'archer' ? 0xe8e0c0 : 0xc49bff; this.heroes.push(u);
    });
    const defs = E.Run.buildEnemies(this.d, this.idx), pal = E.PALS[this.d.pal], used = [];
    defs.forEach((e, i) => {
      let x, y, tries = 0;
      do { x = e.boss ? 1020 : E.U.rand(880, 1190); y = e.boss ? 350 : E.U.rand(B.y0 + 30, B.y1 - 20); tries++; } while (tries < 40 && used.some(p => Math.hypot(p.x - x, p.y - y) < 62 + (e.boss ? 60 : 0)));
      used.push({ x, y });
      const u = new E.Unit(this, { side: 'enemy', name: e.name, kind: e.kind, stats: e.stats, x, y, scale: e.scale, radius: e.radius, boss: e.boss, elite: e.elite, ranged: e.ranged, proj: e.proj, healer: e.healer, bossAtk: e.bossAtk, tex: `mon_${e.shape}_${e.pal}` });
      u.projCol = parseInt(pal.glow.slice(1), 16); u.facing = -1; this.enemies.push(u);
    });
    this.units = this.heroes.concat(this.enemies);
    this.boss = this.enemies.find(e => e.isBoss) || null;
  }
  get all() { return this.units; }
  foesOf(u) { return (u.side === 'hero' ? this.enemies : this.heroes).filter(x => x.alive); }
  alliesOf(u) { return (u.side === 'hero' ? this.heroes : this.enemies).filter(x => x.alive); }
  nearest(u, list) { let best = null, bd = 1e9; for (const e of list) { const d = u.dist(e) - e.radius * 0.7; if (d < bd) { bd = d; best = e; } } return best; }
  after(delay, fn) { this.timers.push({ t: delay, fn }); }
  banner(text, col, dur) { this.scene.showBanner && this.scene.showBanner(text, col, dur); }
  shake(ms, k) { if (E.Settings.d.screenShake) this.scene.cameras.main.shake(ms, k); }
  commandSet(c) { this.cmd = c; }

  /* ---------- effects primitives ---------- */
  ring(x, y, r, col, dur = 0.4) { this.rings.push({ x, y, r, col, t: 0, dur }); }
  burst(x, y, col, n = 10, speed = 140, life = 0.5) {
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = speed * (0.4 + Math.random() * 0.6); this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, t: 0, life: life * (0.6 + Math.random() * 0.6), col, s: 3 + Math.floor(Math.random() * 3) }); }
  }
  beam(x1, y1, x2, y2, col, dur = 0.3, w = 4) { this.beams.push({ x1, y1, x2, y2, col, t: 0, dur, w }); }
  meteor(x, y, dur, fn) { this.meteors.push({ x, y, t: 0, dur, fn }); }
  projectile(o) { o.t = 0; this.proj.push(o); }
  addTele(t) { t.t = 0; this.tele.push(t); }
  floatText(x, y, str, col = '#fff', size = 18) {
    if (this.texts.length > 50) return;
    const t = E.UI.text(this.scene, x, y, str, { size, color: col, bold: true, ox: 0.5, oy: 0.5, st: 4 }); t.setDepth(100000);
    this.texts.push({ obj: t, t: 0, dur: 0.9, vy: -42 });
  }

  /* ---------- combat rules ---------- */
  attack(u, target, healing) {
    u.atkT = u.cd * (u.enraged ? 0.7 : 1); u.atkAnim = 0.3; u.atkAnimMax = 0.3; u.pending = { t: 0.14, target, healing }; u.face(target);
  }
  resolveAttack(u) {
    const p = u.pending, tg = p.target; u.pending = null;
    if (p.healing) { if (tg.alive) { this.beam(u.x, u.y - 50, tg.x, tg.y - 40, 0xf2d98a, 0.25, 4); this.heal(tg, u.atk * 1.0, u); } return; }
    if (!tg.alive) return;
    if (u.proj && u.proj !== 'heal') {
      E.Sfx.play(u.proj === 'arrow' ? 'shoot' : 'magic');
      this.projectile({ x: u.x + u.facing * 24, y: u.y - u.spriteH * 0.5, target: tg, speed: u.proj === 'arrow' ? 680 : 430, kind: u.proj, col: u.projCol, src: u, onHit: () => this.dealDamage(u, tg, 1) });
    } else if (u.edge(tg) <= u.range * 1.5 + 12) this.dealDamage(u, tg, 1);
  }
  dealDamage(src, tgt, mult = 1, o = {}) {
    if (!tgt.alive) return 0;
    let dmg = src.atk * mult * (100 / (100 + tgt.def)) * E.U.rand(0.92, 1.08);
    const crit = !o.noCrit && Math.random() < src.crit; if (crit) dmg *= 1.6;
    if (tgt.drT > 0) dmg *= 1 - tgt.drAmt;
    dmg = Math.max(1, Math.round(dmg)); const shown = dmg;
    if (tgt.shield > 0) { const a = Math.min(tgt.shield, dmg); tgt.shield -= a; dmg -= a; }
    tgt.hp -= dmg; if (dmg > 0) tgt.hurtT = 0.16;
    if (E.Settings.d.damageNumbers) this.floatText(tgt.x + E.U.rand(-10, 10), tgt.y - tgt.spriteH * 0.85, String(shown), tgt.side === 'hero' ? '#ff6b5a' : crit ? '#ffe070' : '#ffffff', crit ? 26 : 18);
    this.burst(tgt.x, tgt.y - tgt.spriteH * 0.4, tgt.side === 'hero' ? 0xff6b5a : 0xffffff, crit ? 8 : 4, 110, 0.3);
    E.Sfx.play(crit ? 'crit' : 'hit');
    if (!o.noUlt) { if (src.hero) src.ult = Math.min(100, src.ult + 5); if (tgt.hero) tgt.ult = Math.min(100, tgt.ult + 3); }
    if (tgt.hp <= 0) this.kill(tgt);
    return shown;
  }
  heal(t, amt, src) {
    if (!t.alive) return; const a = Math.min(Math.round(amt), Math.round(t.maxHp - t.hp)); if (a <= 0) return;
    t.hp += a; if (E.Settings.d.damageNumbers) this.floatText(t.x, t.y - t.spriteH * 0.85, '+' + a, '#8be07a', 18);
    this.burst(t.x, t.y - 40, 0x8be07a, 6, 70, 0.6);
    if (src && src.hero) src.ult = Math.min(100, src.ult + 3);
  }
  kill(u) {
    u.alive = false; u.hp = 0; u.corpseT = 0; u.casting = null; u.pending = null;
    if (this.focus === u) this.focus = null;
    this.burst(u.x, u.y - 30, u.side === 'hero' ? 0x8a4be8 : 0xffffff, u.isBoss ? 40 : 14, u.isBoss ? 300 : 160, 0.8);
    if (u.isBoss) { this.shake(500, 0.014); this.tele.length = 0; }
  }
  revive(u, frac) { u.alive = true; u.hp = u.maxHp * frac; u.corpseT = 0; u.sprite.setAlpha(1); u.shadow.setAlpha(0.4); this.burst(u.x, u.y - 40, 0xfff2b0, 20, 150, 0.8); this.ring(u.x, u.y, 80, 0xfff2b0, 0.6); }

  /* ---------- main step ---------- */
  update(dtTotal) {
    let rem = dtTotal;
    while (rem > 0.0001) { const st = Math.min(rem, 1 / 30); rem -= st; this.step(st); }
    this.render();
  }
  step(dt) {
    this.t += dt;
    for (const m of this.timers) m.t -= dt;
    const due = this.timers.filter(m => m.t <= 0); if (due.length) { this.timers = this.timers.filter(m => m.t > 0); due.forEach(m => m.fn()); }
    for (const u of this.units) {
      u.animT += dt;
      if (!u.alive) { u.corpseT += dt; continue; }
      u.atkT -= dt; u.skillT -= dt; u.healT -= dt; u.castT -= dt; u.moveLock -= dt; u.hurtT -= dt; u.atkAnim -= dt;
      if (u.stunT > 0) u.stunT -= dt; if (u.tauntT > 0) u.tauntT -= dt; if (u.drT > 0) u.drT -= dt;
      if (u.shieldT > 0) { u.shieldT -= dt; if (u.shieldT <= 0) u.shield = 0; }
      if (u.hero) u.ult = Math.min(100, u.ult + dt * 1.1);
      if (u.pending) { u.pending.t -= dt; if (u.pending.t <= 0) this.resolveAttack(u); }
      if (this.over) { u.moving = false; continue; }
      if (u.side === 'hero') E.AI.hero(u, this, dt); else E.AI.enemy(u, this, dt);
    }
    this.separate();
    this.stepFx(dt);
    if (!this.over) {
      if (!this.enemies.some(e => e.alive)) { this.over = 'win'; this.heroes.forEach(h => h.moving = false); }
      else if (!this.heroes.some(h => h.alive)) this.over = 'lose';
    } else this.afterOver += dt;
  }
  separate() {
    const B = this.bounds, alive = this.units.filter(u => u.alive);
    for (let it = 0; it < 2; it++) for (let i = 0; i < alive.length; i++) for (let j = i + 1; j < alive.length; j++) {
      const a = alive[i], c = alive[j], dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || 0.01, min = (a.radius + c.radius) * 0.78;
      if (d >= min) continue;
      const push = (min - d) / 2, nx = dx / d, ny = dy / d, wa = a.isBoss ? 0 : c.isBoss ? 2 : 1, wc = c.isBoss ? 0 : a.isBoss ? 2 : 1;
      a.x -= nx * push * wa; a.y -= ny * push * wa; c.x += nx * push * wc; c.y += ny * push * wc;
    }
    for (const u of alive) { u.x = E.U.clamp(u.x, B.x0, B.x1); u.y = E.U.clamp(u.y, B.y0, B.y1); }
  }
  stepFx(dt) {
    for (const p of this.proj) {
      p.t += dt; const tg = p.target; if (!tg) { p.done = true; continue; }
      const tx = tg.x, ty = tg.y - tg.spriteH * 0.45, dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy), st = p.speed * dt;
      p.ang = Math.atan2(dy, dx);
      if (d <= st + 8 || p.t > 3) { p.done = true; p.onHit && p.onHit(); } else { p.x += dx / d * st; p.y += dy / d * st; }
    }
    this.proj = this.proj.filter(p => !p.done);
    for (const m of this.meteors) { m.t += dt; if (m.t >= m.dur) { m.done = true; m.fn(); } } this.meteors = this.meteors.filter(m => !m.done);
    for (const t of this.tele) {
      t.t += dt; if (t.follow && t.src && t.src.alive) { t.x = t.src.x; t.y = t.src.y; }
      if (t.t >= t.dur) {
        t.done = true;
        this.heroes.filter(h => h.alive).forEach(h => {
          let inside;
          if (t.shape === 'circle') inside = Math.hypot(h.x - t.x, h.y - t.y) < t.r + h.radius * 0.4;
          else { const rx = h.x - t.x, ry = h.y - t.y, al = rx * t.nx + ry * t.ny, pe = Math.abs(rx * t.ny - ry * t.nx); inside = al > -20 && al < t.len && pe < t.w / 2 + h.radius * 0.5; }
          if (inside && t.src.alive !== false) this.dealDamage(t.src, h, t.mult, { noCrit: true });
        });
        if (t.shape === 'circle') { this.ring(t.x, t.y, t.r, 0xff6b5a, 0.4); this.burst(t.x, t.y - 10, 0xff9a7a, 16, 220, 0.5); }
        else { this.beam(t.x, t.y, t.x + t.nx * t.len, t.y + t.ny * t.len, 0xff6b5a, 0.3, t.w * 0.5); }
        this.shake(120, 0.006);
      }
    }
    this.tele = this.tele.filter(t => !t.done);
    for (const r of this.rings) r.t += dt; this.rings = this.rings.filter(r => r.t < r.dur);
    for (const b of this.beams) b.t += dt; this.beams = this.beams.filter(b => b.t < b.dur);
    for (const p of this.parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; } this.parts = this.parts.filter(p => p.t < p.life);
    for (const f of this.texts) { f.t += dt; f.obj.y += f.vy * dt; f.obj.setAlpha(Math.max(0, 1 - Math.pow(f.t / f.dur, 2))); if (f.t >= f.dur) { f.obj.destroy(); f.done = true; } }
    this.texts = this.texts.filter(f => !f.done);
  }

  /* ---------- drawing ---------- */
  render() {
    const g = this.groundGfx, fx = this.fxGfx, bg = this.barGfx;
    g.clear(); fx.clear(); bg.clear();
    for (const u of this.units) u.render();
    // focus marker
    if (this.focus && this.focus.alive) {
      const f = this.focus, pulse = 1 + Math.sin(this.scene.time.now / 120) * 0.08;
      g.lineStyle(3, 0xff6b5a, 0.9); g.strokeEllipse(f.x, f.y - 2, f.radius * 2.6 * pulse, f.radius * 1.1 * pulse);
    }
    // telegraphs
    for (const t of this.tele) {
      const p = t.t / t.dur, a = 0.16 + 0.1 * Math.sin(t.t * 14);
      if (t.shape === 'circle') {
        g.fillStyle(0xff3b2a, a); g.fillCircle(t.x, t.y, t.r); g.fillStyle(0xff3b2a, 0.28); g.fillCircle(t.x, t.y, t.r * p); g.lineStyle(3, 0xff6b5a, 0.9); g.strokeCircle(t.x, t.y, t.r);
      } else {
        const nx = t.nx, ny = t.ny, px = -ny * t.w / 2, py = nx * t.w / 2, ex = t.x + nx * t.len, ey = t.y + ny * t.len;
        const poly = [{ x: t.x + px, y: t.y + py }, { x: ex + px, y: ey + py }, { x: ex - px, y: ey - py }, { x: t.x - px, y: t.y - py }];
        g.fillStyle(0xff3b2a, a); g.fillPoints(poly, true); g.lineStyle(3, 0xff6b5a, 0.9); g.strokePoints(poly, true);
        const q = [{ x: t.x + px, y: t.y + py }, { x: t.x + nx * t.len * p + px, y: t.y + ny * t.len * p + py }, { x: t.x + nx * t.len * p - px, y: t.y + ny * t.len * p - py }, { x: t.x - px, y: t.y - py }];
        g.fillStyle(0xff3b2a, 0.28); g.fillPoints(q, true);
      }
    }
    for (const m of this.meteors) { const p = m.t / m.dur; g.lineStyle(2, 0xc49bff, 0.8); g.strokeCircle(m.x, m.y, 100 * p); fx.fillStyle(0xe0c8ff, 1); fx.fillRect(m.x - 60 * (1 - p) - 5, m.y - 420 * (1 - p) - 5, 10, 10); fx.fillStyle(0x8a4be8, 0.6); fx.fillRect(m.x - 60 * (1 - p) - 3 + 14, m.y - 420 * (1 - p) - 3 - 20, 6, 20); }
    // hp bars
    for (const u of this.units) {
      if (!u.alive || u.isBoss) continue;
      const w = u.elite ? 54 : 44, x = Math.round(u.x - w / 2), y = Math.round(u.y - u.spriteH - 10);
      bg.fillStyle(0x000000, 0.75); bg.fillRect(x - 1, y - 1, w + 2, 7);
      bg.fillStyle(u.side === 'hero' ? 0x4caf50 : 0xc0392b, 1); bg.fillRect(x, y, Math.max(0, w * u.hp / u.maxHp), 5);
      if (u.shield > 0) { bg.fillStyle(0x8cd0ff, 0.9); bg.fillRect(x, y, Math.min(w, w * u.shield / u.maxHp), 2); }
      if (u.hero) { bg.fillStyle(0x000000, 0.75); bg.fillRect(x - 1, y + 6, w + 2, 4); bg.fillStyle(u.ult >= 100 ? 0xffe070 : 0x8a4be8, 1); bg.fillRect(x, y + 7, w * u.ult / 100, 2); }
    }
    for (const r of this.rings) { const p = r.t / r.dur, e = 1 - Math.pow(1 - p, 2); fx.lineStyle(4, r.col, 1 - p); fx.strokeCircle(r.x, r.y, r.r * e); }
    for (const b of this.beams) { const p = b.t / b.dur; fx.lineStyle(b.w * (1 - p) + 1, b.col, 1 - p); fx.lineBetween(b.x1, b.y1, b.x2, b.y2); }
    for (const p of this.proj) {
      if (p.kind === 'arrow') { fx.lineStyle(3, 0xe8e0c0, 1); fx.lineBetween(p.x, p.y, p.x - Math.cos(p.ang) * 22, p.y - Math.sin(p.ang) * 22); fx.fillStyle(0xffffff, 1); fx.fillRect(p.x - 2, p.y - 2, 4, 4); }
      else { const big = p.kind === 'void' ? 9 : 6; fx.fillStyle(p.col, 0.35); fx.fillRect(p.x - big - 4, p.y - big - 4, big * 2 + 8, big * 2 + 8); fx.fillStyle(p.col, 1); fx.fillRect(p.x - big, p.y - big, big * 2, big * 2); fx.fillStyle(0xffffff, 1); fx.fillRect(p.x - big / 2, p.y - big / 2, big, big); }
    }
    for (const p of this.parts) { fx.fillStyle(p.col, Math.max(0, 1 - p.t / p.life)); fx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); }
  }
  destroy() {
    this.units.forEach(u => u.destroy()); this.texts.forEach(t => t.obj.destroy());
    this.groundGfx.destroy(); this.barGfx.destroy(); this.fxGfx.destroy();
  }
};
